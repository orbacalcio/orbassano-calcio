/**
 * Variabili d'ambiente Sanity PUBBLICHE (NEXT_PUBLIC_*).
 *
 * Pattern strict via assertValue: senza fallback silenziosi che
 * mascherano la mancanza di .env.local con un placeholder phantom.
 *
 * I valori esportati qui sono safe da importare anche lato client
 * (image url builder etc). Per i token segreti vedi `env.server.ts`.
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
