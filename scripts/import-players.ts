/**
 * Import giocatori in massa su Sanity production da un file Excel (.xlsx).
 *
 * Eseguire dalla root del repo (richiede SANITY_API_WRITE_TOKEN in
 * .env.local):
 *   pnpm import-players <path-al-file.xlsx>
 *
 * Workflow:
 *   1. pnpm players-template   → genera players-template.xlsx
 *   2. Apri in Excel, compila una riga per giocatore, salva.
 *   3. pnpm import-players players-template.xlsx
 *
 * Idempotenza: ogni player ha slug auto generato da
 * `<cognome>-<nome>` (lowercase, accenti rimossi). Se un player con
 * quello slug esiste su Sanity, viene aggiornato; altrimenti creato.
 * Sicuro re-lanciare lo stesso file più volte.
 *
 * Report finale: quanti created/updated/skipped/errors.
 */
import * as XLSX from "xlsx";
import { createClient } from "@sanity/client";
import path from "node:path";
import fs from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN",
  );
  console.error(
    "Esegui con: pnpm import-players <file.xlsx>  (richiede .env.local)",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

const filePath = process.argv[2];
if (!filePath) {
  console.error("Uso: pnpm import-players <file.xlsx>");
  console.error("Genera il template con: pnpm players-template");
  process.exit(1);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
  console.error(`File non trovato: ${absPath}`);
  process.exit(1);
}

// ---------- TYPES ---------------------------------------------------------

const VALID_ROLES = new Set([
  "Portiere",
  "Difensore",
  "Centrocampista",
  "Attaccante",
]);
const VALID_FEET = new Set(["Destro", "Sinistro", "Ambidestro"]);

type PlayerRow = {
  firstName?: string | number;
  lastName?: string | number;
  birthYear?: string | number;
  shirtNumber?: string | number;
  role?: string;
  foot?: string;
  nationality?: string;
  teamSlug?: string;
  isCaptain?: boolean | string | number;
  appearances?: string | number;
  goals?: string | number;
  assists?: string | number;
  yellowCards?: string | number;
  redCards?: string | number;
  order?: string | number;
};

// ---------- HELPERS -------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics (à → a)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function asNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "."));
  return Number.isFinite(n) ? n : undefined;
}

function asBoolean(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = asString(v).toLowerCase();
  return s === "true" || s === "1" || s === "si" || s === "sì" || s === "yes";
}

// ---------- MAIN ----------------------------------------------------------

async function main() {
  console.log(`Reading file: ${path.basename(absPath)}`);
  const workbook = XLSX.readFile(absPath);
  // Preferenza: foglio chiamato "Giocatori", altrimenti il primo.
  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase() === "giocatori") ??
    workbook.SheetNames[0];
  if (!sheetName) {
    console.error("File xlsx senza fogli");
    process.exit(1);
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error(`Foglio '${sheetName}' non trovato`);
    process.exit(1);
  }
  const rows = XLSX.utils.sheet_to_json<PlayerRow>(sheet, { defval: "" });
  console.log(`Foglio: ${sheetName} | Righe trovate: ${rows.length}`);

  // Cache team lookup: una sola query a Sanity per tutti i team attivi
  type TeamRef = { _id: string; slug: string };
  const teams = await client.fetch<TeamRef[]>(
    `*[_type == "team" && defined(slug.current)]{ _id, "slug": slug.current }`,
  );
  const teamBySlug = new Map(teams.map((t) => [t.slug, t._id]));
  console.log(`Team disponibili in Sanity: ${teams.length}`);
  console.log(`  Slug: ${teams.map((t) => t.slug).join(", ")}\n`);

  const stats = { created: 0, updated: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const lineNum = i + 2; // +1 header, +1 1-based
    const firstName = asString(row.firstName);
    const lastName = asString(row.lastName);

    if (!firstName || !lastName) {
      console.warn(`  ⊘ Riga ${lineNum}: firstName/lastName mancante → skip`);
      stats.skipped++;
      continue;
    }

    const teamSlug = asString(row.teamSlug);
    if (!teamSlug) {
      console.warn(
        `  ⊘ Riga ${lineNum} (${lastName} ${firstName}): teamSlug vuoto → skip`,
      );
      stats.skipped++;
      continue;
    }
    const teamId = teamBySlug.get(teamSlug);
    if (!teamId) {
      console.warn(
        `  ⊘ Riga ${lineNum} (${lastName} ${firstName}): team '${teamSlug}' non esiste su Sanity → skip`,
      );
      stats.skipped++;
      continue;
    }

    const role = asString(row.role);
    if (role && !VALID_ROLES.has(role)) {
      console.warn(
        `  ⚠ Riga ${lineNum} (${lastName} ${firstName}): role '${role}' non valido (valori: ${Array.from(VALID_ROLES).join(" | ")}) → ignorato`,
      );
    }
    const foot = asString(row.foot);
    if (foot && !VALID_FEET.has(foot)) {
      console.warn(
        `  ⚠ Riga ${lineNum} (${lastName} ${firstName}): foot '${foot}' non valido (valori: ${Array.from(VALID_FEET).join(" | ")}) → ignorato`,
      );
    }

    const slug = slugify(`${lastName}-${firstName}`);

    // Stats: includi l'object solo se almeno un campo > 0 (per non
    // sporcare il doc con tutti zero).
    const statsFields = {
      appearances: asNumber(row.appearances) ?? 0,
      goals: asNumber(row.goals) ?? 0,
      assists: asNumber(row.assists) ?? 0,
      yellowCards: asNumber(row.yellowCards) ?? 0,
      redCards: asNumber(row.redCards) ?? 0,
    };
    const hasStats = Object.values(statsFields).some((v) => v > 0);

    const docFields: Record<string, unknown> = {
      firstName,
      lastName,
      slug: { _type: "slug", current: slug },
      team: { _type: "reference", _ref: teamId },
      isCaptain: asBoolean(row.isCaptain),
      nationality: asString(row.nationality) || "Italia",
    };

    const birthYear = asNumber(row.birthYear);
    if (birthYear && birthYear >= 1900) docFields.birthYear = birthYear;
    const shirtNumber = asNumber(row.shirtNumber);
    if (shirtNumber && shirtNumber > 0) docFields.shirtNumber = shirtNumber;
    if (role && VALID_ROLES.has(role)) docFields.role = role;
    if (foot && VALID_FEET.has(foot)) docFields.foot = foot;
    if (hasStats) docFields.stats = statsFields;
    const order = asNumber(row.order);
    if (typeof order === "number") docFields.order = order;

    try {
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_type == "player" && slug.current == $slug][0]{ _id }`,
        { slug },
      );
      if (existing) {
        await client.patch(existing._id).set(docFields).commit();
        console.log(`  ↻ Updated:  ${lastName} ${firstName}  (${slug})`);
        stats.updated++;
      } else {
        await client.create({ _type: "player", ...docFields } as never);
        console.log(`  + Created:  ${lastName} ${firstName}  (${slug})`);
        stats.created++;
      }
    } catch (err) {
      console.error(
        `  ✗ Errore riga ${lineNum} (${lastName} ${firstName}):`,
        err instanceof Error ? err.message : err,
      );
      stats.errors++;
    }
  }

  console.log("\n=== Riepilogo ===");
  console.log(`  Created: ${stats.created}`);
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Errors:  ${stats.errors}`);
  console.log("\n");

  if (stats.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
