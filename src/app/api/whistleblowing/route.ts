import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { FEATURES } from "@/lib/features";
import { CLUB_EMAIL, sendTransactionalEmail } from "@/lib/mailer";
import {
  isEmail,
  isInList,
  isIsoDate,
  minLength,
  nonEmpty,
  trimToMax,
  escapeHtml,
} from "@/lib/validation";
import { sanityClient } from "@/sanity/client";
import { sanityWriteClient } from "@/sanity/writeClient";

/**
 * API route segnalazioni Codice Etico (whistleblowing).
 *
 * Pipeline:
 *  1. Gate feature flag governance (404 se off)
 *  2. Honeypot: rifiuta se compilato (bot)
 *  3. Rate limit IP-based in-memory: max 3/h/IP
 *  4. Parse + validazione payload
 *  5. Genera protocollo WB-YYYY-NNNN via counter Sanity + retry su conflict
 *  6. Crea documento Sanity con _id deterministico
 *  7. Email al Direttivo (riferimentiOperativi.emailSegnalazioni o fallback)
 *  8. Email conferma al segnalante (se firmato + consensoRicontatto + email)
 *  9. Ritorna { ok: true, protocollo }
 *
 * Privacy:
 *  - IP raw NON salvato. Solo SHA-256 del /24 (primi 3 ottetti per IPv4)
 *    come ipHash, per audit/correlation.
 *  - Email di conferma al segnalante NON contiene il testo della
 *    segnalazione (solo numero protocollo). Riservatezza al Direttivo.
 *
 * Anti-bot Turnstile (M9): vedi FEATURES.turnstileEnabled. Implementazione
 * stub gia' predisposta come commento + TODO.
 */

// Tipologie segnalabili (devono coincidere con lo schema Sanity).
const TIPOLOGIE_VALIDE = [
  "tutela_minori",
  "conflitto_interesse",
  "comportamento_campo",
  "doping",
  "match_fixing",
  "social_media",
  "riservatezza_dati",
  "patrimonio",
  "sponsor",
  "contributi_pubblici",
  "altro",
] as const;

const RUOLI_VALIDI = [
  "tesserato_maggiorenne",
  "genitore",
  "tecnico",
  "dirigente",
  "volontario",
  "sponsor",
  "altro",
] as const;

const GIA_SEGNALATO_VALIDI = ["no", "si"] as const;

const MAX_PROTOCOLLO_RETRIES = 5;
const MAX_RATE_LIMIT_HOUR = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 ora

// Map module-level: persiste tra richieste sulla stessa istanza serverless.
// Su Vercel cold start si azzera (accettabile per MVP — vedi spec).
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIpHash(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const raw = fwd?.split(",")[0]?.trim() ?? real?.trim() ?? "unknown";
  // Per IPv4 prendiamo i primi 3 ottetti (/24); per IPv6 i primi 4 gruppi.
  let normalized = raw;
  const v4 = raw.match(/^(\d+)\.(\d+)\.(\d+)\.\d+$/);
  if (v4) {
    normalized = `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  } else if (raw.includes(":")) {
    normalized = raw.split(":").slice(0, 4).join(":") + "::/64";
  }
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

function checkRateLimit(ipHash: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ipHash);
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(ipHash, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { ok: true };
  }
  if (entry.count >= MAX_RATE_LIMIT_HOUR) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true };
}

type Payload = Record<string, unknown>;

type ParsedSegnalazione = {
  isAnonimo: boolean;
  cognomeNome: string;
  ruolo: string;
  ruoloAltro: string;
  email: string;
  telefono: string;
  consensoRicontatto: boolean;
  tipologie: string[];
  tipologiaAltro: string;
  dataPeriodoInizio: string;
  dataPeriodoFine: string;
  luogo: string;
  personeCoinvolte: string;
  descrizione: string;
  testimoni: string;
  hasAllegati: boolean;
  notaAllegati: string;
  dichiarazioneBuonaFede: boolean;
  dichiarazioneTutela: boolean;
  giaSegnalato: "no" | "si";
  giaSegnalatoSpecifica: string;
};

function parseAndValidate(
  body: Payload,
): { ok: true; data: ParsedSegnalazione } | { ok: false; error: string } {
  const isAnonimo = body.isAnonimo === true;

  const cognomeNome = trimToMax(String(body.cognomeNome ?? ""), 200);
  const ruoloRaw = String(body.ruolo ?? "");
  const ruolo = ruoloRaw && isInList(ruoloRaw, RUOLI_VALIDI) ? ruoloRaw : "";
  const ruoloAltro = trimToMax(String(body.ruoloAltro ?? ""), 200);
  const email = trimToMax(String(body.email ?? ""), 180);
  const telefono = trimToMax(String(body.telefono ?? ""), 40);
  const consensoRicontatto = body.consensoRicontatto === true;

  // Tipologie: array di string filtrate sull'enum
  const tipologieRaw = Array.isArray(body.tipologie) ? body.tipologie : [];
  const tipologie = tipologieRaw
    .map((t) => String(t))
    .filter((t) => isInList(t, TIPOLOGIE_VALIDE));
  const tipologiaAltro = trimToMax(String(body.tipologiaAltro ?? ""), 500);

  const dataPeriodoInizio = trimToMax(String(body.dataPeriodoInizio ?? ""), 20);
  const dataPeriodoFine = trimToMax(String(body.dataPeriodoFine ?? ""), 20);
  const luogo = trimToMax(String(body.luogo ?? ""), 300);
  const personeCoinvolte = trimToMax(String(body.personeCoinvolte ?? ""), 1000);
  const descrizione = trimToMax(String(body.descrizione ?? ""), 8000);
  const testimoni = trimToMax(String(body.testimoni ?? ""), 1000);

  const hasAllegati = body.hasAllegati === true;
  const notaAllegati = trimToMax(String(body.notaAllegati ?? ""), 1000);

  const dichiarazioneBuonaFede = body.dichiarazioneBuonaFede === true;
  const dichiarazioneTutela = body.dichiarazioneTutela === true;
  const giaSegnalatoRaw = String(body.giaSegnalato ?? "no");
  const giaSegnalato = isInList(giaSegnalatoRaw, GIA_SEGNALATO_VALIDI)
    ? giaSegnalatoRaw
    : "no";
  const giaSegnalatoSpecifica = trimToMax(
    String(body.giaSegnalatoSpecifica ?? ""),
    1000,
  );

  // Validazioni obbligatorie
  if (!minLength(descrizione, 50)) {
    return {
      ok: false,
      error: "La descrizione deve contenere almeno 50 caratteri.",
    };
  }
  if (tipologie.length === 0) {
    return {
      ok: false,
      error: "Seleziona almeno una tipologia di segnalazione.",
    };
  }
  if (!dichiarazioneBuonaFede || !dichiarazioneTutela) {
    return {
      ok: false,
      error:
        "Per inviare la segnalazione devi accettare le dichiarazioni di buona fede e di riconoscimento delle tutele.",
    };
  }
  if (giaSegnalato === "si" && !nonEmpty(giaSegnalatoSpecifica)) {
    return {
      ok: false,
      error:
        "Specifica a chi era stato segnalato precedentemente, oppure scegli 'No'.",
    };
  }
  // Date opzionali ma se valorizzate devono essere ISO date valide
  if (dataPeriodoInizio && !isIsoDate(dataPeriodoInizio)) {
    return { ok: false, error: "Data di inizio non valida." };
  }
  if (dataPeriodoFine && !isIsoDate(dataPeriodoFine)) {
    return { ok: false, error: "Data di fine non valida." };
  }
  // Se non anonimo, l'email se valorizzata deve essere valida
  if (!isAnonimo && email && !isEmail(email)) {
    return { ok: false, error: "Email non valida." };
  }
  // Se consenso ricontatto, serve almeno email
  if (!isAnonimo && consensoRicontatto && !isEmail(email)) {
    return {
      ok: false,
      error:
        "Hai chiesto di essere ricontattato: lascia un'email valida oppure rimuovi il consenso al ricontatto.",
    };
  }

  return {
    ok: true,
    data: {
      isAnonimo,
      cognomeNome: isAnonimo ? "" : cognomeNome,
      ruolo: isAnonimo ? "" : ruolo,
      ruoloAltro: isAnonimo ? "" : ruoloAltro,
      email: isAnonimo ? "" : email,
      telefono: isAnonimo ? "" : telefono,
      consensoRicontatto: isAnonimo ? false : consensoRicontatto,
      tipologie,
      tipologiaAltro,
      dataPeriodoInizio,
      dataPeriodoFine,
      luogo,
      personeCoinvolte,
      descrizione,
      testimoni,
      hasAllegati,
      notaAllegati,
      dichiarazioneBuonaFede,
      dichiarazioneTutela,
      giaSegnalato,
      giaSegnalatoSpecifica,
    },
  };
}

async function generateProtocollo(year: number): Promise<string> {
  const prefix = `WB-${year}-`;
  // Read client OK qui: il count e' info quasi-pubblica (anche se i doc
  // sono privati, il numero in se non lo e'). In ogni caso, il
  // duplicato e' gestito dal retry su conflict in createWithRetry.
  const count = await sanityClient.fetch<number>(
    `count(*[_type == "segnalazione" && string::startsWith(protocollo, $prefix)])`,
    { prefix },
  );
  const next = String(count + 1).padStart(4, "0");
  return `${prefix}${next}`;
}

async function createSegnalazioneWithRetry(args: {
  data: ParsedSegnalazione;
  ipHash: string;
}): Promise<{ ok: true; protocollo: string; _id: string } | { ok: false; error: string }> {
  const { data, ipHash } = args;
  const year = new Date().getFullYear();
  const ricevutaIl = new Date().toISOString();

  for (let attempt = 0; attempt < MAX_PROTOCOLLO_RETRIES; attempt++) {
    let protocollo: string;
    try {
      protocollo = await generateProtocollo(year);
    } catch (err) {
      console.error("[whistleblowing] count fetch fallito:", err);
      return { ok: false, error: "Errore generazione protocollo." };
    }
    const _id = `segnalazione.${protocollo}`;
    try {
      await sanityWriteClient.create({
        _id,
        _type: "segnalazione",
        protocollo,
        ricevutaIl,
        isAnonimo: data.isAnonimo,
        ipHash,
        segnalante: data.isAnonimo
          ? undefined
          : {
              cognomeNome: data.cognomeNome || undefined,
              ruolo: data.ruolo || undefined,
              ruoloAltro: data.ruoloAltro || undefined,
              email: data.email || undefined,
              telefono: data.telefono || undefined,
              consensoRicontatto: data.consensoRicontatto,
            },
        tipologie: data.tipologie,
        tipologiaAltro: data.tipologiaAltro || undefined,
        dataPeriodoInizio: data.dataPeriodoInizio || undefined,
        dataPeriodoFine: data.dataPeriodoFine || undefined,
        luogo: data.luogo || undefined,
        personeCoinvolte: data.personeCoinvolte || undefined,
        descrizione: data.descrizione,
        testimoni: data.testimoni || undefined,
        hasAllegati: data.hasAllegati,
        notaAllegati: data.hasAllegati ? data.notaAllegati || undefined : undefined,
        dichiarazioneBuonaFede: data.dichiarazioneBuonaFede,
        dichiarazioneTutela: data.dichiarazioneTutela,
        giaSegnalato: data.giaSegnalato,
        giaSegnalatoSpecifica:
          data.giaSegnalato === "si" ? data.giaSegnalatoSpecifica || undefined : undefined,
        stato: "ricevuta",
      });
      return { ok: true, protocollo, _id };
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 409) {
        // Conflict: protocollo gia' usato (race), riprova con count+1
        continue;
      }
      console.error("[whistleblowing] create fallito:", err);
      return {
        ok: false,
        error: "Errore di salvataggio. Riprova fra qualche minuto.",
      };
    }
  }
  return {
    ok: false,
    error: "Impossibile generare protocollo univoco. Riprova fra qualche minuto.",
  };
}

async function fetchInboxEmail(): Promise<string> {
  // 1. Prova a leggere dal singleton riferimentiOperativi
  try {
    const data = await sanityClient.fetch<{ emailSegnalazioni?: string | null } | null>(
      `*[_type == "riferimentiOperativi"][0]{ emailSegnalazioni }`,
      {},
    );
    if (data?.emailSegnalazioni && isEmail(data.emailSegnalazioni)) {
      return data.emailSegnalazioni;
    }
  } catch {
    /* fallthrough */
  }
  // 2. Fallback env
  const envInbox = process.env.WHISTLEBLOWING_INBOX_EMAIL;
  if (envInbox && isEmail(envInbox)) return envInbox;
  // 3. Ultima risorsa: club email generica (con warning)
  console.warn(
    "[whistleblowing] emailSegnalazioni non configurata. Fallback a CLUB_EMAIL — riservatezza ridotta.",
  );
  return CLUB_EMAIL;
}

function renderInternalEmail(p: {
  protocollo: string;
  ricevutaIl: string;
  ipHash: string;
  data: ParsedSegnalazione;
}): string {
  const tipologieLabels: Record<string, string> = {
    tutela_minori: "Tutela minori",
    conflitto_interesse: "Conflitto di interesse",
    comportamento_campo: "Comportamento in campo",
    doping: "Doping / sostanze",
    match_fixing: "Match-fixing / scommesse",
    social_media: "Social media / immagine",
    riservatezza_dati: "Riservatezza dati",
    patrimonio: "Patrimonio / risorse",
    sponsor: "Sponsor / fornitori",
    contributi_pubblici: "Contributi pubblici / 5×1000",
    altro: "Altro",
  };
  const tipologiePretty = p.data.tipologie
    .map((t) => tipologieLabels[t] ?? t)
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");

  const segnalanteBlock = p.data.isAnonimo
    ? `<p style="color:#EA1D22; font-weight:bold;">SEGNALAZIONE ANONIMA</p>
       <p style="color:#A8B5CC;">Il segnalante non ha lasciato dati identificativi (art. 11.5 del Codice Etico).</p>`
    : `
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:6px 0; color:#A8B5CC; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Cognome e Nome</td><td style="padding:6px 0; color:#F5F7FA;">${escapeHtml(p.data.cognomeNome || "—")}</td></tr>
        <tr><td style="padding:6px 0; color:#A8B5CC; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Ruolo</td><td style="padding:6px 0; color:#F5F7FA;">${escapeHtml(p.data.ruolo || "—")}${p.data.ruoloAltro ? ` (${escapeHtml(p.data.ruoloAltro)})` : ""}</td></tr>
        <tr><td style="padding:6px 0; color:#A8B5CC; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(p.data.email)}" style="color:#C9A35D;">${escapeHtml(p.data.email || "—")}</a></td></tr>
        <tr><td style="padding:6px 0; color:#A8B5CC; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Telefono</td><td style="padding:6px 0; color:#F5F7FA;">${escapeHtml(p.data.telefono || "—")}</td></tr>
        <tr><td style="padding:6px 0; color:#A8B5CC; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Consenso ricontatto</td><td style="padding:6px 0; color:#F5F7FA;">${p.data.consensoRicontatto ? "Sì" : "No"}</td></tr>
      </table>`;

  return `
    <!doctype html>
    <html lang="it">
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#0A1428; color:#F5F7FA;">
        <h1 style="font-size: 22px; color:#C9A35D; margin: 0 0 8px;">Nuova segnalazione · Codice Etico</h1>
        <p style="color:#A8B5CC; font-size:13px; margin: 0 0 24px;">Protocollo <strong style="color:#F5F7FA;">${escapeHtml(p.protocollo)}</strong> · Ricevuta il ${escapeHtml(new Date(p.ricevutaIl).toLocaleString("it-IT"))}</p>

        <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Identità segnalante</h2>
        ${segnalanteBlock}

        <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Tipologie segnalate</h2>
        <ul style="margin:0; padding-left: 20px; color:#F5F7FA;">${tipologiePretty}</ul>
        ${p.data.tipologiaAltro ? `<p style="color:#A8B5CC; font-size:13px; margin:8px 0 0;">Specifica "Altro": ${escapeHtml(p.data.tipologiaAltro)}</p>` : ""}

        <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Periodo dei fatti</h2>
        <p style="color:#F5F7FA; margin:0;">
          ${p.data.dataPeriodoInizio ? `Dal <strong>${escapeHtml(p.data.dataPeriodoInizio)}</strong>` : "Inizio non indicato"}
          ${p.data.dataPeriodoFine ? ` al <strong>${escapeHtml(p.data.dataPeriodoFine)}</strong>` : " (non indicata fine, fatti potenzialmente in corso)"}
        </p>
        ${p.data.luogo ? `<p style="color:#A8B5CC; font-size:13px; margin:8px 0 0;">Luogo: ${escapeHtml(p.data.luogo)}</p>` : ""}

        ${p.data.personeCoinvolte ? `
          <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Persone coinvolte</h2>
          <p style="white-space: pre-wrap; line-height: 1.6; color:#F5F7FA; margin:0;">${escapeHtml(p.data.personeCoinvolte)}</p>
        ` : ""}

        <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Descrizione fatti</h2>
        <p style="white-space: pre-wrap; line-height: 1.6; color:#F5F7FA; margin:0;">${escapeHtml(p.data.descrizione)}</p>

        ${p.data.testimoni ? `
          <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Testimoni</h2>
          <p style="white-space: pre-wrap; line-height: 1.6; color:#F5F7FA; margin:0;">${escapeHtml(p.data.testimoni)}</p>
        ` : ""}

        <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Documentazione</h2>
        <p style="color:#F5F7FA; margin:0;">${p.data.hasAllegati ? "Il segnalante dichiara di avere documentazione." : "Nessuna documentazione dichiarata."}</p>
        ${p.data.hasAllegati && p.data.notaAllegati ? `<p style="color:#A8B5CC; font-size:13px; margin:8px 0 0;">${escapeHtml(p.data.notaAllegati)}</p>` : ""}

        ${p.data.giaSegnalato === "si" ? `
          <h2 style="font-size:14px; color:#C9A35D; text-transform:uppercase; letter-spacing:0.1em; margin: 24px 0 8px; border-bottom:1px solid #1F2F4D; padding-bottom:6px;">Già segnalato altrove</h2>
          <p style="color:#F5F7FA; margin:0;">${escapeHtml(p.data.giaSegnalatoSpecifica)}</p>
        ` : ""}

        <hr style="border:none; border-top:1px solid #1F2F4D; margin: 32px 0;" />
        <p style="color:#A8B5CC; font-size:11px; line-height:1.5;">
          IP hash audit (no tracking): <code style="color:#F5F7FA;">${escapeHtml(p.ipHash)}</code><br/>
          Apri il record nel CMS per gestire l'istruttoria: cerca il protocollo <strong>${escapeHtml(p.protocollo)}</strong> sotto <em>Governance & trasparenza → Segnalazioni (RISERVATE)</em>.<br/>
          <em>Comunicazione strettamente riservata al Direttivo + Responsabile Safeguarding (art. 11.6 Codice Etico).</em>
        </p>
      </body>
    </html>
  `;
}

function renderConfirmationEmail(p: { protocollo: string }): string {
  return `
    <!doctype html>
    <html lang="it">
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#0A1428; color:#F5F7FA;">
        <h1 style="font-size: 22px; color:#C9A35D; margin: 0 0 8px;">Conferma ricezione segnalazione</h1>
        <p style="color:#A8B5CC; font-size:13px; margin: 0 0 24px;">A.S.D. Orbassano Calcio · Codice Etico</p>

        <p style="color:#F5F7FA; line-height:1.6; margin:0 0 16px;">
          Abbiamo ricevuto la tua segnalazione. Il protocollo univoco assegnato e':
        </p>
        <p style="font-family: monospace; font-size: 24px; color:#C9A35D; font-weight:bold; padding: 16px; background:#1F2F4D; border-radius: 8px; text-align:center; margin: 0 0 24px;">
          ${escapeHtml(p.protocollo)}
        </p>

        <p style="color:#F5F7FA; line-height:1.6; margin:0 0 16px;">
          Conserva questo numero per le comunicazioni future. Il Direttivo e il Responsabile Safeguarding (quando in carica) avvieranno l'istruttoria entro 30-60 giorni dalla ricezione (art. 11.11 del Codice Etico).
        </p>
        <p style="color:#F5F7FA; line-height:1.6; margin:0 0 16px;">
          Se hai consentito al ricontatto, potremo cercarti per chiarimenti e per comunicarti l'esito.
        </p>

        <hr style="border:none; border-top:1px solid #1F2F4D; margin: 24px 0;" />
        <p style="color:#A8B5CC; font-size:12px; line-height:1.5;">
          Ti ricordiamo che la tua segnalazione e' coperta da riservatezza
          (art. 11.6 del Codice) e che e' fatto divieto di ritorsioni nei
          tuoi confronti (art. 11.7).
        </p>
        <p style="color:#A8B5CC; font-size:12px; line-height:1.5;">
          Per emergenze immediate (abuso in corso, pericolo per minori,
          reato in atto) contatta direttamente le forze dell'ordine al
          numero unico <strong style="color:#F5F7FA;">112</strong>.
        </p>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  // 0. Feature flag
  if (!FEATURES.governanceSection) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // TODO: enable Turnstile in M9 — when FEATURES.turnstileEnabled,
  // verify token from body.turnstileToken via POST to
  // https://challenges.cloudflare.com/turnstile/v0/siteverify

  // 1. Parse JSON
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload non valido." },
      { status: 400 },
    );
  }

  // 2. Honeypot
  if (typeof body._honeypot === "string" && body._honeypot.length > 0) {
    // Pretendi successo per non aiutare il bot a capire l'esito
    return NextResponse.json({ ok: true, protocollo: "WB-0000-0000" });
  }

  // 3. Rate limit
  const ipHash = getClientIpHash(req);
  const rl = checkRateLimit(ipHash);
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Hai gia' inviato troppe segnalazioni. Riprova fra ${Math.ceil(rl.retryAfter / 60)} minuti.`,
      },
      { status: 429 },
    );
  }

  // 4. Validazione
  const parsed = parseAndValidate(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  // 5-6. Crea documento Sanity
  const created = await createSegnalazioneWithRetry({ data: parsed.data, ipHash });
  if (!created.ok) {
    return NextResponse.json({ ok: false, error: created.error }, { status: 502 });
  }

  // 7. Email al Direttivo
  const inbox = await fetchInboxEmail();
  const internalHtml = renderInternalEmail({
    protocollo: created.protocollo,
    ricevutaIl: new Date().toISOString(),
    ipHash,
    data: parsed.data,
  });
  await sendTransactionalEmail({
    to: inbox,
    subject: `[Whistleblowing] Nuova segnalazione — Protocollo ${created.protocollo}`,
    html: internalHtml,
    replyTo:
      !parsed.data.isAnonimo &&
      parsed.data.consensoRicontatto &&
      isEmail(parsed.data.email)
        ? parsed.data.email
        : undefined,
  });

  // 8. Email conferma al segnalante (se firmato + consenso + email valida)
  if (
    !parsed.data.isAnonimo &&
    parsed.data.consensoRicontatto &&
    isEmail(parsed.data.email)
  ) {
    await sendTransactionalEmail({
      to: parsed.data.email,
      subject: `Conferma ricezione segnalazione — Protocollo ${created.protocollo}`,
      html: renderConfirmationEmail({ protocollo: created.protocollo }),
      replyTo: inbox,
    });
  }

  return NextResponse.json({ ok: true, protocollo: created.protocollo });
}
