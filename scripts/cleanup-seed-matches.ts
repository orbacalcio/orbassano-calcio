/**
 * Diagnostica + cleanup dei documenti match orfani/seed rimasti dopo
 * eliminazioni manuali dallo Studio.
 *
 * Quando l'admin cancella un documento "published" dallo Studio ma esisteva
 * anche una versione draft, Sanity tiene il draft (prefisso `drafts.`) come
 * orfano: nella document list compare "Missing document" perche' il preview
 * non riesce a renderlo. Stesso effetto se manca la reference `team`.
 *
 * Questo script:
 *  1. Lista TUTTI i match (published + draft) con il loro team ref.
 *  2. Identifica gli orfani: id seed-* o team mancante/non risolvibile.
 *  3. Stampa il piano; se DELETE=1 esegue la cancellazione in transazione.
 *
 * Esecuzione:
 *   `pnpm tsx --env-file=.env.local scripts/cleanup-seed-matches.ts`         (dry-run)
 *   `DELETE=1 pnpm tsx --env-file=.env.local scripts/cleanup-seed-matches.ts` (esegue)
 */
import "dotenv/config";

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const SHOULD_DELETE = process.env.DELETE === "1";

if (!projectId) {
  console.error("Manca NEXT_PUBLIC_SANITY_PROJECT_ID.");
  process.exit(1);
}
if (!token) {
  console.error("Manca SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

type MatchDoc = {
  _id: string;
  teamRef?: string;
  teamName?: string;
  date?: string;
  status?: string;
};

async function main() {
  const all = await client.fetch<MatchDoc[]>(
    `*[_type == "match"]{
      _id,
      "teamRef": team._ref,
      "teamName": team->name,
      date,
      status
    } | order(_id asc)`,
  );

  console.log(`Trovati ${all.length} documenti match (published + draft).\n`);

  const orphans: MatchDoc[] = [];
  for (const m of all) {
    const isSeed = m._id.replace(/^drafts\./, "").startsWith("match.seed-");
    const teamMissing = m.teamRef && !m.teamName;
    const teamUnset = !m.teamRef;
    if (isSeed || teamMissing || teamUnset) {
      orphans.push(m);
    }
  }

  if (orphans.length === 0) {
    console.log("Nessun orfano. Nulla da pulire.");
    console.log("\nElenco match validi:");
    for (const m of all) {
      console.log(`  ${m._id}  team=${m.teamName ?? "?"}  ${m.date ?? "?"}  [${m.status ?? "?"}]`);
    }
    return;
  }

  console.log(`Orfani da eliminare (${orphans.length}):`);
  for (const m of orphans) {
    const reason = m._id.replace(/^drafts\./, "").startsWith("match.seed-")
      ? "seed id"
      : !m.teamRef
        ? "team mancante"
        : "team ref broken";
    console.log(`  - ${m._id}  (motivo: ${reason})`);
  }

  if (!SHOULD_DELETE) {
    console.log("\nDry-run. Per eliminare: DELETE=1 pnpm tsx --env-file=.env.local scripts/cleanup-seed-matches.ts");
    return;
  }

  const tx = client.transaction();
  for (const m of orphans) tx.delete(m._id);
  await tx.commit();
  console.log(`\nEliminati ${orphans.length} documenti.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
