/**
 * Variabili d'ambiente Sanity, tipizzate.
 *
 * In dev se mancano cadiamo su placeholder per non bloccare la
 * compilazione dello Studio embedded (il client mostrera' errore di
 * connessione finche l'utente non popola .env.local con i valori veri
 * generati su manage.sanity.io). In produzione invece blocchiamo: niente
 * deploy con credenziali mancanti.
 */

function readEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Variabile d'ambiente mancante: ${key}`);
  }
  return "";
}

export const projectId = readEnv(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NODE_ENV === "production" ? undefined : "orbassano-calcio",
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
