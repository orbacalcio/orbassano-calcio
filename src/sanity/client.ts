import { createClient, type ClientConfig } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "./env";

const baseConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  // Disabilitiamo il CDN in dev per vedere subito le modifiche dello Studio.
  // In produzione next-sanity usa la cache HTTP del CDN automaticamente.
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
};

/**
 * Client Sanity di sola lettura. Usalo nelle Server Components.
 * Per draft/preview usa il client con `perspective: 'previewDrafts'`
 * configurato a parte (lo aggiungeremo in M3 con next-sanity/live).
 */
export const sanityClient = createClient(baseConfig);

/**
 * Client autenticato per lettura privilegiata server-side (es. preview).
 * Non usarlo mai in componenti client.
 */
export const authenticatedClient = readToken
  ? createClient({ ...baseConfig, token: readToken, useCdn: false })
  : null;
