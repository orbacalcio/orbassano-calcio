/**
 * Import calendario partite in massa su Sanity production da un file
 * Excel (.xlsx).
 *
 * Eseguire dalla root del repo (richiede SANITY_API_WRITE_TOKEN in
 * .env.local):
 *   pnpm import-matches <path-al-file.xlsx>
 *
 * Workflow:
 *   1. pnpm matches-template   → genera matches-template.xlsx
 *   2. Apri in Excel, compila una riga per partita, salva.
 *   3. pnpm import-matches matches-template.xlsx
 *
 * Auto-creazione club:
 *   Se l'avversario indicato non esiste su Sanity, viene creato un
 *   documento `club` STUB (nome/shortName/slug/isActive=true, niente
 *   logo). I logo si caricano poi manualmente in Studio > Club.
 *   Inoltre crea il documento `opponent` (join club↔competition) se
 *   non esiste.
 *
 * Idempotenza:
 *   _id deterministico:
 *     - club:     imp-club-<slug>
 *     - opponent: imp-opp-<clubSlug>--<compSlug>
 *     - match:    imp-match-<teamSlug>--<compSlug>--<mday-o-yyyymmdd>--<oppSlug>
 *   Sicuro re-lanciare lo stesso file più volte (aggiornamento, non
 *   duplicazione).
 *
 * Report finale: created/updated/skipped/errors per ogni tipo.
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
    "Esegui con: pnpm import-matches <file.xlsx>  (richiede .env.local)",
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
  console.error("Uso: pnpm import-matches <file.xlsx>");
  console.error("Genera il template con: pnpm matches-template");
  process.exit(1);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
  console.error(`File non trovato: ${absPath}`);
  process.exit(1);
}

// ---------- TYPES ---------------------------------------------------------

const VALID_STATUS = new Set([
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled",
]);

type MatchRow = {
  teamSlug?: string;
  competitionSlug?: string;
  matchday?: string | number;
  date?: string | number | Date;
  time?: string | number;
  home?: boolean | string | number;
  opponentName?: string;
  opponentShortName?: string;
  venue?: string;
  status?: string;
  scoreHome?: string | number;
  scoreAway?: string | number;
  isOpponentTbd?: boolean | string | number;
  isDateTbd?: boolean | string | number;
  reportLink?: string;
  highlightsUrl?: string;
  notes?: string;
};

// ---------- HELPERS -------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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

/**
 * Normalizza la data dell'Excel in formato YYYY-MM-DD.
 *
 * Excel può consegnare:
 *  - una stringa (es. "2026-09-14", "14/09/2026")
 *  - un numero seriale (giorni dal 1900-01-01)
 *  - un oggetto Date (se cellDates: true)
 */
function parseDateCell(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "number") {
    // Excel serial date: giorni dal 1900-01-01 (con quirk Lotus 1-2-3)
    const parsed = XLSX.SSF.parse_date_code(v);
    if (!parsed) return null;
    const yyyy = String(parsed.y).padStart(4, "0");
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY o DD-MM-YYYY
  const it = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (it) {
    const [, d, m, y] = it;
    return `${y}-${(m ?? "").padStart(2, "0")}-${(d ?? "").padStart(2, "0")}`;
  }
  return null;
}

/**
 * Normalizza orario in formato HH:MM 24h.
 * Excel può consegnare frazione di giornata (es. 0.6458... = 15:30).
 */
function parseTimeCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "15:00";
  if (typeof v === "number") {
    // Frazione 0..1 = orario
    const totalMin = Math.round(v * 24 * 60);
    const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[:.](\d{2})/);
  if (m) {
    return `${(m[1] ?? "").padStart(2, "0")}:${m[2] ?? "00"}`;
  }
  return "15:00";
}

// ---------- MAIN ----------------------------------------------------------

type TeamRef = { _id: string; slug: string };
type CompRef = { _id: string; slug: string; name: string };

async function main() {
  console.log(`Reading file: ${path.basename(absPath)}`);
  const workbook = XLSX.readFile(absPath, { cellDates: true });
  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase() === "partite") ??
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
  const rows = XLSX.utils.sheet_to_json<MatchRow>(sheet, { defval: "" });
  console.log(`Foglio: ${sheetName} | Righe trovate: ${rows.length}`);

  // Cache team + competition
  const teams = await client.fetch<TeamRef[]>(
    `*[_type == "team" && defined(slug.current)]{ _id, "slug": slug.current }`,
  );
  const teamBySlug = new Map(teams.map((t) => [t.slug, t._id]));
  console.log(`Team disponibili: ${teams.length}`);

  const comps = await client.fetch<CompRef[]>(
    `*[_type == "competition" && defined(slug.current)]{ _id, "slug": slug.current, name }`,
  );
  const compBySlug = new Map(comps.map((c) => [c.slug, c]));
  console.log(`Competizioni disponibili: ${comps.length}`);
  if (comps.length === 0) {
    console.error(
      "\nNessuna competizione trovata su Sanity. Crea prima le competition in Studio.",
    );
    process.exit(1);
  }
  console.log(`  Slug: ${comps.map((c) => c.slug).join(", ")}\n`);

  // Cache club per slug (popolata progressivamente)
  type ClubRef = { _id: string; slug: string };
  const initialClubs = await client.fetch<ClubRef[]>(
    `*[_type == "club" && defined(slug.current)]{ _id, "slug": slug.current }`,
  );
  const clubBySlug = new Map(initialClubs.map((c) => [c.slug, c._id]));
  console.log(`Club gia' registrati: ${initialClubs.length}`);

  // Cache opponent per (clubId, compId)
  type OppRef = { _id: string; clubRef: string; compRef: string };
  const initialOpps = await client.fetch<OppRef[]>(
    `*[_type == "opponent"]{ _id, "clubRef": club._ref, "compRef": competition._ref }`,
  );
  const oppByKey = new Map(
    initialOpps.map((o) => [`${o.clubRef}::${o.compRef}`, o._id]),
  );
  console.log(`Opponent gia' registrati: ${initialOpps.length}\n`);

  const stats = {
    matches: { created: 0, updated: 0, skipped: 0, errors: 0 },
    clubs: { created: 0, reused: 0 },
    opponents: { created: 0, reused: 0 },
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const lineNum = i + 2;
    const teamSlug = asString(row.teamSlug);
    const competitionSlug = asString(row.competitionSlug);

    if (!teamSlug || !competitionSlug) {
      console.warn(
        `  ⊘ Riga ${lineNum}: teamSlug/competitionSlug mancante → skip`,
      );
      stats.matches.skipped++;
      continue;
    }
    const teamId = teamBySlug.get(teamSlug);
    if (!teamId) {
      console.warn(
        `  ⊘ Riga ${lineNum}: team '${teamSlug}' non esiste su Sanity → skip`,
      );
      stats.matches.skipped++;
      continue;
    }
    const comp = compBySlug.get(competitionSlug);
    if (!comp) {
      console.warn(
        `  ⊘ Riga ${lineNum}: competition '${competitionSlug}' non esiste su Sanity → skip`,
      );
      stats.matches.skipped++;
      continue;
    }

    const dateIso = parseDateCell(row.date);
    if (!dateIso) {
      console.warn(
        `  ⊘ Riga ${lineNum}: data mancante o non valida ('${row.date}') → skip`,
      );
      stats.matches.skipped++;
      continue;
    }
    const time = parseTimeCell(row.time);
    const dateTimeIso = new Date(`${dateIso}T${time}:00`).toISOString();

    const home = asBoolean(row.home);
    const isOpponentTbd = asBoolean(row.isOpponentTbd);
    const isDateTbd = asBoolean(row.isDateTbd);
    const matchday = asNumber(row.matchday);
    const status = asString(row.status) || "scheduled";
    if (!VALID_STATUS.has(status)) {
      console.warn(
        `  ⊘ Riga ${lineNum}: status '${status}' non valido → skip`,
      );
      stats.matches.skipped++;
      continue;
    }

    const opponentName = asString(row.opponentName);
    const opponentShortName =
      asString(row.opponentShortName) || opponentName.slice(0, 20);

    if (!isOpponentTbd && !opponentName) {
      console.warn(
        `  ⊘ Riga ${lineNum}: opponentName richiesto (o attiva isOpponentTbd) → skip`,
      );
      stats.matches.skipped++;
      continue;
    }

    // ---- CLUB upsert (solo se non TBD) ----------------------------------
    let opponentRefId: string | undefined;
    if (!isOpponentTbd && opponentName) {
      const oppSlug = slugify(opponentShortName || opponentName);
      if (!oppSlug) {
        console.warn(
          `  ⊘ Riga ${lineNum}: slug avversario vuoto da '${opponentName}' → skip`,
        );
        stats.matches.skipped++;
        continue;
      }

      let clubId = clubBySlug.get(oppSlug);
      if (!clubId) {
        const newClubId = `imp-club-${oppSlug}`;
        try {
          await client.createIfNotExists({
            _id: newClubId,
            _type: "club",
            name: opponentName,
            shortName: opponentShortName.slice(0, 20),
            slug: { _type: "slug", current: oppSlug },
            isActive: true,
          });
          clubBySlug.set(oppSlug, newClubId);
          clubId = newClubId;
          stats.clubs.created++;
          console.log(`  + Club creato (stub): ${opponentShortName} (${oppSlug})`);
        } catch (err) {
          console.error(
            `  ✗ Errore creazione club '${opponentName}' (riga ${lineNum}):`,
            err instanceof Error ? err.message : err,
          );
          stats.matches.errors++;
          continue;
        }
      } else {
        stats.clubs.reused++;
      }

      // ---- OPPONENT upsert -----------------------------------------------
      const oppKey = `${clubId}::${comp._id}`;
      opponentRefId = oppByKey.get(oppKey);
      if (!opponentRefId) {
        const newOppId = `imp-opp-${oppSlug}--${competitionSlug}`.slice(0, 96);
        try {
          await client.createIfNotExists({
            _id: newOppId,
            _type: "opponent",
            club: { _type: "reference", _ref: clubId },
            competition: { _type: "reference", _ref: comp._id },
            isActive: true,
          });
          oppByKey.set(oppKey, newOppId);
          opponentRefId = newOppId;
          stats.opponents.created++;
        } catch (err) {
          console.error(
            `  ✗ Errore creazione opponent '${opponentName}' in '${competitionSlug}' (riga ${lineNum}):`,
            err instanceof Error ? err.message : err,
          );
          stats.matches.errors++;
          continue;
        }
      } else {
        stats.opponents.reused++;
      }
    }

    // ---- MATCH upsert ---------------------------------------------------
    const dateKey = dateIso.replace(/-/g, "");
    const oppKeyPart = isOpponentTbd
      ? "tbd"
      : slugify(opponentShortName || opponentName);
    const matchdayKey =
      typeof matchday === "number" ? `g${matchday}` : `d${dateKey}`;
    const matchId =
      `imp-match-${teamSlug}--${competitionSlug}--${matchdayKey}--${oppKeyPart}`.slice(
        0,
        96,
      );

    const matchFields: Record<string, unknown> = {
      _type: "match",
      team: { _type: "reference", _ref: teamId },
      competition: { _type: "reference", _ref: comp._id },
      date: dateTimeIso,
      home,
      status,
      isOpponentTbd,
      isDateTbd,
    };
    if (typeof matchday === "number") matchFields.matchday = matchday;
    if (opponentRefId)
      matchFields.opponent = { _type: "reference", _ref: opponentRefId };

    const venue = asString(row.venue);
    if (venue) matchFields.venue = venue;
    const scoreHome = asNumber(row.scoreHome);
    if (typeof scoreHome === "number") matchFields.scoreHome = scoreHome;
    const scoreAway = asNumber(row.scoreAway);
    if (typeof scoreAway === "number") matchFields.scoreAway = scoreAway;
    const reportLink = asString(row.reportLink);
    if (reportLink) matchFields.reportLink = reportLink;
    const highlightsUrl = asString(row.highlightsUrl);
    if (highlightsUrl) matchFields.highlightsUrl = highlightsUrl;
    const notes = asString(row.notes);
    if (notes) matchFields.notes = notes;

    try {
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_id == $id][0]{ _id }`,
        { id: matchId },
      );
      if (existing) {
        await client.patch(matchId).set(matchFields).commit();
        const label = isOpponentTbd
          ? "(TBD)"
          : (opponentShortName || opponentName);
        console.log(
          `  ↻ Updated:  ${teamSlug} ${home ? "vs" : "@"} ${label}  (${dateIso}${typeof matchday === "number" ? ` · g${matchday}` : ""})`,
        );
        stats.matches.updated++;
      } else {
        await client.create({ _id: matchId, ...matchFields } as never);
        const label = isOpponentTbd
          ? "(TBD)"
          : (opponentShortName || opponentName);
        console.log(
          `  + Created:  ${teamSlug} ${home ? "vs" : "@"} ${label}  (${dateIso}${typeof matchday === "number" ? ` · g${matchday}` : ""})`,
        );
        stats.matches.created++;
      }
    } catch (err) {
      console.error(
        `  ✗ Errore match riga ${lineNum}:`,
        err instanceof Error ? err.message : err,
      );
      stats.matches.errors++;
    }
  }

  console.log("\n=== Riepilogo ===");
  console.log(
    `  Match     - Created: ${stats.matches.created} | Updated: ${stats.matches.updated} | Skipped: ${stats.matches.skipped} | Errors: ${stats.matches.errors}`,
  );
  console.log(
    `  Club      - Creati (stub): ${stats.clubs.created} | Riusati: ${stats.clubs.reused}`,
  );
  console.log(
    `  Opponent  - Creati: ${stats.opponents.created} | Riusati: ${stats.opponents.reused}`,
  );
  if (stats.clubs.created > 0) {
    console.log(
      `\n→ Ricordati di caricare i logo dei ${stats.clubs.created} club nuovi`,
    );
    console.log(`  in Sanity Studio > Club. Ora hanno solo nome e nome breve.`);
  }
  console.log("");

  if (stats.matches.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
