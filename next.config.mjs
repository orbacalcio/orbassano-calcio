// @ts-check

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
  // /scuola-calcio-orbassano → /squadre/settore-giovanile (2026-06-05):
  // il team `scuola-calcio` su Sanity e' isActive:false (gestita oggi
  // da Sporting Orbassano, fuori dal nostro tesseramento), quindi
  // /squadre/scuola-calcio ritornerebbe 404. Reindirizziamo al settore
  // giovanile che e' il sostituto operativo piu' naturale. Quando il
  // club reintegrera' la Scuola Calcio, basta riattivare il team in
  // Studio e cambiare questa destination.
  { source: "/scuola-calcio-orbassano", destination: "/squadre/settore-giovanile" },
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
  // media-src: Sanity CDN (audio/video legacy) + Cloudinary
  // (video news uploadati via plugin, vedi NewsVideo).
  "media-src 'self' https://cdn.sanity.io https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // report-uri (legacy, ~80% browser): endpoint che riceve violation
  // report quando una risorsa viene bloccata. Vedi /api/csp-report.
  // Senza, il passaggio Report-Only → enforce e' cieco.
  "report-uri /api/csp-report",
  // report-to (moderno, paired con header Reporting-Endpoints sotto):
  // Chrome/Edge/Firefox moderni preferiscono questo. Il nome
  // "csp-endpoint" deve combaciare con la chiave in Reporting-Endpoints.
  "report-to csp-endpoint",
  // NB: 'upgrade-insecure-requests' NON e' qui. E' ignorato dal browser
  // quando consegnato in una policy Report-Only (genera il warning
  // DevTools "directive ... is ignored when delivered in a report-only
  // policy"), quindi in questa fase non serve. Va RI-AGGIUNTO al
  // passaggio a CSP enforcement (Content-Security-Policy, non
  // -Report-Only), dove invece ha effetto. Vedi commento header sotto.
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
  // Reporting-Endpoints: dichiarazione moderna degli endpoint di
  // reporting (paired con `report-to csp-endpoint` nella CSP sopra).
  // Browser-only feature: i browser legacy che non la capiscono
  // ricadono su `report-uri` (gia' nella policy). Vedi
  // src/app/api/csp-report/route.ts per la logica server-side.
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoint="/api/csp-report"',
  },
];

/**
 * Coming Soon Gate via Vercel rewrites (vedi anche
 * src/app/coming-soon/page.tsx, src/app/api/preview/route.ts).
 *
 * Perche' rewrites e non proxy.ts: in Next.js 16 il proxy gira di
 * default su runtime Node.js. Vercel serve le pagine statiche dal
 * CDN edge senza invocare la function proxy, quindi proxy.ts NON
 * intercetta le rotte prerenderizzate (testato 2026-06-03, header
 * x-cs-proxy assente su /, /squadre, /studio).
 *
 * Le rewrites Next/Vercel invece sono interpretate dal routing
 * Vercel PRIMA del CDN cache: garantito che intercettino ogni rotta
 * pubblica.
 *
 * Attivazione: setta `COMING_SOON_MODE=true` su Vercel + redeploy.
 * La funzione `rewrites()` viene valutata al build, quindi il flip
 * richiede un nuovo build (lo stesso vincolo che avremmo avuto col
 * proxy).
 *
 * Bypass: visita `/api/preview?key=<COMING_SOON_BYPASS_KEY>`. Setta
 * cookie httpOnly `cs-bypass=1` per 14 giorni; le rewrites hanno
 * `missing: cookie cs-bypass=1` quindi chi ha il cookie vede il sito
 * reale. Per uscire dall'anteprima: `/api/preview?reset=1`.
 */
const comingSoonActive = process.env.COMING_SOON_MODE === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Formati moderni in ordine di preferenza. AVIF prima (~30% piu'
    // leggero del WebP a parita' di qualita') con fallback WebP per
    // browser legacy. Next.js serve automaticamente il primo formato
    // supportato dall'Accept header del browser.
    formats: ["image/avif", "image/webp"],
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
  async rewrites() {
    if (!comingSoonActive) return [];
    return {
      beforeFiles: [
        {
          // Rewrite TUTTE le rotte pubbliche → /coming-soon. URL
          // preservata in barra (rewrite trasparente). Esclusioni
          // (lookahead negativo):
          //  - coming-soon (target del rewrite, evita loop)
          //  - api        (route handler + bypass /api/preview)
          //  - studio     (CMS Sanity, basic auth in proxy.ts)
          //  - _next      (asset Next.js build-time)
          //  - robots.txt / sitemap.xml (file metadata speciali —
          //    src/app/robots.ts gestisce il Disallow / da solo)
          //  - opengraph-image / twitter-image (OG dinamiche)
          //  - .*\..*    (qualsiasi path con un punto: Logo.png,
          //               file.css, font.woff2, etc.)
          source:
            "/((?!coming-soon|api|studio|_next|robots\\.txt|sitemap\\.xml|opengraph-image|twitter-image|.*\\..*).*)",
          missing: [
            { type: "cookie", key: "cs-bypass", value: "1" },
          ],
          destination: "/coming-soon",
        },
      ],
    };
  },
  async redirects() {
    // Redirect interni 301 per pagine spostate/accorpate: preservano
    // il PageRank dei link esterni che puntano al vecchio path.
    // - /settore-giovanile/tornei → /tornei (top-level multi-categoria
    //   2026-05-17, supporta anche Prima Squadra/Juniores).
    // - /settore-giovanile → /squadre/settore-giovanile (la hub page
    //   con sezioni Open Days+Tornei e' stata accorpata nella vista
    //   categoria /squadre/settore-giovanile 2026-05-17).
    // - /settore-giovanile/open-days → /settore-giovanile/summer-camp
    //   (2026-05-21: rinominata in "Summer Camp" perche' da regolamento
    //   FIGC le selezioni/open day non si possono fare prima del 1°
    //   luglio; l'attivita' di meta' giugno e' un camp estivo).
    const internalRedirects = [
      {
        source: "/settore-giovanile/tornei",
        destination: "/tornei",
        permanent: true,
      },
      {
        source: "/settore-giovanile/open-days",
        destination: "/settore-giovanile/summer-camp",
        permanent: true,
      },
      {
        source: "/settore-giovanile",
        destination: "/squadre/settore-giovanile",
        permanent: true,
      },
    ];
    const wixMapped = wixRedirects.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
    return [...wixMapped, ...internalRedirects];
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
