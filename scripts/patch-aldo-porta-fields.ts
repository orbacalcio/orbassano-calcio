/**
 * One-shot patch: aggiorna la 3a voce del campo `fields` del documento
 * facility 'centro-sportivo-aldo-porta' su Sanity production.
 *
 * "Tribune, aree verdi, spogliatoi, uffici" →
 * "Tribuna, bar, area parcheggio, uffici"
 *
 * Eseguire da c:\Temp\CLAUDE CODE\orbassanocalcio\orbassano-calcio:
 *   pnpm tsx --env-file=.env.local scripts/patch-aldo-porta-fields.ts
 *
 * Richiede SANITY_API_WRITE_TOKEN nel .env.local.
 *
 * Idempotente: matcha qualsiasi riga contenente "tribune", "spogliatoi"
 * o "aree verdi" (case-insensitive) e la sostituisce; se non trova nulla,
 * appende la nuova riga in coda.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN",
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

const TARGET_SLUG = "centro-sportivo-aldo-porta";
const NEW_LINE = "Tribuna, bar, area parcheggio, uffici";

async function main() {
  const doc = await client.fetch<{ _id: string; fields: string[] | null } | null>(
    `*[_type == "facility" && slug.current == $slug][0]{ _id, fields }`,
    { slug: TARGET_SLUG },
  );

  if (!doc) {
    console.error(`Documento facility con slug "${TARGET_SLUG}" non trovato`);
    process.exit(1);
  }

  const before = doc.fields ?? [];
  console.log("BEFORE fields:");
  before.forEach((f, i) => console.log(`  [${i}] ${f}`));

  const targetIdx = before.findIndex(
    (f) => /tribune/i.test(f) || /spogliatoi/i.test(f) || /aree verdi/i.test(f),
  );

  const after = [...before];
  if (targetIdx === -1) {
    console.log("\nNessuna riga matchata: appendo NEW_LINE in coda.");
    after.push(NEW_LINE);
  } else if (after[targetIdx] === NEW_LINE) {
    console.log(`\nRiga [${targetIdx}] gia' aggiornata. No-op.`);
    return;
  } else {
    console.log(
      `\nRiga matchata index ${targetIdx}: "${before[targetIdx]}" → "${NEW_LINE}"`,
    );
    after[targetIdx] = NEW_LINE;
  }

  await client.patch(doc._id).set({ fields: after }).commit();

  console.log("\nAFTER fields:");
  after.forEach((f, i) => console.log(`  [${i}] ${f}`));
  console.log(
    "\nDocumento aggiornato. La pagina /societa/impianti si refresha al prossimo webhook revalidate (tag 'facility') o redeploy.",
  );
}

main().catch((err) => {
  console.error("Errore patch:", err);
  process.exit(1);
});
