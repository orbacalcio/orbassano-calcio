/**
 * Seed Sanity con i dati reali del club (DATA_ORBASSANO.md).
 *
 * Idempotente: usa createOrReplace con `_id` deterministici, quindi
 * puoi rilanciarlo N volte senza duplicare.
 *
 * Prerequisiti:
 *   1. Progetto Sanity creato su manage.sanity.io (project ID e dataset
 *      sono letti da env, non hardcoded).
 *   2. .env.local compilato con:
 *        NEXT_PUBLIC_SANITY_PROJECT_ID=...
 *        NEXT_PUBLIC_SANITY_DATASET=production
 *        SANITY_API_WRITE_TOKEN=... (Editor permission)
 *   3. `pnpm seed`
 *
 * Nota: questo script NON carica asset (immagini/PDF). Quelli vanno
 * caricati manualmente dallo Studio dall'admin del club perche' richiedono
 * scelte editoriali (hotspot, alt-text, scelta della foto principale).
 *
 * ATTENZIONE — `createOrReplace` SOSTITUISCE TUTTO IL DOCUMENTO. Per i
 * document type che ricevono upload di asset manuali (sponsor.logo,
 * riferimentiOperativi.codiceEticoPdfUrl, player.photo, heroSlide.image,
 * news.coverImage, ecc.), USARE `createIfNotExists` + `patch.set(fields)`
 * per preservare i campi asset caricati dall'admin. Gia' applicato a
 * sponsor + riferimentiOperativi dopo l'incidente del 10/05/2026 in cui
 * un seed ha cancellato i loghi sponsor: per altri tipi documento e' un
 * upgrade da fare prima di rilanci futuri se hanno ricevuto upload.
 */
import "dotenv/config";

import { createClient } from "@sanity/client";

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

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- SETTINGS (singleton) -----------------------------------------------------
const settings = {
  _id: "settings",
  _type: "settings",
  siteTitle: "ASD Orbassano Calcio",
  tagline: "Dal 1930 il calcio di Orbassano",
  // 2026/27 in Prima Categoria dopo retrocessione 2025/26 dalla
  // Promozione. Il girone resta vuoto finche la LND non lo pubblica
  // (tipicamente agosto). L'admin del club aggiornera' il campo
  // currentGroup dallo Studio quando ufficializzato — l'eyebrow hero
  // si adatta automaticamente.
  currentSeason: "2026/2027",
  currentLeague: "Prima Categoria Piemonte VdA",
  currentGroup: "",
  social: {
    instagram: "https://www.instagram.com/asdorbassanocalcio/",
    facebook: "https://facebook.com/asdorbassanocalcio",
    youtube: "https://www.youtube.com/@OrbassanoCalcio/playlists",
    tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
    threads: "https://www.threads.net/@asdorbassanocalcio",
  },
  sprintsportLinks: {
    classifica: "https://www.sprintesport.it/sezioni/119/classifiche",
    calendario: "https://www.sprintesport.it/sezioni/121/calendario",
    statistiche: "https://www.sprintesport.it/sezioni/120/statistiche",
  },
  contactInfo: {
    email: "info@orbassanocalcio.com",
    pec: "orbassanocalcio@legalmail.it",
    phone: "+39 327 779 3326",
    address: "Centro Sportivo Aldo Porta\nVia Ignazio Silone, 4\n10043 Orbassano (TO)",
  },
  legalInfo: {
    vatNumber: "12100640015",
    fiscalCode: "95634370019",
    iban: "IT93H0853030680000000002547",
    figcMatricola: "710204",
  },
};

// ---------- RIFERIMENTI OPERATIVI (singleton, Allegato B Codice Etico) ---------------
// Direttivo a 4 ruoli soli (Presidente, Vice, Segretario, Tesoriere). I
// `_key` sui membri sono richiesti dagli array Sanity. responsabileSafeguarding
// e' OGGI vacante (inCarica:false): la pagina /societa/codice-etico mostra
// il messaggio di transizione e indirizza al Direttivo (art. 3.7 del
// Codice). Quando il Direttivo nominera' il Responsabile, basta un
// editing dallo Studio — niente revisione del Codice (art. 12.8).
const riferimentiOperativi = {
  _id: "riferimentiOperativi",
  _type: "riferimentiOperativi",
  sedeLegale: "Via Ignazio Silone, 4 — 10043 Orbassano (TO)",
  codiceFiscale: "95634370019",
  partitaIva: "12100640015",
  affiliazioneFigc: "710204",
  emailSegreteria: "info@orbassanocalcio.com",
  direttivo: [
    {
      _key: "direttivo-presidente",
      _type: "membroDirettivo",
      ruolo: "Presidente",
      nome: "Michele Marano",
    },
    {
      _key: "direttivo-vice",
      _type: "membroDirettivo",
      ruolo: "Vice-Presidente",
      nome: "Mario Solej",
    },
    {
      _key: "direttivo-segretario",
      _type: "membroDirettivo",
      ruolo: "Segretario",
      nome: "Dino Cambareri",
    },
    {
      _key: "direttivo-tesoriere",
      _type: "membroDirettivo",
      ruolo: "Tesoriere",
      nome: "Manuele Gallo",
    },
  ],
  responsabileSafeguarding: {
    inCarica: false,
  },
  emailSegnalazioni: "segnalazioni@orbassanocalcio.com",
  codiceEticoVersione: "1.0",
  codiceEticoApprovatoIl: "2026-05-10",
  codiceEticoInVigoreDal: "2026-05-10",
  ultimoAggiornamento: "2026-05-10T00:00:00Z",
};

// ---------- TEAMS --------------------------------------------------------------------
type StaffMember = { role: string; name: string };
type TeamSeed = {
  slugSrc: string;
  name: string;
  category: "Prima Squadra" | "Juniores" | "Settore Giovanile" | "Scuola Calcio";
  subcategory?: string;
  season: string;
  league?: string;
  group?: string;
  staff: StaffMember[];
  order: number;
  /** Default true. Disattivare per nascondere la squadra dal sito. */
  isActive?: boolean;
  /** Slug della competition principale (collegamento bidirezionale). */
  currentMainCompetitionSlug?: string;
};

const teams: TeamSeed[] = [
  {
    slugSrc: "prima-squadra",
    name: "Prima Squadra",
    category: "Prima Squadra",
    season: "2026/2027",
    league: "Prima Categoria Piemonte VdA",
    group: "",
    order: 0,
    currentMainCompetitionSlug: "prima-categoria-piemonte-2026-27",
    staff: [
      { role: "Direttore Sportivo", name: "Marco Gnan" },
      { role: "Direttore Tecnico", name: "Riccardo Maino" },
      { role: "Allenatore", name: "Marcello Meloni" },
      { role: "Allenatore in seconda", name: "Alessandro Pierro" },
      { role: "Preparatore portieri", name: "Nestor José Sanchez Romero" },
      { role: "Dirigente accompagnatore", name: "Riccardo Riva" },
      { role: "Dirigente accompagnatore", name: "Antonino Contino" },
    ],
  },
  {
    slugSrc: "juniores",
    name: "Juniores",
    category: "Juniores",
    subcategory: "Under 19",
    season: "2026/2027",
    league: "Campionato Juniores",
    group: "",
    order: 1,
    staff: [],
  },
  {
    slugSrc: "under-17",
    name: "Under 17",
    category: "Settore Giovanile",
    subcategory: "Allievi U17",
    season: "2026/2027",
    order: 2,
    staff: [
      { role: "Mister", name: "Emanuele Strazzo" },
      { role: "Dirigente accompagnatore", name: "Lino Decorato" },
      { role: "Dirigente accompagnatore", name: "Franco Pescatrice" },
      { role: "Dirigente accompagnatore", name: "Sergio Paolone" },
    ],
  },
  {
    slugSrc: "under-16",
    name: "Under 16",
    category: "Settore Giovanile",
    subcategory: "Allievi U16",
    season: "2026/2027",
    order: 3,
    staff: [
      { role: "Mister", name: "Giuseppe Bove" },
      { role: "Dirigente accompagnatore", name: "Sonia Orecchio" },
      { role: "Dirigente accompagnatore", name: "Luca Baronetto" },
    ],
  },
  {
    slugSrc: "under-15",
    name: "Under 15",
    category: "Settore Giovanile",
    subcategory: "Giovanissimi U15",
    season: "2026/2027",
    order: 4,
    staff: [
      { role: "Mister", name: "Fabio Tessarin" },
      { role: "Dirigente allenatore", name: "Luca Sciarra" },
      { role: "Dirigente accompagnatore", name: "Richard Lenza" },
      { role: "Dirigente accompagnatore", name: "Filippo Penna" },
      { role: "Dirigente accompagnatore", name: "Angelo Cioffi" },
    ],
  },
  {
    slugSrc: "under-14",
    name: "Under 14",
    category: "Settore Giovanile",
    subcategory: "Giovanissimi U14",
    season: "2026/2027",
    order: 5,
    staff: [
      { role: "Mister", name: "Fabio Clames" },
      { role: "Dirigente allenatore", name: "Michele Viotti" },
      { role: "Dirigente accompagnatore", name: "Stefano Penno" },
      { role: "Dirigente accompagnatore", name: "Emiliano Mosca" },
    ],
  },
  {
    slugSrc: "scuola-calcio",
    name: "Scuola Calcio",
    category: "Scuola Calcio",
    subcategory: "Piccoli Amici / Primi Calci / Pulcini / Esordienti",
    season: "2026/2027",
    order: 6,
    staff: [],
    isActive: false, // Scuola Calcio temporaneamente non attiva nel sito
  },
];

// ---------- ROSA PRIMA SQUADRA 2025/26 -----------------------------------------------
type PlayerSeed = { lastName: string; firstName: string; birthYear: number };

const firstTeamRoster: PlayerSeed[] = [
  { lastName: "Antonacci", firstName: "Andrea", birthYear: 2007 },
  { lastName: "Balistreri", firstName: "Marco", birthYear: 2001 },
  { lastName: "Battaglia", firstName: "Francesco", birthYear: 2006 },
  { lastName: "Brossa", firstName: "Davide", birthYear: 2006 },
  { lastName: "Casagrande", firstName: "Andrea", birthYear: 1988 },
  { lastName: "Castellaro", firstName: "Cesare", birthYear: 2006 },
  { lastName: "Ciocan", firstName: "Stefan Andrei", birthYear: 2007 },
  { lastName: "Ciurca", firstName: "Filippo", birthYear: 1998 },
  { lastName: "Conte", firstName: "Lucio", birthYear: 2007 },
  { lastName: "Di Benedetto", firstName: "Luca", birthYear: 2004 },
  { lastName: "Donegà", firstName: "William", birthYear: 2000 },
  { lastName: "Fukuda", firstName: "Eduardo", birthYear: 2008 },
  { lastName: "Gambetta", firstName: "Marco", birthYear: 2007 },
  { lastName: "Ghironi", firstName: "Andrea", birthYear: 1999 },
  { lastName: "Girardi", firstName: "Matteo", birthYear: 2003 },
  { lastName: "Hachmaoui", firstName: "Yasser", birthYear: 2005 },
  { lastName: "Ienopoli", firstName: "Pasquale", birthYear: 2000 },
  { lastName: "Marinaro", firstName: "Roberto", birthYear: 1997 },
  { lastName: "Nicolò", firstName: "Davide", birthYear: 2001 },
  { lastName: "Raco", firstName: "Mattia", birthYear: 2007 },
  { lastName: "Sperandio", firstName: "Luca", birthYear: 1998 },
  { lastName: "Tonda", firstName: "Mattia", birthYear: 1992 },
  { lastName: "Trimarchi", firstName: "Tommaso", birthYear: 2005 },
];

// ---------- ORGANIGRAMMA SOCIETARIO --------------------------------------------------
// `group` raggruppa i dirigenti in righe separate sulla pagina
// /societa/organigramma. `groupOrder` decide l'ordine verticale delle
// righe (basta valorizzarlo su un membro del gruppo). `order`
// posiziona dentro la riga.
const officials = [
  { role: "Presidente", fullName: "Michele Marano", title: undefined, group: "Presidenza", groupOrder: 0, order: 0 },
  { role: "Vice Presidente", fullName: "Mario Solej", title: "Dott.", group: "Presidenza", groupOrder: 0, order: 1 },
  { role: "Direttore Generale", fullName: "Dino Cambareri", title: "Geom.", group: "Presidenza", groupOrder: 0, order: 2 },
  { role: "Tesoriere", fullName: "Manuele Gallo", title: "Dott.", group: "Direzione finanziaria", groupOrder: 1, order: 0 },
  { role: "Consigliere", fullName: "Claudia Maria Sodero", title: "Avv.", group: "Consiglio direttivo", groupOrder: 2, order: 0 },
  { role: "Responsabile Safeguarding", fullName: "Anita Treglia", title: undefined, group: "Consiglio direttivo", groupOrder: 2, order: 1 },
];

// ---------- SPONSOR & PARTNER 2025/26 -------------------------------------------------
type SponsorSeed = {
  name: string;
  tier: "Main Sponsor" | "Official Sponsor" | "Corporate Partner";
  website?: string;
  isActive: boolean;
  order: number;
  partnerBenefit?: string;
  description?: string;
};

const sponsors: SponsorSeed[] = [
  // MAIN
  { name: "Studio Cambareri", tier: "Main Sponsor", website: "https://www.studiocambareri.com/", isActive: true, order: 0 },
  { name: "Reale Mutua", tier: "Main Sponsor", website: "https://www.realemutua.it/", isActive: true, order: 1 },
  { name: "Ocert", tier: "Main Sponsor", website: "https://www.ocert.it/", isActive: true, order: 2 },
  // OFFICIAL
  { name: "Confabitare", tier: "Official Sponsor", website: "https://www.confabitare.it/nazionale/", isActive: true, order: 0 },
  { name: "Banca d'Alba", tier: "Official Sponsor", website: "https://www.bancadalba.it/", isActive: true, order: 1 },
  { name: "L'Igienica Srl", tier: "Official Sponsor", website: "https://www.ligienicasrl.it/", isActive: true, order: 2 },
  { name: "SID Srl", tier: "Official Sponsor", website: "https://www.sidambiente.it/", isActive: true, order: 3 },
  {
    name: "HS ASPE (Gruppo Sacma)",
    tier: "Official Sponsor",
    website:
      "https://www.sacmagroup.it/it/sacma-group/hs-aspe/maschiatura-lavorazione/torni-automatici-cnc/",
    isActive: true,
    order: 4,
  },
  { name: "Melmec Srl", tier: "Official Sponsor", website: "https://melmec.it/", isActive: true, order: 5 },
  { name: "Graziano Serramenti", tier: "Official Sponsor", website: "https://grazianoserramenti.com/", isActive: true, order: 6 },
  // CORPORATE PARTNER
  {
    name: "Alpitour World",
    tier: "Corporate Partner",
    isActive: true,
    order: 0,
    partnerBenefit: "Tariffe ridotte sul listino del Gruppo Alpitour per i tesserati ASD Orbassano Calcio.",
  },
  {
    name: "Cisalfa Sport",
    tier: "Corporate Partner",
    website: "https://www.cisalfasport.it/it-it/cisalfa-pro/",
    isActive: true,
    order: 1,
    partnerBenefit: "Programma 'Top Player': scontistiche dedicate tutto l'anno sui prodotti Cisalfa.",
  },
  // ARCHIVIATI (isActive: false) — vedi DATA §8
  { name: "EdiliziAcrobatica", tier: "Main Sponsor", website: "https://ediliziacrobatica.com/", isActive: false, order: 99 },
  { name: "Master Video", tier: "Official Sponsor", website: "https://www.facebook.com/WindMasterVideo", isActive: false, order: 99 },
  {
    name: "Angelillo Sas (Vittoria Assicurazioni)",
    tier: "Official Sponsor",
    website:
      "https://www.vittoriaassicurazioni.com/agenzie/orbassano/506-angelillo-sas-di-angelillo-ettore-c",
    isActive: false,
    order: 99,
  },
  { name: "BG Impianti Elettrici Domotici", tier: "Official Sponsor", website: "https://www.bgimpiantielettrici.it/", isActive: false, order: 99 },
  { name: "Autoservizi Stupinigi", tier: "Official Sponsor", website: "https://www.autoservizistupinigi.com/", isActive: false, order: 99 },
];

// ---------- TIMELINE STORICA ---------------------------------------------------------
type TimelineSeed = {
  year: number;
  season?: string;
  title: string;
  category:
    | "Fondazione"
    | "Promozione"
    | "Trofeo"
    | "Fusione"
    | "Rifondazione"
    | "Storico";
  isHighlight?: boolean;
  description?: string;
};

const timeline: TimelineSeed[] = [
  { year: 1930, title: "Fondazione del Gruppo Sportivo Orbassano", category: "Fondazione", isHighlight: true, description: "Nasce il club rossoblù che diventerà la principale realtà calcistica della città." },
  { year: 1959, season: "1958-1959", title: "Seconda Divisione, finale playoff persa", category: "Storico" },
  { year: 1980, season: "1979-1980", title: "1° posto Promozione: prima promozione in Serie D", category: "Promozione", isHighlight: true },
  { year: 1981, season: "1980-1981", title: "3° posto Serie D girone A", category: "Storico" },
  { year: 1983, season: "1982-1983", title: "2° posto Campionato Interregionale, sfiorata la C2", category: "Trofeo", isHighlight: true },
  { year: 1985, season: "1984-1985", title: "Retrocessione dall'Interregionale", category: "Storico" },
  { year: 1992, title: "Diventa 'Orbassano Calcio '92', esclusa dalla Promozione", category: "Storico" },
  { year: 2000, title: "Fusione con Venaria → U.S. Orbassano Venaria", category: "Fusione" },
  { year: 2003, season: "2002-2003", title: "1° posto Eccellenza, ritorno in Serie D", category: "Trofeo", isHighlight: true },
  { year: 2006, season: "2005-2006", title: "5° in Serie D, semifinale playoff persa col Monopoli", category: "Storico", isHighlight: true },
  { year: 2006, title: "Fusione con Cirié → U.S.D. Orbassano Cirié", category: "Fusione" },
  { year: 2007, season: "2006-2007", title: "4° in Serie D, semifinale playoff persa col Casale", category: "Storico", isHighlight: true },
  { year: 2007, title: "Cessione titolo sportivo al Cirié", category: "Storico" },
  { year: 2009, title: "Fusione con Gabetto → A.S.D. Orbassano S.C.G. Gabetto", category: "Fusione" },
  { year: 2011, title: "Fusione con Cirié → U.S.D. Cirié Orbassano", category: "Fusione" },
  { year: 2012, title: "Sospensione attività: cinque stagioni di pausa", category: "Storico", isHighlight: true },
  { year: 2018, title: "Fusione con Aurora Rinascita TFR → A.S.D. Aurora Sporting Orbassano", category: "Fusione" },
  { year: 2019, season: "2018-2019", title: "5° Prima Categoria E, finale playoff persa col Nichelino Hesperia", category: "Storico" },
  { year: 2019, title: "Cambia nome in A.S.D. Orbassano A.S.P.A.", category: "Storico" },
  { year: 2022, title: "Rifondazione: torna A.S.D. Orbassano Calcio", category: "Rifondazione", isHighlight: true, description: "Una nuova cordata rifonda il club riavvicinandolo alla denominazione storica." },
];

// ---------- CLUB AVVERSARI (anagrafica) ---------------------------------------------
// Esempio template: l'admin sostituira' con i club reali del girone
// quando la LND comunichera' gli accoppiamenti (tipicamente fine agosto).
type ClubSeed = {
  slugSrc: string;
  name: string;
  shortName: string;
  isActive: boolean;
};

const clubs: ClubSeed[] = [
  {
    slugSrc: "esempio-calcio-1965",
    name: "A.S.D. Esempio Calcio 1965",
    shortName: "Esempio",
    isActive: true,
  },
];

// ---------- COMPETIZIONI 2026/27 -----------------------------------------------------
// Una competition per la Prima Squadra (Prima Categoria). Quando la
// federazione assegnera' il girone, l'admin aggiornera' il campo `group`
// dallo Studio. Coppe/amichevoli vanno aggiunte come competition
// separate (category: cup / friendly).
type CompetitionSeed = {
  slugSrc: string;
  name: string;
  shortName: string;
  season: string;
  category: "championship" | "cup" | "tournament" | "playoff" | "friendly";
  targetTeamSlug: string;
  federation: "figc-lnd" | "figc-sgs" | "private";
  group?: string;
  externalRankingUrl?: string;
  externalCalendarUrl?: string;
  defaultReportLink?: string;
  order: number;
  isActive: boolean;
};

const competitions: CompetitionSeed[] = [
  {
    slugSrc: "prima-categoria-piemonte-2026-27",
    name: "Prima Categoria Piemonte VdA 2026/27",
    shortName: "Prima Categoria",
    season: "2026/2027",
    category: "championship",
    targetTeamSlug: "prima-squadra",
    federation: "figc-lnd",
    group: "", // TBD fino a comunicazione LND
    externalRankingUrl: "https://www.sprintesport.it/sezioni/119/classifiche",
    externalCalendarUrl: "https://www.sprintesport.it/sezioni/121/calendario",
    // Lasciato vuoto per ora: l'admin lo valorizza con la pagina
    // Tuttocampo del girone quando la LND ufficializza gli accoppiamenti
    // (es. https://www.tuttocampo.it/Piemonte/PrimaCategoria/GironeX).
    // Diventa il default delle MatchCard quando match.reportLink e' vuoto.
    defaultReportLink: undefined,
    order: 0,
    isActive: true,
  },
];

// ---------- AVVERSARI (join club ↔ competition) -------------------------------------
type OpponentSeed = {
  slugSrc: string;
  clubSlug: string;
  competitionSlug: string;
  notes?: string;
  isActive: boolean;
};

const opponents: OpponentSeed[] = [
  {
    slugSrc: "esempio-prima-categoria-2026-27",
    clubSlug: "esempio-calcio-1965",
    competitionSlug: "prima-categoria-piemonte-2026-27",
    notes: "Esempio template: sostituire con i club reali del girone.",
    isActive: true,
  },
];

// ---------- IMPIANTI -----------------------------------------------------------------
const facilities = [
  {
    slugSrc: "centro-sportivo-aldo-porta",
    name: "Centro Sportivo Aldo Porta",
    address: "Via Ignazio Silone 4, 10043 Orbassano (TO)",
    mapsUrl: "https://goo.gl/maps/aangwwU2QR5ninCDA",
    fields: [
      "2 campi a 11 regolamentari (uno omologato Serie D)",
      "Campi a 5, 7 e 8 in erba naturale e sintetica",
      "Tribuna, bar, area parcheggio, uffici",
    ],
    order: 0,
  },
  {
    slugSrc: "sporting-orbassano-stadio-mazzola",
    name: "Centro Sportivo Sporting Orbassano — Stadio Valentino Mazzola",
    address: "Via Gozzano 11, Orbassano (TO)",
    mapsUrl: "https://www.sportingorbassano.it/",
    fields: [
      "Stadio Valentino Mazzola (300 posti)",
      "Ex impianto Sisport Fiat",
      "Ha ospitato allenamenti di Torino (1979–anni 2000) e Juventus (1990–1994)",
      "Sede della Scuola Calcio",
    ],
    order: 1,
    isActive: false, // Mazzola temporaneamente non attivo nel sito
  },
];

// ---------- ESECUZIONE ---------------------------------------------------------------
async function main() {
  const resetMatches = process.argv.includes("--reset-matches");

  console.log(
    `Seed Sanity → projectId=${projectId} dataset=${dataset}\n`,
  );

  // --reset-matches: cancella tutti i match esistenti prima del re-seed.
  // Utile dopo refactor schema match (M5a) per eliminare doc che usano
  // i vecchi campi opponent stringa + opponentLogo image. Esegue prima
  // del transaction commit cosi' un eventuale fallimento non lascia
  // stati ibridi.
  if (resetMatches) {
    const existingMatchIds = await client.fetch<string[]>(
      '*[_type == "match"]._id',
    );
    if (existingMatchIds.length > 0) {
      console.log(
        `Reset match attivo → cancellazione di ${existingMatchIds.length} match esistenti…`,
      );
      const deleteTx = client.transaction();
      for (const id of existingMatchIds) deleteTx.delete(id);
      await deleteTx.commit();
      console.log(`✓ ${existingMatchIds.length} match cancellati.\n`);
    } else {
      console.log("Reset match attivo, ma nessun match esistente da cancellare.\n");
    }
  }

  const tx = client.transaction();

  // Settings (singleton)
  tx.createOrReplace(settings);
  console.log("• Settings preparato");

  // Riferimenti operativi (singleton, Allegato B Codice Etico).
  // Pattern createIfNotExists + patch.set per preservare i campi asset
  // caricati manualmente dallo Studio: codiceEticoPdfUrl + ogni
  // codiceEticoArchivio[].pdf. Stesso motivo degli sponsor (vedi commit
  // sponsor logo restore 10/05/2026).
  const { _id: rifId, _type: rifType, ...rifFields } = riferimentiOperativi;
  tx.createIfNotExists({ _id: rifId, _type: rifType, ...rifFields });
  tx.patch(rifId, (p) => p.set(rifFields));
  console.log("• Riferimenti operativi preparato (PDF preservato)");

  // Teams (creiamo prima — i player + competition ci fanno reference).
  // `currentMainCompetition` punta a competition.{slug} che e' creata
  // piu' avanti nella stessa transaction: Sanity gestisce il riferimento
  // intra-transaction senza bisogno di ordinamento esplicito.
  for (const t of teams) {
    const _id = `team.${t.slugSrc}`;
    tx.createOrReplace({
      _id,
      _type: "team",
      name: t.name,
      slug: { _type: "slug", current: t.slugSrc },
      category: t.category,
      subcategory: t.subcategory,
      season: t.season,
      league: t.league,
      group: t.group,
      order: t.order,
      isActive: t.isActive ?? true,
      staff: t.staff.map((s, i) => ({
        _key: `staff-${i}`,
        _type: "staffMember",
        role: s.role,
        name: s.name,
      })),
      ...(t.currentMainCompetitionSlug
        ? {
            currentMainCompetition: {
              _type: "reference",
              _ref: `competition.${t.currentMainCompetitionSlug}`,
            },
          }
        : {}),
    });
  }
  console.log(`• ${teams.length} squadre preparate`);

  // Club avversari (anagrafica)
  for (const c of clubs) {
    tx.createOrReplace({
      _id: `club.${c.slugSrc}`,
      _type: "club",
      name: c.name,
      shortName: c.shortName,
      slug: { _type: "slug", current: c.slugSrc },
      isActive: c.isActive,
    });
  }
  console.log(`• ${clubs.length} club avversari preparati (template di esempio)`);

  // Competizioni (referenziano team gia' nella transaction)
  for (const c of competitions) {
    tx.createOrReplace({
      _id: `competition.${c.slugSrc}`,
      _type: "competition",
      name: c.name,
      shortName: c.shortName,
      slug: { _type: "slug", current: c.slugSrc },
      season: c.season,
      category: c.category,
      targetTeam: {
        _type: "reference",
        _ref: `team.${c.targetTeamSlug}`,
      },
      federation: c.federation,
      group: c.group,
      externalRankingUrl: c.externalRankingUrl,
      externalCalendarUrl: c.externalCalendarUrl,
      defaultReportLink: c.defaultReportLink,
      order: c.order,
      isActive: c.isActive,
    });
  }
  console.log(`• ${competitions.length} competizioni preparate`);

  // Avversari (join club ↔ competition)
  for (const o of opponents) {
    tx.createOrReplace({
      _id: `opponent.${o.slugSrc}`,
      _type: "opponent",
      club: { _type: "reference", _ref: `club.${o.clubSlug}` },
      competition: {
        _type: "reference",
        _ref: `competition.${o.competitionSlug}`,
      },
      notes: o.notes,
      isActive: o.isActive,
    });
  }
  console.log(`• ${opponents.length} avversari preparati`);

  // Players (rosa prima squadra)
  for (const p of firstTeamRoster) {
    const slug = slugify(`${p.lastName}-${p.firstName}`);
    const _id = `player.${slug}`;
    tx.createOrReplace({
      _id,
      _type: "player",
      firstName: p.firstName,
      lastName: p.lastName,
      slug: { _type: "slug", current: slug },
      birthYear: p.birthYear,
      nationality: "Italia",
      isCaptain: false,
      team: { _type: "reference", _ref: "team.prima-squadra" },
    });
  }
  console.log(`• ${firstTeamRoster.length} giocatori prima squadra preparati`);

  // Officials
  officials.forEach((o) => {
    const slug = slugify(o.fullName);
    tx.createOrReplace({
      _id: `clubOfficial.${slug}`,
      _type: "clubOfficial",
      role: o.role,
      fullName: o.fullName,
      title: o.title,
      group: o.group,
      groupOrder: o.groupOrder,
      order: o.order,
    });
  });
  console.log(`• ${officials.length} dirigenti preparati`);

  // Sponsor — createIfNotExists + patch SET. NON usiamo createOrReplace
  // perche' il campo `logo` (asset image) viene caricato manualmente
  // dall'admin via Studio: con replace lo perderemmo a ogni rilancio del
  // seed (incidente del 10/05/2026 — fix in commit successivo). Il
  // pattern qui: crea il documento se non esiste, altrimenti applica
  // set() solo sui campi anagrafici, preservando logo + eventuali altri
  // campi aggiunti manualmente.
  for (const s of sponsors) {
    const slug = slugify(s.name);
    const _id = `sponsor.${slug}`;
    const fields = {
      name: s.name,
      tier: s.tier,
      website: s.website,
      isActive: s.isActive,
      order: s.order,
      partnerBenefit: s.partnerBenefit,
      description: s.description,
    };
    tx.createIfNotExists({ _id, _type: "sponsor", ...fields });
    tx.patch(_id, (p) => p.set(fields));
  }
  const active = sponsors.filter((s) => s.isActive).length;
  const archived = sponsors.length - active;
  console.log(`• ${sponsors.length} sponsor preparati (${active} attivi, ${archived} archiviati) — logo preservato`);

  // Timeline
  timeline.forEach((t, i) => {
    tx.createOrReplace({
      _id: `timelineEvent.${t.year}-${i}`,
      _type: "timelineEvent",
      year: t.year,
      season: t.season,
      title: t.title,
      category: t.category,
      isHighlight: t.isHighlight ?? false,
      description: t.description
        ? [
            {
              _type: "block",
              _key: `block-${i}`,
              style: "normal",
              children: [
                {
                  _type: "span",
                  _key: `span-${i}`,
                  text: t.description,
                  marks: [],
                },
              ],
            },
          ]
        : undefined,
    });
  });
  console.log(`• ${timeline.length} eventi storici preparati`);

  // Facilities
  for (const f of facilities) {
    tx.createOrReplace({
      _id: `facility.${f.slugSrc}`,
      _type: "facility",
      name: f.name,
      slug: { _type: "slug", current: f.slugSrc },
      address: f.address,
      mapsUrl: f.mapsUrl,
      fields: f.fields,
      order: f.order,
      isActive: (f as { isActive?: boolean }).isActive ?? true,
    });
  }
  console.log(`• ${facilities.length} impianti preparati`);

  console.log("\nCommit in corso…");
  const result = await tx.commit();
  console.log(
    `\n✓ Seed completato: ${result.results.length} mutazioni applicate.`,
  );
}

main().catch((err: unknown) => {
  console.error("\n✗ Seed fallito:", err);
  process.exit(1);
});
