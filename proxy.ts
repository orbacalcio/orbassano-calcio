import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 "proxy" (ex-middleware) — due responsabilita':
 *
 * 1) **Studio Basic Auth** davanti a `/studio/*` per evitare che
 *    chiunque su Internet possa raggiungere l'interfaccia di Sanity
 *    Studio anche solo per vedere il modulo di login (information
 *    disclosure / phishing surface — vedi AUDIT.md sezione 5.6).
 *    Sanity ha gia' la propria auth, ma esporre l'URL `/studio`
 *    pubblico permette a crawler/bot di profilare lo stack. Il basic
 *    auth a livello edge nasconde lo Studio prima del login Sanity.
 *
 *      Credenziali via env: STUDIO_AUTH_USER + STUDIO_AUTH_PASS.
 *      Se non settate, lo Studio resta accessibile (no regression
 *      in sviluppo locale). In produzione settarle prima del DNS cutover.
 *
 * 2) **Coming Soon Gate** (modalita' pre-lancio): quando l'env
 *    `COMING_SOON_MODE=true`, TUTTE le rotte pubbliche vengono
 *    riscritte verso `/coming-soon` (rewrite: URL nella barra resta
 *    quello digitato, contenuto e' la landing pre-lancio). Cosi'
 *    possiamo cambiare i DNS Wix → Vercel giorni prima del lancio
 *    senza esporre il sito reale.
 *
 *    Eccezioni che PASSANO sempre:
 *      - `/studio*`      → CMS sempre raggiungibile (con basic auth)
 *      - `/api/*`        → webhook revalidate Sanity + Resend forms
 *                          (esclusi dal matcher → proxy non li tocca)
 *      - `/coming-soon`  → target del rewrite (ovvio)
 *      - asset statici   → esclusi dal matcher
 *      - bypass cookie   → impostato via `?preview=<KEY>` (vedi sotto)
 *
 *    Bypass per anteprima admin:
 *      Visita `https://<dominio>/?preview=<COMING_SOON_BYPASS_KEY>`.
 *      Il proxy verifica la key, setta un cookie httpOnly che dura
 *      14 giorni e fa redirect alla stessa URL senza la query (URL
 *      pulito). Da quel momento il browser vede il sito reale.
 *      Per uscire dall'anteprima: cancella il cookie `cs-bypass`.
 *
 *    Disattivazione:
 *      Cambia `COMING_SOON_MODE=false` (o cancella la variabile) su
 *      Vercel e fai redeploy: il proxy lascia passare tutto.
 */

const STUDIO_PATH = "/studio";
const COMING_SOON_PATH = "/coming-soon";
const BYPASS_COOKIE = "cs-bypass";
const BYPASS_QUERY = "preview";

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1) Studio Basic Auth — prima di tutto, anche durante coming soon
  //    (l'admin deve poter editare i contenuti pre-lancio).
  if (pathname.startsWith(STUDIO_PATH)) {
    return studioBasicAuth(req);
  }

  // 2) Coming Soon Gate — attivo solo se env esplicita "true".
  const comingSoonActive = process.env.COMING_SOON_MODE === "true";
  if (!comingSoonActive) {
    return NextResponse.next();
  }

  // 2a) La pagina coming-soon stessa deve essere raggiungibile (e' il
  //     target del rewrite, altrimenti loop).
  if (pathname === COMING_SOON_PATH) {
    return NextResponse.next();
  }

  // 2b) Bypass via query: ?preview=<KEY>. Setta cookie + redirect a
  //     URL pulita (senza la query). Cosi' i link condivisi restano
  //     puliti e la key non finisce nei referer logs.
  const bypassKey = process.env.COMING_SOON_BYPASS_KEY;
  const providedKey = searchParams.get(BYPASS_QUERY);
  if (providedKey && bypassKey && providedKey === bypassKey) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete(BYPASS_QUERY);
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(BYPASS_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 14, // 14 giorni
      path: "/",
    });
    return res;
  }

  // 2c) Bypass via cookie gia' settato.
  if (req.cookies.get(BYPASS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  // 2d) Default: rewrite trasparente a /coming-soon. L'URL nella barra
  //     resta quello digitato dall'utente (utile per "intanto inizia a
  //     condividere il link finale", senza svelare il contenuto).
  const url = req.nextUrl.clone();
  url.pathname = COMING_SOON_PATH;
  // Preserviamo query/hash per analytics (utm_*, fbclid, ecc.).
  return NextResponse.rewrite(url);
}

function studioBasicAuth(req: NextRequest) {
  const expectedUser = process.env.STUDIO_AUTH_USER;
  const expectedPass = process.env.STUDIO_AUTH_PASS;

  // Se le env non sono configurate, non bloccare nulla (dev locale +
  // scenario "non ho ancora messo le credenziali Vercel").
  if (!expectedUser || !expectedPass) {
    return NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (header) {
    const [scheme, encoded] = header.split(" ");
    if (scheme === "Basic" && encoded) {
      // atob disponibile in edge runtime di Next 16.
      const decoded = atob(encoded);
      const sep = decoded.indexOf(":");
      const user = sep >= 0 ? decoded.slice(0, sep) : "";
      const pass = sep >= 0 ? decoded.slice(sep + 1) : "";
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Orbassano Calcio Studio", charset="UTF-8"',
    },
  });
}

export const config = {
  // Matcher allargato per gestire anche il Coming Soon Gate. Esclude:
  // - /api/*           : webhook + form server (mai gateare)
  // - /_next/static    : asset Next gia' build-time
  // - /_next/image     : ottimizzazione immagini
  // - /favicon.ico
  // - /robots.txt      : gestito separatamente da src/app/robots.ts
  // - /sitemap.xml     : gestito separatamente da src/app/sitemap.ts
  // - /opengraph-image / /twitter-image : OG dinamiche Next
  // - file con estensione (.png, .css, .js, .woff2, .mp4, ...)
  //
  // Quando COMING_SOON_MODE e' off, il proxy esce comunque subito
  // (early return); il path /studio/* mantiene il basic auth.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|opengraph-image|twitter-image|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
