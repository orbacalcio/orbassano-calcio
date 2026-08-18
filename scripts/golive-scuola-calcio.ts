/**
 * Go-live Scuola Calcio 2026/2027 — allineamento contenuti Sanity.
 *
 * Il codice del sito ha fallback editoriali corretti (categoria
 * Esordienti, annate 2015 e 2014, calcio a 9), ma i 4 singleton su
 * Sanity sono gia' popolati dal seed del 2026-06-09 e VINCONO sui
 * fallback. Senza questo script il sito pubblicherebbe ancora "Dai 5
 * ai 13 anni" e le quattro fasce Piccoli Amici / Primi Calci /
 * Pulcini / Esordienti.
 *
 * Decisioni utente 2026-08-17:
 * - unica categoria attiva: Esordienti, annate 2015 e 2014
 * - nessun documento squadra: la Scuola Calcio e' una sezione
 *   editoriale, le annate vivono dentro le sue pagine
 * - SEDE: da decidere. I campi restano su Studio ma vuoti, e la card
 *   "Sede" non viene renderizzata finche' l'admin non li compila.
 * - ORARI ALLENAMENTI: da decidere. `scProgTimeline` svuotato, la
 *   sezione "Settimana tipo" del programma sparisce dalla pagina.
 * - PREZZI: da decidere. Tabella quote, sconti e scadenze pagamento
 *   svuotati; le rispettive sezioni spariscono dalla pagina.
 * - MODULO PDF: non previsto. L'iscrizione la cura la segreteria, la
 *   card "Modulo iscrizione" non viene renderizzata (showModule=false
 *   in /scuola-calcio/iscriviti) e i testi non la citano piu'.
 *
 * Usa `patch().set()` / `.unset()` con selettori per `_key` dove
 * possibile: tocca SOLO i campi elencati, gli edit manuali dell'admin
 * sugli altri campi restano intatti. Sicuro da rilanciare.
 *
 * Uso:
 *   pnpm tsx --env-file=.env.local scripts/golive-scuola-calcio.ts --dry-run
 *   pnpm tsx --env-file=.env.local scripts/golive-scuola-calcio.ts
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
// 2026-06-09 e ritoccati dall'admin. Se un item e' stato cancellato e
// ricreato da Studio la patch su quel path non trova nulla: Sanity
// ignora il singolo path, gli altri passano.
const HOME_SET: Record<string, unknown> = {
  // "Orbassano Soccer Academy" → la sezione si chiama Scuola Calcio
  // su tutte le superfici (richiesta utente 2026-08-17).
  scHeroEyebrow: "Scuola Calcio",

  scIntroBlocks: [
    block(
      "La Scuola Calcio dell'Orbassano Calcio è il primo passo nel grande gioco. Per la stagione 2026/2027 ripartiamo dalla categoria Esordienti, annate 2015 e 2014: calcio a 9, sotto la guida di tecnici qualificati FIGC.",
    ),
    block(
      "Qui i ragazzi scoprono il calcio come sport, come gruppo e come scuola di vita, in un'atmosfera familiare che li accompagna fino al passaggio nel Settore Giovanile Scolastico.",
    ),
  ],

  // USP 02: il testo dell'admin descriveva nel dettaglio il Centro
  // Sportivo Summer 40 (campi, spogliatoi, ristorazione). L'impianto
  // non e' ancora deciso, quindi resta il concetto — sicurezza e
  // qualita' della struttura — senza nominarlo.
  'scUspCards[_key=="1212ec79f926"].title': "Sicurezza al primo posto",
  'scUspCards[_key=="1212ec79f926"].description':
    "Impianto omologato, assicurazione FIGC inclusa e personale qualificato per il pronto intervento. Spogliatoi e accessi dedicati alle famiglie. La sede della stagione 2026/2027 viene comunicata a breve.",

  // USP 03: "risultati in secondo piano fino agli Esordienti" non
  // regge piu' ora che gli Esordienti sono l'unica categoria attiva.
  'scUspCards[_key=="69c0a8cc800f"].title': "Il gioco prima del risultato",
  'scUspCards[_key=="69c0a8cc800f"].description':
    "Agli Esordienti si passa al calcio a 9 e si comincia a competere davvero. Ma nelle nostre sedute vengono prima il divertimento, l'autonomia tecnica e il rispetto del compagno: nessun ragazzo resta in panchina per la classifica.",

  'scFaq[_key=="92d52ce5503c"].question': "Quali annate accogliete?",
  'scFaq[_key=="92d52ce5503c"].answer':
    "Per la stagione 2026/2027 la Scuola Calcio è attiva sulla categoria Esordienti: annate 2015 e 2014, calcio a 9. I nati nel 2013 e prima trovano posto nelle squadre del Settore Giovanile Scolastico (Giovanissimi e Allievi).",
  'scFaq[_key=="f74abb439568"].answer':
    "La programmazione settimanale della stagione 2026/2027 è in fase di definizione. Appena è pronta la pubblichiamo qui e la segreteria la comunica alle famiglie iscritte.",
  'scFaq[_key=="b29fc380756f"].answer':
    "Dopo la prova gratuita è la segreteria a occuparsi dell'iscrizione: raccoglie dati e documenti e ti indica come effettuare il bonifico della quota.",
  'scFaq[_key=="55a310241e35"].answer':
    "Certo. Agli Esordienti il lavoro dei portieri è differenziato, con sedute specifiche curate da un preparatore qualificato.",
};

// ─── academy-programma ───────────────────────────────────────────────
// Sostituzione strutturale: da 4 fasce (5-13 anni) alle 2 annate
// attive. Etichette e formato di gioco presi dalla grafica ufficiale
// del club: ESORDIENTI · CALCIO A 9 · 2015 2014.
const PROG_FASCE = [
  {
    _type: "object",
    _key: key(),
    label: "Esordienti 2015",
    ageRange: "Calcio a 9 · primo anno",
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
    ageRange: "Calcio a 9 · secondo anno",
    order: 2,
    focus: [
      block(
        "Secondo anno di calcio a 9. Tattica di base, gestione delle transizioni, ruoli più definiti. È l'anno che prepara il passaggio ai Giovanissimi del Settore Giovanile Scolastico.",
      ),
    ],
  },
];

// Orari allenamenti non ancora definiti (decisione utente
// 2026-08-17): la timeline va svuotata, non riscritta. Il campo resta
// su Studio e la sezione ricompare da sola quando l'admin lo popola.
const PROG_UNSET = ["scProgTimeline"];

// ─── academy-informazioni ────────────────────────────────────────────
const INFO_SET: Record<string, unknown> = {
  scInfoAgeRange: "Annate 2015 e 2014 · categoria Esordienti",
  scInfoHeroPitch:
    "Tutto quello che ti serve sapere prima di iscrivere tuo figlio alla stagione rossoblù.",
  // Le due risposte citavano l'erba sintetica di un campo specifico.
  'scInfoFaq[_key=="5bda5b82de4e"].answer':
    "Borraccia personale, scarpe da calcio adatte al fondo del campo e parastinchi. Il kit ufficiale viene consegnato dopo l'iscrizione.",
  'scInfoFaq[_key=="ac3d6433525f"].answer':
    "Gli allenamenti proseguono normalmente. Solo in caso di temporale o allerta meteo il club comunica l'annullamento via gruppo genitori.",
};

// Campi svuotati: sede e tutto quello che riguarda gli importi.
// Restano editabili da Studio — appena l'admin li compila le sezioni
// ricompaiono da sole, senza toccare il codice.
const INFO_UNSET = [
  'scInfoFaq[_key=="f2658eb8972c"]', // "Dove si trova il Centro Sportivo Aldo Porta?"
  "scInfoVenueName",
  "scInfoVenueAddress",
  "scInfoMapsUrl",
  "scInfoPriceTable",
  "scInfoDiscounts",
  "scInfoPayments",
];

// ─── academy-iscriviti ───────────────────────────────────────────────
const ISCR_SET: Record<string, unknown> = {
  scIscrIntro: [
    block(
      "Iscriversi alla Scuola Calcio dell'Orbassano è semplice: una prova gratuita per conoscerci, poi ci pensa la segreteria. Per la stagione 2026/2027 sono aperte le iscrizioni per la categoria Esordienti, annate 2015 e 2014. Nessun modulo da scaricare e nessun form online: raccogliamo noi dati e documenti e ti accompagniamo in ogni passaggio.",
    ),
  ],
};

// La nota parlava di rate e sconto fratelli: condizioni commerciali
// non ancora fissate. Via finche' non ci sono le quote.
const ISCR_UNSET = ["scIscrPaymentNote"];

type Step = {
  id: string;
  label: string;
  set?: Record<string, unknown>;
  unset?: string[];
};

const STEPS: Step[] = [
  {
    id: "academy-home",
    label: "Scuola Calcio — Pagina home",
    set: HOME_SET,
  },
  {
    id: "academy-programma",
    label: "Scuola Calcio — Programma tecnico",
    set: { scProgFasce: PROG_FASCE },
    unset: PROG_UNSET,
  },
  {
    id: "academy-informazioni",
    label: "Scuola Calcio — Informazioni",
    set: INFO_SET,
    unset: INFO_UNSET,
  },
  {
    id: "academy-iscriviti",
    label: "Scuola Calcio — Pagina iscrizione",
    set: ISCR_SET,
    unset: ISCR_UNSET,
  },
];

async function main() {
  console.log(
    `Go-live Scuola Calcio → projectId=${projectId} dataset=${dataset}` +
      (dryRun ? " [DRY RUN]" : "") +
      "\n",
  );

  for (const step of STEPS) {
    const setPaths = Object.keys(step.set ?? {});
    const unsetPaths = step.unset ?? [];
    if (dryRun) {
      console.log(`  · ${step.label} (${step.id})`);
      for (const p of setPaths) console.log(`      set   ${p}`);
      for (const p of unsetPaths) console.log(`      unset ${p}`);
      continue;
    }
    try {
      let patch = client.patch(step.id);
      if (setPaths.length > 0) patch = patch.set(step.set ?? {});
      if (unsetPaths.length > 0) patch = patch.unset(unsetPaths);
      await patch.commit({ visibility: "async" });
      console.log(
        `  ✓ ${step.label} (${step.id}) — ${setPaths.length} set, ${unsetPaths.length} unset`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${step.label} (${step.id}) →`, msg);
    }
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
