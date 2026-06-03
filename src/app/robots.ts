import type { MetadataRoute } from "next";

/**
 * robots.txt generato dal Metadata API.
 *
 * Due modalita':
 *
 * 1) **Coming Soon attivo** (`COMING_SOON_MODE=true`): disallow totale.
 *    Tutti i crawler che rispettano robots.txt (Googlebot, Bingbot,
 *    ecc.) saltano l'indicizzazione. Niente sitemap pubblicato. Cosi'
 *    Google non cattura uno snapshot della landing pre-lancio.
 *    Vedi anche src/app/sitemap.ts (ritorna array vuoto in modalita'
 *    coming soon) e src/app/coming-soon/page.tsx (`robots: noindex`).
 *
 * 2) **Modalita' normale** (post go-live): allow su tutto tranne
 *    `/studio` (editor Sanity), `/api/` (no SEO value) e `/dev/`
 *    (pagine di test interne).
 *
 * Nota sicurezza: robots.txt e' una convenzione, NON una protezione.
 * Googlebot lo rispetta, crawler malevoli no — la protezione vera per
 * `/studio` viene dal basic auth in `proxy.ts` + auth Sanity nativo.
 *
 * Sitemap puntata su URL canonico (www.orbassanocalcio.com).
 */
const SITE_URL = "https://www.orbassanocalcio.com";

export default function robots(): MetadataRoute.Robots {
  if (process.env.COMING_SOON_MODE === "true") {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
      // Niente sitemap durante coming soon: la nostra sitemap e' vuota
      // in questa modalita', linkarla genererebbe segnali confusi.
      host: SITE_URL,
    };
  }

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
