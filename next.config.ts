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
  // Gallery promossa a top-level (2026-05-15): le vecchie URL /news/gallery
  // reindirizzano permanentemente al nuovo /gallery. Preserva eventuali
  // link esterni / bookmark / Open Graph cache.
  { source: "/news/gallery", destination: "/gallery" },
  { source: "/news/gallery/:slug", destination: "/gallery/:slug" },
];

/**
 * Headers di sicurezza applicati a TUTTE le route.
 *
 * CSP in modalita' Report-Only: il browser segnala violazioni senza
 * bloccare le risorse. Permette di osservare cosa carica realmente
 * il sito in produzione (Sanity Studio, Behold, embed Instagram)
 * prima di passare al CSP enforcement (M9). Sanity Studio richiede
 * 'unsafe-eval' (motore GROQ in browser) e 'unsafe-inline' (style
 * dinamici dei componenti). Behold carica da w.behold.so e da
 * instagram CDN per le immagini.
 *
 * HSTS: gia' settato da Vercel di default, ribadito esplicito qui per
 * portabilita' verso altri host.
 */
const cspReportOnly = [
  "default-src 'self'",
  // script-src include:
  // - cdn.sanity.io + *.sanity.io: Studio embedded
  // - core.sanity-cdn.com + *.sanity-cdn.com: bridge JS di Sanity Studio
  //   (caricato dinamicamente per AI helpers + assist features)
  // - w.behold.so + embed.behold.so: widget Instagram Vivi l'Orba
  // - vercel.live + *.vercel.live: Vercel preview comments / feedback
  //   (script iniettato sui deploy preview Vercel, non in produzione
  //   ma comodo per testing)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io https://core.sanity-cdn.com https://*.sanity-cdn.com https://w.behold.so https://embed.behold.so https://vercel.live https://*.vercel.live https://media-library.cloudinary.com https://widget.cloudinary.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://*.cdninstagram.com https://*.fbcdn.net https://behold.so https://w.behold.so https://vercel.live https://res.cloudinary.com",
  "font-src 'self' data: https://fonts.gstatic.com https://vercel.live",
  // connect-src: Sanity API (HTTP + WebSocket per real-time sync),
  // Behold, Instagram CDN, Vercel Live (feedback API), Cloudinary
  // (upload API + media library widget).
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.sanity-cdn.com https://w.behold.so https://behold.so https://*.cdninstagram.com https://vercel.live wss://*.pusher.com https://api.cloudinary.com https://res.cloudinary.com",
  // frame-src: Instagram embed (Behold widget), Behold direct,
  // Vercel Live (toolbar comments preview), Cloudinary Media Library
  // widget (apre iframe verso media-library.cloudinary.com per browse).
  "frame-src 'self' https://www.instagram.com https://w.behold.so https://vercel.live https://media-library.cloudinary.com",
  "media-src 'self' https://cdn.sanity.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Impedisce che il browser MIME-sniffi un response: previene attacchi
  // che fanno servire un file uploadato come HTML/JS.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Previene clickjacking: il sito non puo' essere caricato in <iframe>
  // da altri domini. SAMEORIGIN (non DENY) perche' Sanity Presentation
  // apre la preview del sito in iframe interno same-origin.
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
  // CSP Report-Only: osservazione 2 settimane in prod, poi passaggio a
  // Content-Security-Policy enforcement.
  {
    key: "Content-Security-Policy-Report-Only",
    value: cspReportOnly,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      // Cloudinary CDN per le foto delle gallery migrate dal pattern
      // ibrido Sanity legacy + Cloudinary (2026-05-16). Tutte le foto
      // caricate via il plugin sanity-plugin-cloudinary vivono qui.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
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
