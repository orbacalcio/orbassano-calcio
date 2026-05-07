/**
 * Variabili d'ambiente Sanity, tipizzate.
 *
 * Lettura tollerante: se mancano le env in build/dev, restituiamo un
 * placeholder e il client mostrera' errore di connessione finche'
 * l'utente non popola .env.local (locale) o le env vars su Vercel
 * (produzione). Cosi' il build non si blocca e lo Studio embedded
 * compila comunque.
 */
function readEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
}

export const projectId = readEnv(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "orbassano-calcio",
);

export const dataset = readEnv("NEXT_PUBLIC_SANITY_DATASET", "production");

export const apiVersion = readEnv(
  "NEXT_PUBLIC_SANITY_API_VERSION",
  "2026-01-01",
);

/** Token di sola lettura per server components. Mai esposto al client. */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";

/** Token di scrittura per scripts/seed.ts. Mai esposto al client. */
export const writeToken = process.env.SANITY_API_WRITE_TOKEN ?? "";

/** Segreto condiviso col webhook Sanity per validare le chiamate a /api/revalidate. */
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET ?? "";
