import type { MetadataRoute } from "next";

/**
 * robots.txt generato dal Metadata API. Disallow su:
 * - /studio: l'editor Sanity embedded (login required ma evitiamo
 *   che finisca nei risultati di ricerca)
 * - /api: le route API non hanno valore SEO
 * - /dev: pagine di test interne (es. /dev/typography)
 *
 * Crawler robots.txt non garantisce sicurezza (Googlebot lo rispetta,
 * altri possono ignorarlo) — la protezione vera viene da auth lato
 * Sanity Studio.
 *
 * Sitemap puntata su URL canonico (www.orbassanocalcio.com).
 */
const SITE_URL = "https://www.orbassanocalcio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/", "/dev/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
