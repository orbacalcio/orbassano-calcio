/**
 * Variabili d'ambiente Sanity. Pattern strict via assertValue per
 * projectId e dataset: senza fallback silenziosi che mascherano la
 * mancanza di .env.local con un placeholder phantom.
 */

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
}

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01";

/** Token di sola lettura per server components. Mai esposto al client. */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";

/** Token di scrittura per scripts/seed.ts. Mai esposto al client. */
export const writeToken = process.env.SANITY_API_WRITE_TOKEN ?? "";

/** Segreto condiviso col webhook Sanity per /api/revalidate. */
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET ?? "";
