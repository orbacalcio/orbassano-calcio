/**
 * Genera un file Excel template `matches-template.xlsx` nella root del
 * repo, con una riga di esempio e le colonne corrette per
 * `scripts/import-matches.ts`.
 *
 * Eseguire una sola volta (o ogni volta che il tracciato cambia):
 *   pnpm matches-template
 *
 * L'admin del club apre il file in Excel, sostituisce la riga di
 * esempio con i dati reali (una riga per partita), salva, e lancia
 * l'import:
 *   pnpm import-matches matches-template.xlsx
 *
 * Differenza chiave vs import-players: lo script crea automaticamente
 * i club avversari mancanti come stub (solo nome/shortName/slug, niente
 * logo). I logo si caricano poi manualmente in CMS (Studio > Club).
 */
import * as XLSX from "xlsx";
import path from "node:path";
import fs from "node:fs";

type Column = {
  header: string;
  example: string | number | boolean;
  note: string;
};

const columns: Column[] = [
  {
    header: "teamSlug",
    example: "prima-squadra",
    note: "RICHIESTO. Slug della NOSTRA squadra. Valori: prima-squadra | juniores-u19 | juniores-under-18 | allievi-under-17 | allievi-under-16 | giovanissimi-under-15 | giovanissimi-under-14.",
  },
  {
    header: "competitionSlug",
    example: "prima-categoria-2026-27",
    note: "RICHIESTO. Slug della competizione (deve gia' esistere su Sanity). Vedi Studio > Stagione corrente > Competizioni per la lista.",
  },
  {
    header: "matchday",
    example: 1,
    note: "Giornata di campionato (numero). Lascia vuoto per coppa/amichevoli.",
  },
  {
    header: "date",
    example: "2026-09-14",
    note: "RICHIESTO. Data partita in formato YYYY-MM-DD (es. 2026-09-14). Anche se data e' da definire, metti una data nominale e attiva isDateTbd.",
  },
  {
    header: "time",
    example: "15:30",
    note: "Orario in formato HH:MM 24h (es. 15:30). Default 15:00 se vuoto.",
  },
  {
    header: "home",
    example: true,
    note: "RICHIESTO. true se Orbassano gioca in casa, false se in trasferta.",
  },
  {
    header: "opponentName",
    example: "A.S.D. Esempio Calcio 1965",
    note: "Denominazione completa club avversario. Richiesto se isOpponentTbd e' false. Se il club non esiste su Sanity viene CREATO automaticamente (stub senza logo).",
  },
  {
    header: "opponentShortName",
    example: "Esempio",
    note: "Nome breve avversario (max 20 caratteri), mostrato nelle MatchCard. Se vuoto, derivato da opponentName.",
  },
  {
    header: "venue",
    example: "",
    note: "Stadio. Lascia vuoto per default 'Centro Sportivo Aldo Porta' (casa). Specifica per trasferte o campi neutri.",
  },
  {
    header: "status",
    example: "scheduled",
    note: "Uno tra: scheduled | live | finished | postponed | cancelled. Default scheduled.",
  },
  {
    header: "scoreHome",
    example: "",
    note: "Gol squadra in casa (numero). Lascia vuoto se la partita non e' ancora finita.",
  },
  {
    header: "scoreAway",
    example: "",
    note: "Gol squadra in trasferta (numero).",
  },
  {
    header: "isOpponentTbd",
    example: false,
    note: "true se l'avversario non e' ancora noto (sorteggio coppa). Se true, opponentName puo' restare vuoto.",
  },
  {
    header: "isDateTbd",
    example: false,
    note: "true se la data/orario non sono ancora ufficiali. La UI mostra 'Da definire' al posto dell'orario.",
  },
  {
    header: "reportLink",
    example: "",
    note: "URL Tuttocampo/Sprintsport tabellino partita. Opzionale.",
  },
  {
    header: "highlightsUrl",
    example: "",
    note: "URL YouTube highlights partita. Opzionale.",
  },
  {
    header: "notes",
    example: "",
    note: "Note pubbliche visibili sotto la card (es. 'Recupero del 15/12'). Opzionale.",
  },
];

const exampleRow = Object.fromEntries(columns.map((c) => [c.header, c.example]));
const data = [exampleRow];

const ws = XLSX.utils.json_to_sheet(data, {
  header: columns.map((c) => c.header),
});

ws["!cols"] = columns.map((c) => ({
  wch: Math.max(c.header.length, String(c.example).length, 12),
}));

columns.forEach((c, idx) => {
  const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
  if (!ws[cellRef]) return;
  ws[cellRef].c = [{ a: "Sistema", t: c.note }];
});

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Partite");

const instructionsRows = [
  ["TEMPLATE IMPORT CALENDARIO PARTITE — ASD ORBASSANO CALCIO"],
  [""],
  ["Una riga per partita. Le colonne RICHIESTO devono essere"],
  ["valorizzate, le altre sono opzionali."],
  [""],
  ["COLONNE:"],
  ...columns.map((c) => [`  ${c.header}`, c.note]),
  [""],
  ["WORKFLOW:"],
  ["  1. Apri questo file in Excel."],
  ["  2. Vai al foglio 'Partite'."],
  ["  3. Cancella la riga di esempio, inserisci le partite reali"],
  ["     (una riga ciascuna)."],
  ["  4. Salva (mantieni formato .xlsx)."],
  ["  5. Lancia da terminale nella root del repo:"],
  ["       pnpm import-matches matches-template.xlsx"],
  [""],
  ["AUTO-CREAZIONE CLUB AVVERSARI:"],
  ["  Se l'avversario indicato non esiste su Sanity, viene creato un"],
  ["  documento 'club' STUB con solo nome/shortName/slug e attivo."],
  ["  Il LOGO va caricato manualmente in Studio > Club dopo l'import."],
  ["  Successivi import che usano lo stesso club lo riusano (no duplicati)."],
  [""],
  ["IDEMPOTENZA:"],
  ["  Ogni partita ha un _id deterministico basato su"],
  ["  <teamSlug>--<competitionSlug>--<matchday-o-data>--<opponentSlug>."],
  ["  Re-lanciando lo stesso file, le partite esistenti sono"],
  ["  AGGIORNATE (non duplicate)."],
  [""],
  ["PREREQUISITI:"],
  ["  - Squadre (team) gia' create su Sanity con slug corretto."],
  ["  - Competizioni gia' create su Sanity (con targetTeam coerente)."],
  ["  - Token SANITY_API_WRITE_TOKEN in .env.local."],
];

const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsRows);
wsInstructions["!cols"] = [{ wch: 24 }, { wch: 90 }];
XLSX.utils.book_append_sheet(wb, wsInstructions, "Istruzioni");

const outPath = path.resolve("matches-template.xlsx");
XLSX.writeFile(wb, outPath);

console.log("\n✓ Template generato:");
console.log(`  ${outPath}`);
console.log(`  Dimensione: ${fs.statSync(outPath).size} byte`);
console.log("\nColonne incluse:");
columns.forEach((c) => console.log(`  - ${c.header}: ${c.note}`));
console.log("\nProssimi step:");
console.log("  1. Apri il file in Excel.");
console.log("  2. Sostituisci la riga di esempio con le tue partite.");
console.log("  3. Salva.");
console.log("  4. pnpm import-matches matches-template.xlsx\n");
