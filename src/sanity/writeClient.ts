import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Client Sanity con write token. Usato esclusivamente da API route
 * server-side che devono creare/aggiornare documenti (es. submission
 * whistleblowing in /api/whistleblowing/route.ts, audit log consensi
 * cookie in /api/consent/route.ts).
 *
 * `import "server-only"` impedisce che questo modulo finisca nel
 * bundle browser per errore: il write token non puo' MAI trapelare
 * al client (sarebbe un grosso problema di sicurezza — chiunque
 * potrebbe scrivere documenti nel CMS).
 *
 * Se SANITY_API_WRITE_TOKEN non e' configurato, il client viene
 * comunque creato ma le mutation falliranno con 401. Le API route
 * devono fare graceful error handling (vedi pattern in
 * /api/whistleblowing/route.ts).
 */
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // mai CDN per write
  token: writeToken,
  perspective: "raw",
});

export const isWriteClientConfigured = Boolean(writeToken);
