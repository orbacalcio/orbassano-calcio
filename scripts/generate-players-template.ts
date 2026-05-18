/**
 * Genera un file Excel template `players-template.xlsx` nella root del
 * repo, con una riga di esempio e le colonne corrette per
 * `scripts/import-players.ts`.
 *
 * Eseguire una sola volta (o ogni volta che il tracciato cambia):
 *   pnpm players-template
 *
 * L'admin del club apre il file in Excel, sostituisce la riga di
 * esempio con i dati reali (una riga per giocatore), salva, e lancia
 * l'import:
 *   pnpm import-players players-template.xlsx
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
  { header: "firstName", example: "Mario", note: "RICHIESTO. Nome di battesimo del giocatore." },
  { header: "lastName", example: "Rossi", note: "RICHIESTO. Cognome." },
  { header: "birthYear", example: 1998, note: "Anno di nascita (4 cifre, 1950-anno corrente). Lascia vuoto se sconosciuto." },
  { header: "shirtNumber", example: 10, note: "Numero di maglia (1-99). Lascia vuoto se non assegnato." },
  { header: "role", example: "Centrocampista", note: "Uno tra: Portiere | Difensore | Centrocampista | Attaccante (con maiuscola)." },
  { header: "foot", example: "Destro", note: "Uno tra: Destro | Sinistro | Ambidestro." },
  { header: "nationality", example: "Italia", note: "Default 'Italia' se vuoto." },
  { header: "teamSlug", example: "prima-squadra", note: "RICHIESTO. Slug della squadra in Sanity. Valori: prima-squadra | juniores | under-17 | under-16 | under-15 | under-14 | scuola-calcio." },
  { header: "isCaptain", example: false, note: "true se capitano, false (o vuoto) altrimenti." },
  { header: "appearances", example: 0, note: "Presenze stagionali. Lascia 0 / vuoto se non disponibili." },
  { header: "goals", example: 0, note: "Gol stagionali." },
  { header: "assists", example: 0, note: "Assist stagionali." },
  { header: "yellowCards", example: 0, note: "Ammonizioni stagionali." },
  { header: "redCards", example: 0, note: "Espulsioni stagionali." },
  { header: "order", example: 1, note: "Numero per ordinare i giocatori nella rosa (lower = first)." },
];

// 1 riga di esempio (l'admin la sostituisce/duplica)
const exampleRow = Object.fromEntries(columns.map((c) => [c.header, c.example]));
const data = [exampleRow];

const ws = XLSX.utils.json_to_sheet(data, {
  header: columns.map((c) => c.header),
});

// Larghezza colonne basata sulla header + esempio (min 12)
ws["!cols"] = columns.map((c) => ({
  wch: Math.max(c.header.length, String(c.example).length, 12),
}));

// Inserisce commenti (note) sulle celle header — visibili in Excel
// passando con il mouse sopra al titolo della colonna.
columns.forEach((c, idx) => {
  const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
  if (!ws[cellRef]) return;
  ws[cellRef].c = [{ a: "Sistema", t: c.note }];
});

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Giocatori");

// Foglio dedicato "Istruzioni" per documentazione inline
const instructionsRows = [
  ["TEMPLATE IMPORT GIOCATORI — ASD ORBASSANO CALCIO"],
  [""],
  ["Una riga per giocatore. Le colonne con RICHIESTO devono essere"],
  ["valorizzate, le altre sono opzionali."],
  [""],
  ["COLONNE:"],
  ...columns.map((c) => [`  ${c.header}`, c.note]),
  [""],
  ["WORKFLOW:"],
  ["  1. Apri questo file in Excel."],
  ["  2. Vai al foglio 'Giocatori'."],
  ["  3. Cancella la riga di esempio, inserisci i giocatori reali"],
  ["     (una riga ciascuno)."],
  ["  4. Salva il file (mantieni formato .xlsx)."],
  ["  5. Lancia da terminale nella root del repo:"],
  ["       pnpm import-players players-template.xlsx"],
  [""],
  ["IDEMPOTENZA:"],
  ["  Lo script genera lo slug del giocatore da '<cognome>-<nome>'."],
  ["  Se un giocatore con quello slug esiste gia' su Sanity, viene"],
  ["  AGGIORNATO con i dati del file (non duplicato)."],
  ["  Sicuro re-lanciare lo stesso file piu' volte."],
];

const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsRows);
wsInstructions["!cols"] = [{ wch: 24 }, { wch: 90 }];
XLSX.utils.book_append_sheet(wb, wsInstructions, "Istruzioni");

const outPath = path.resolve("players-template.xlsx");
XLSX.writeFile(wb, outPath);

console.log("\n✓ Template generato:");
console.log(`  ${outPath}`);
console.log(`  Dimensione: ${fs.statSync(outPath).size} byte`);
console.log("\nColonne incluse:");
columns.forEach((c) => console.log(`  - ${c.header}: ${c.note}`));
console.log("\nProssimi step:");
console.log("  1. Apri il file in Excel.");
console.log("  2. Sostituisci la riga di esempio con i tuoi giocatori.");
console.log("  3. Salva.");
console.log("  4. pnpm import-players players-template.xlsx\n");
