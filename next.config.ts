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

/**
 * Headers di sicurezza applicati a TUTTE le route.
 *
 * Niente CSP qui: Sanity Studio embedded (/studio) e il widget Behold
 * Instagram caricano script da host multipli (cdn.sanity.io, w.behold.so,
 * embed di Instagram). Una CSP corretta richiede test in produzione e
 * va aggiunta come header successivo dopo verifica con Report-Only —
 * per ora prevenuiamo i vettori XSS lato render (vedi
 * src/components/seo/JsonLd.tsx + src/lib/validation.ts isSafeUrl).
 *
 * HSTS: gia' settato da Vercel di default, ribadito esplicito qui per
 * portabilita' verso altri host.
 */
const securityHeaders = [
  // Impedisce che il browser MIME-sniffi un response: previene attacchi
  // che fanno servire un file uploadato come HTML/JS.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Previene clickjacking: il sito non puo' essere caricato in <iframe>
  // da altri domini. SAMEORIGIN permette al Studio embedded di
  // funzionare se mai aprisse un proprio iframe nella stessa origine.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Riduce data leakage cross-origin nei referrer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disabilita esplicitamente API browser non usate: previene futuri
  // script (anche di terze parti caricate da Behold) di richiederle.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HSTS: forza HTTPS per 2 anni + tutti i subdomain + permette il
  // preload di Chrome/Firefox. Safe dopo il cutover DNS M8.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
