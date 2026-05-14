/**
 * Variabili d'ambiente Sanity SERVER-ONLY (token e segreti).
 *
 * Tutti i valori esportati qui sono `process.env.*` senza prefisso
 * NEXT_PUBLIC_, quindi Next non li bundla nel client per design. Il
 * `import "server-only"` aggiunge una rete di sicurezza belt-and-
 * suspenders: se un client component importasse per errore da questo
 * modulo, il build fallirebbe con un errore chiaro invece di
 * propagare stringhe vuote silenziose a runtime.
 */
import "server-only";

/** Token di sola lettura per Server Components. Mai esposto al client. */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";

/** Token di scrittura per API route server-side e scripts/seed.ts. */
export const writeToken = process.env.SANITY_API_WRITE_TOKEN ?? "";

/** Segreto condiviso col webhook Sanity per /api/revalidate + /api/news-dispatch. */
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET ?? "";
