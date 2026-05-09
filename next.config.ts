import type { NextConfig } from "next";

/**
 * Tabella redirect 301 dalle vecchie URL Wix → nuove URL del sito.
 * Fonte: docs/DATA_ORBASSANO.md §12 (mapping ufficiale validato col
 * club). Tutti permanenti perche' il sito attuale e' indicizzato da
 * anni: 301 trasferisce la link equity.
 *
 * NB: queste 301 si attivano solo dopo lo switch DNS (M8). Prima del
 * cutover il dominio orbassanocalcio.com punta ancora a Wix; queste
 * regole vivono sul deployment Vercel raggiungibile via *.vercel.app.
 *
 * `permanent: true` = HTTP 308 (Next 16 default). I crawler trattano
 * 308 come 301 ai fini SEO (preservano metodo POST → POST, ma per
 * GET sitemap-only il comportamento equivale a 301).
 */
const wixRedirects = [
  { source: "/club-orbassano-calcio", destination: "/societa" },
  { source: "/biglietteria-calcio-orbassano", destination: "/societa/biglietteria" },
  { source: "/storia-orbassano-calcio", destination: "/societa/storia" },
  { source: "/organigramma-orbassano-calcio", destination: "/societa/organigramma" },
  { source: "/impianti-sportivi-calcio-orbassano", destination: "/societa/impianti" },
  { source: "/newsletter-orbassano-calcio", destination: "/newsletter" },
  { source: "/dona-5x1000-orbassano-calcio", destination: "/5x1000" },
  { source: "/squadre-di-calcio-orbassano", destination: "/squadre" },
  { source: "/prima-squadra", destination: "/squadre/prima-squadra" },
  {
    source: "/settore-giovanile-e-scolastico-orbassano",
    destination: "/squadre/settore-giovanile",
  },
  { source: "/scuola-calcio-orbassano", destination: "/squadre/scuola-calcio" },
  { source: "/sponsor-e-partner-orbassano-calcio", destination: "/sponsor" },
  { source: "/sponsorship-asd-orbassano-calcio", destination: "/sponsor" },
  { source: "/partnership-asd-orbassano-calcio", destination: "/sponsor/partner" },
  {
    source: "/sponsor-opportunities-orbassano-calcio",
    destination: "/sponsor/opportunita",
  },
  { source: "/termini-e-condizioni", destination: "/legal/termini" },
  { source: "/informativa-privacy", destination: "/legal/privacy" },
  { source: "/cookie-policy", destination: "/legal/cookie" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return wixRedirects.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
