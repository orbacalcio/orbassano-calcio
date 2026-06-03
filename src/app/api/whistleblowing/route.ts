import { NextResponse, type NextRequest } from "next/server";
import {
  EMAIL_DIVIDER,
  emailLinkRow,
  emailParagraph,
  emailRow,
  emailSection,
  renderEmailShell,
} from "@/lib/email-shell";
import { FEATURES } from "@/lib/features";
import { CLUB_EMAIL, sendTransactionalEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
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
    ? `<p style="margin:0 0 8px;color:#e91f22;font-weight:bold;font-size:14px;">SEGNALAZIONE ANONIMA</p>
<p style="margin:0;color:#626f8d;font-size:13px;line-height:1.5;">Il segnalante non ha lasciato dati identificativi (art. 11.5 del Codice Etico).</p>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
${[
  emailRow("Cognome e Nome", escapeHtml(p.data.cognomeNome || "—")),
  emailRow(
    "Ruolo",
    `${escapeHtml(p.data.ruolo || "—")}${p.data.ruoloAltro ? ` (${escapeHtml(p.data.ruoloAltro)})` : ""}`,
  ),
  emailLinkRow(
    "Email",
    `mailto:${escapeHtml(p.data.email)}`,
    escapeHtml(p.data.email || "—"),
  ),
  emailRow("Telefono", escapeHtml(p.data.telefono || "—")),
  emailRow(
    "Consenso ricontatto",
    p.data.consensoRicontatto ? "Sì" : "No",
  ),
].join("\n")}
</table>`;

  const periodoBlock = `<p style="margin:0;color:#0A1428;font-size:14px;">
${p.data.dataPeriodoInizio ? `Dal <strong>${escapeHtml(p.data.dataPeriodoInizio)}</strong>` : "Inizio non indicato"}${p.data.dataPeriodoFine ? ` al <strong>${escapeHtml(p.data.dataPeriodoFine)}</strong>` : " <em style='color:#626f8d;'>(non indicata fine, fatti potenzialmente in corso)</em>"}
</p>${p.data.luogo ? `\n<p style="margin:8px 0 0;color:#626f8d;font-size:13px;">Luogo: ${escapeHtml(p.data.luogo)}</p>` : ""}`;

  const docBlock = `<p style="margin:0;color:#0A1428;font-size:14px;">${p.data.hasAllegati ? "Il segnalante dichiara di avere documentazione." : "Nessuna documentazione dichiarata."}</p>${
    p.data.hasAllegati && p.data.notaAllegati
      ? `\n<p style="margin:8px 0 0;color:#626f8d;font-size:13px;">${escapeHtml(p.data.notaAllegati)}</p>`
      : ""
  }`;

  const content = `<p style="margin:0 0 8px;color:#626f8d;font-size:13px;line-height:1.5;">
  Protocollo <strong style="color:#0A1428;font-family:monospace;">${escapeHtml(p.protocollo)}</strong> · Ricevuta il ${escapeHtml(new Date(p.ricevutaIl).toLocaleString("it-IT"))}
</p>

${emailSection("Identità segnalante", segnalanteBlock)}

${emailSection(
  "Tipologie segnalate",
  `<ul style="margin:0;padding-left:20px;color:#0A1428;font-size:14px;line-height:1.7;">${tipologiePretty}</ul>${
    p.data.tipologiaAltro
      ? `\n<p style="margin:8px 0 0;color:#626f8d;font-size:13px;">Specifica &quot;Altro&quot;: ${escapeHtml(p.data.tipologiaAltro)}</p>`
      : ""
  }`,
)}

${emailSection("Periodo dei fatti", periodoBlock)}

${
  p.data.personeCoinvolte
    ? emailSection(
        "Persone coinvolte",
        emailParagraph(escapeHtml(p.data.personeCoinvolte)),
      )
    : ""
}

${emailSection("Descrizione fatti", emailParagraph(escapeHtml(p.data.descrizione)))}

${
  p.data.testimoni
    ? emailSection("Testimoni", emailParagraph(escapeHtml(p.data.testimoni)))
    : ""
}

${emailSection("Documentazione", docBlock)}

${
  p.data.giaSegnalato === "si"
    ? emailSection(
        "Già segnalato altrove",
        emailParagraph(escapeHtml(p.data.giaSegnalatoSpecifica)),
      )
    : ""
}

${EMAIL_DIVIDER}
<p style="margin:0;color:#626f8d;font-size:11px;line-height:1.6;">
  IP hash audit (no tracking): <code style="color:#0A1428;background:#f0f2f5;padding:2px 6px;border-radius:4px;">${escapeHtml(p.ipHash)}</code><br/>
  Apri il record nel CMS per gestire l'istruttoria: cerca il protocollo <strong style="color:#0A1428;">${escapeHtml(p.protocollo)}</strong> sotto <em>Governance &amp; trasparenza → Segnalazioni (RISERVATE)</em>.<br/>
  <em>Comunicazione strettamente riservata al Direttivo + Responsabile Safeguarding (art. 11.6 Codice Etico).</em>
</p>`;

  return renderEmailShell({
    eyebrow: "Codice Etico · Riservato",
    title: "Nuova segnalazione",
    subtitle: `Protocollo ${escapeHtml(p.protocollo)}`,
    contentHtml: content,
    footerNote:
      "ASD Orbassano Calcio · Direttivo + Responsabile Safeguarding · Riservatezza art. 11.6 CE",
  });
}

function renderConfirmationEmail(p: { protocollo: string }): string {
  const content = `<p style="margin:0 0 16px;color:#0A1428;font-size:14px;line-height:1.6;">
  Abbiamo ricevuto la tua segnalazione. Il protocollo univoco assegnato è:
</p>
<p style="margin:0 0 24px;padding:18px;background:#f0f2f5;border-left:4px solid #e91f22;border-radius:6px;font-family:monospace;font-size:22px;color:#0A1428;font-weight:bold;text-align:center;letter-spacing:0.04em;">
  ${escapeHtml(p.protocollo)}
</p>

<p style="margin:0 0 16px;color:#0A1428;font-size:14px;line-height:1.6;">
  Conserva questo numero per le comunicazioni future. Il Direttivo e il Responsabile Safeguarding (quando in carica) avvieranno l'istruttoria entro 30-60 giorni dalla ricezione (art. 11.11 del Codice Etico).
</p>
<p style="margin:0;color:#0A1428;font-size:14px;line-height:1.6;">
  Se hai consentito al ricontatto, potremo cercarti per chiarimenti e per comunicarti l'esito.
</p>

${EMAIL_DIVIDER}

<p style="margin:0 0 12px;color:#626f8d;font-size:12px;line-height:1.6;">
  Ti ricordiamo che la tua segnalazione è coperta da riservatezza (art. 11.6 del Codice) e che è fatto divieto di ritorsioni nei tuoi confronti (art. 11.7).
</p>
<p style="margin:0;color:#626f8d;font-size:12px;line-height:1.6;">
  Per emergenze immediate (abuso in corso, pericolo per minori, reato in atto) contatta direttamente le forze dell'ordine al numero unico <strong style="color:#0A1428;">112</strong>.
</p>`;
  return renderEmailShell({
    eyebrow: "ASD Orbassano Calcio · Codice Etico",
    title: "Conferma ricezione segnalazione",
    contentHtml: content,
  });
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

  // 3. Rate limit IP-hashed: 3 segnalazioni/ora/IP.
  const rl = checkRateLimit({
    req,
    bucket: "whistleblowing",
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Hai gia' inviato troppe segnalazioni. Riprova fra ${Math.ceil(rl.retryAfter / 60)} minuti.`,
      },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }
  const ipHash = rl.ipHash;

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
