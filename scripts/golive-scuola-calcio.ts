/**
 * Go-live Scuola Calcio 2026/2027 — allineamento contenuti Sanity.
 *
 * Il codice del sito ha fallback editoriali corretti (annate 2014 e
 * 2015, categoria Esordienti), ma i 4 singleton su Sanity sono gia'
 * popolati dal seed del 2026-06-09 e VINCONO sui fallback. Senza
 * questo script il sito pubblicherebbe ancora "Dai 5 ai 13 anni" e le
 * quattro fasce Piccoli Amici / Primi Calci / Pulcini / Esordienti.
 *
 * Usa `patch().set()` con selettori per `_key` dove possibile: tocca
 * SOLO i campi elencati, gli edit manuali dell'admin sugli altri campi
 * restano intatti. Sicuro da rilanciare (idempotente).
 *
 * Cosa NON tocca di proposito:
 * - `academy-home.scIntroBlocks` cita "Centro Sportivo Summer 40"
 *   mentre `academy-informazioni.scInfoVenueName` dice "Centro
 *   Sportivo Aldo Porta". E' una incoerenza preesistente nel CMS: va
 *   risolta dal club, non indovinata qui.
 * - quote, sconti, scadenze, contatti: dati amministrativi.
 *
 * Uso:
 *   pnpm tsx --env-file=.env.local scripts/golive-scuola-calcio.ts
 *   pnpm tsx --env-file=.env.local scripts/golive-scuola-calcio.ts --dry-run
 *   pnpm tsx --env-file=.env.local scripts/golive-scuola-calcio.ts --with-team
 *
 * `--with-team` rinomina anche il documento squadra `team.scuola-calcio`
 * in "Esordienti" (annate 2014 e 2015) con slug `esordienti`. Lo lascia
 * `isActive: false`: la pagina /squadre non ha una sezione "Scuola
 * Calcio" e lo slug `scuola-calcio` collide con la rotta editoriale
 * statica. Vedi nota in fondo al file.
 */
import "dotenv/config";

import { createClient } from "@sanity/client";
import { randomBytes } from "node:crypto";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error("Manca NEXT_PUBLIC_SANITY_PROJECT_ID. Compila .env.local.");
  process.exit(1);
}
if (!token) {
  console.error(
    "Manca SANITY_API_WRITE_TOKEN. Genera un token Editor su manage.sanity.io.",
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const withTeam = process.argv.includes("--with-team");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

const key = () => randomBytes(6).toString("hex");

/** Blocco Portable Text minimale da testo semplice. */
function block(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

// ─── academy-home ────────────────────────────────────────────────────
// I selettori `_key` corrispondono agli item creati dal seed del
// 2026-06-09. Se l'admin li ha cancellati e ricreati da Studio la
// patch non trova il path e non fa nulla: lo script lo segnala.
const HOME_PATCH: Record<string, unknown> = {
  scHeroEyebrow: "Scuola Calcio",
  // USP 03: la frase "fino agli Esordienti" non regge piu' ora che
  // gli Esordienti sono l'unica categoria attiva.
  'scUspCards[_key=="69c0a8cc800f"].title': "Il gioco prima del risultato",
  'scUspCards[_key=="69c0a8cc800f"].description':
    "Agli Esordienti si passa al calcio a 9 e si comincia a competere davvero. Ma nelle nostre sedute vengono prima il divertimento, l'autonomia tecnica e il rispetto del compagno: nessun ragazzo resta in panchina per la classifica.",
  'scFaq[_key=="92d52ce5503c"].question': "Quali annate accogliete?",
  'scFaq[_key=="92d52ce5503c"].answer':
    "Per la stagione 2026/2027 la Scuola Calcio è attiva sulla categoria Esordienti: annate 2014 e 2015. I nati nel 2013 e prima trovano posto nelle squadre del Settore Giovanile Scolastico (Giovanissimi e Allievi).",
  'scFaq[_key=="f74abb439568"].answer':
    "Due sedute settimanali da 90 minuti, più la partita del fine settimana. Gli orari definitivi vengono confermati dalla segreteria a inizio stagione.",
  'scFaq[_key=="55a310241e35"].answer':
    "Certo. Agli Esordienti il lavoro dei portieri è differenziato, con sedute specifiche curate da un preparatore qualificato.",
};

// Intro: riscritta per dichiarare le annate attive. Il nome
// dell'impianto resta quello scelto dall'admin ("Summer 40") — vedi
// nota sull'incoerenza in cima al file.
const HOME_INTRO = [
  block(
    "La Scuola Calcio dell'Orbassano Calcio è il primo passo nel grande gioco. Per la stagione 2026/2027 ripartiamo dalla categoria Esordienti, annate 2014 e 2015: calcio a 9, due allenamenti a settimana e la gara del fine settimana, sotto la guida di tecnici qualificati FIGC.",
  ),
  block(
    "Il Centro Sportivo Summer 40 è la nostra casa: erba sintetica, spogliatoi, materiali professionali e un'atmosfera familiare che accompagna i ragazzi fino al passaggio nel Settore Giovanile Scolastico.",
  ),
];

// ─── academy-programma ───────────────────────────────────────────────
// Sostituzione strutturale: da 4 fasce (5-13 anni) a 2 annate.
const PROG_FASCE = [
  {
    _type: "object",
    _key: key(),
    label: "Esordienti 2015",
    ageRange: "Primo anno · Under 12",
    order: 1,
    focus: [
      block(
        "Ingresso nel calcio a 9. Si consolidano i fondamentali — conduzione, passaggio, controllo orientato — e si scoprono i primi principi di gioco collettivo. Tutti ruotano su più ruoli.",
      ),
    ],
  },
  {
    _type: "object",
    _key: key(),
    label: "Esordienti 2014",
    ageRange: "Secondo anno · Under 13",
    order: 2,
    focus: [
      block(
        "Secondo anno di calcio a 9. Tattica di base, gestione delle transizioni, ruoli più definiti. È l'anno che prepara il passaggio ai Giovanissimi del Settore Giovanile Scolastico.",
      ),
    ],
  },
];

const PROG_TIMELINE = [
  {
    _type: "object",
    _key: key(),
    day: "Martedì",
    startTime: "18:00",
    endTime: "19:30",
    activity: "Allenamento Esordienti",
    ageGroup: "Annate 2014-2015",
  },
  {
    _type: "object",
    _key: key(),
    day: "Giovedì",
    startTime: "18:00",
    endTime: "19:30",
    activity: "Allenamento Esordienti",
    ageGroup: "Annate 2014-2015",
  },
  {
    _type: "object",
    _key: key(),
    day: "Sabato",
    startTime: "10:00",
    endTime: "11:30",
    activity: "Gara del fine settimana",
    ageGroup: "Annate 2014-2015",
  },
];

// ─── academy-informazioni ────────────────────────────────────────────
const INFO_PATCH: Record<string, unknown> = {
  scInfoAgeRange: "Annate 2014 e 2015 · categoria Esordienti",
  'scInfoPayments[_key=="617d1e2ebe98"].note':
    "Bonifico bancario con causale 'Iscrizione Scuola Calcio 2026/2027 + Nome Cognome del bambino + anno di nascita'.",
};

// ─── academy-iscriviti ───────────────────────────────────────────────
const ISCR_PATCH: Record<string, unknown> = {
  scIscrPaymentNote:
    "Il pagamento può essere effettuato in unica soluzione oppure in due tranche (50% all'iscrizione + 50% entro gennaio). Sconto fratelli: -10% sulla seconda quota. Causale bonifico: 'Iscrizione Scuola Calcio 2026/2027 + Nome Cognome del bambino + anno di nascita'.",
};

const ISCR_INTRO = [
  block(
    "Iscriversi alla Scuola Calcio dell'Orbassano è semplice: una prova gratuita per conoscerci, il modulo PDF da compilare, il bonifico della quota. Per la stagione 2026/2027 sono aperte le iscrizioni per la categoria Esordienti, annate 2014 e 2015. Niente form online, ci occupiamo noi di accompagnarti in ogni passaggio.",
  ),
];

type Step = { id: string; label: string; patch: Record<string, unknown> };

const STEPS: Step[] = [
  {
    id: "academy-home",
    label: "Scuola Calcio — Pagina home",
    patch: { ...HOME_PATCH, scIntroBlocks: HOME_INTRO },
  },
  {
    id: "academy-programma",
    label: "Scuola Calcio — Programma tecnico",
    patch: { scProgFasce: PROG_FASCE, scProgTimeline: PROG_TIMELINE },
  },
  {
    id: "academy-informazioni",
    label: "Scuola Calcio — Informazioni",
    patch: INFO_PATCH,
  },
  {
    id: "academy-iscriviti",
    label: "Scuola Calcio — Pagina iscrizione",
    patch: { ...ISCR_PATCH, scIscrIntro: ISCR_INTRO },
  },
];

// Squadra unica "Esordienti" (annate 2014 + 2015), scelta dall'utente
// 2026-08-17. Riusa il doc `team.scuola-calcio` gia' esistente invece
// di crearne uno nuovo e lasciarne uno orfano.
//
// isActive resta false: la pagina /squadre non ha una sezione per la
// macro-categoria "Scuola Calcio" (vedi SECTIONS in
// src/app/(site)/squadre/page.tsx), quindi la squadra non avrebbe
// nessun punto di ingresso. Slug spostato da `scuola-calcio` a
// `esordienti` perche' `/squadre/scuola-calcio` e' ora la rotta
// statica della sezione editoriale e vincerebbe sul segmento dinamico
// `[slug]`, rendendo la pagina squadra irraggiungibile.
const TEAM_PATCH: Record<string, unknown> = {
  name: "Esordienti",
  displayName: "Orbassano Calcio",
  slug: { _type: "slug", current: "esordienti" },
  category: "Scuola Calcio",
  subcategory: "Annate 2014 e 2015",
  season: "2026/2027",
  isActive: false,
};

async function main() {
  console.log(
    `Go-live Scuola Calcio → projectId=${projectId} dataset=${dataset}` +
      (dryRun ? " [DRY RUN]" : "") +
      "\n",
  );

  const steps = withTeam
    ? [
        ...STEPS,
        {
          id: "team.scuola-calcio",
          label: "Squadra Esordienti (slug → esordienti, resta disattivata)",
          patch: TEAM_PATCH,
        },
      ]
    : STEPS;

  for (const step of steps) {
    const paths = Object.keys(step.patch);
    if (dryRun) {
      console.log(`  · ${step.label} (${step.id})`);
      for (const p of paths) console.log(`      ${p}`);
      continue;
    }
    try {
      await client
        .patch(step.id)
        .set(step.patch)
        .commit({ visibility: "async" });
      console.log(`  ✓ ${step.label} (${step.id}) — ${paths.length} campi`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${step.label} (${step.id}) →`, msg);
    }
  }

  if (!withTeam) {
    console.log(
      "\nNB: documento squadra non toccato. Rilancia con --with-team per\n" +
        "    rinominare team.scuola-calcio in 'Esordienti' (resta disattivato).",
    );
  }

  console.log(
    dryRun
      ? "\nDry run completato: nessuna scrittura su Sanity."
      : "\nDone. Webhook Sanity → /api/revalidate aggiorna il sito.",
  );
}

main().catch((err: unknown) => {
  console.error("\n✗ Go-live Scuola Calcio fallito:", err);
  process.exit(1);
});
