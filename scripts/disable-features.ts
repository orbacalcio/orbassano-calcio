/**
 * One-shot per disattivare le feature in stand-by:
 * - team `scuola-calcio` → isActive: false
 * - facility `sporting-orbassano-stadio-mazzola` → isActive: false
 *
 * Usa `patch().set()` (non createOrReplace): NON sovrascrive gli
 * altri campi del documento, eventuali edit manuali fatti dall'admin
 * dallo Studio restano intatti. Sicuro da rilanciare.
 *
 * Quando vuoi riattivare:
 * - Dallo Studio: apri il documento → toggle Attiva/Attivo → publish
 * - O cambia false → true qui sotto e rilancia
 *
 * Uso:
 *   pnpm tsx --env-file=.env.local scripts/disable-features.ts
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

const PATCHES: Array<{ id: string; isActive: boolean; description: string }> = [
  {
    id: "team.scuola-calcio",
    isActive: false,
    description: "Team Scuola Calcio",
  },
  {
    id: "facility.sporting-orbassano-stadio-mazzola",
    isActive: false,
    description: "Facility Stadio Valentino Mazzola",
  },
];

async function main() {
  console.log(
    `Disable features → projectId=${projectId} dataset=${dataset}\n`,
  );

  for (const p of PATCHES) {
    try {
      await client
        .patch(p.id)
        .set({ isActive: p.isActive })
        .commit({ visibility: "async" });
      console.log(
        `  ✓ ${p.description} (${p.id}) → isActive=${p.isActive}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // 404 → documento non esiste → non bloccante (forse non era seedato)
      if (msg.includes("not found") || msg.includes("404")) {
        console.log(`  · ${p.description} (${p.id}) — non esiste, skip`);
      } else {
        console.error(`  ✗ ${p.description} (${p.id}) →`, msg);
      }
    }
  }

  console.log("\nDone. Webhook Sanity → /api/revalidate aggiorna il sito.");
}

main().catch((err: unknown) => {
  console.error("\n✗ Disable features fallito:", err);
  process.exit(1);
});
