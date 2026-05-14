import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";
import { readToken } from "./env.server";

/**
 * Client Sanity di sola lettura per Server Components.
 *
 * Il dataset di questo progetto e' **privato**: le query anonime al
 * CDN/API ritornano vuoto. Quando `SANITY_API_READ_TOKEN` e' settato
 * lo passiamo al client e disattiviamo il CDN (gli endpoint CDN non
 * accettano richieste autenticate).
 *
 * `import "server-only"` impedisce che questo modulo finisca nel
 * bundle browser per errore: il token non puo' mai trapelare al client.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !readToken && process.env.NODE_ENV === "production",
  perspective: "published",
  ...(readToken ? { token: readToken } : {}),
});
