import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 "proxy" (ex-middleware) — due responsabilita':
 *
 * 1) **Studio Basic Auth** davanti a `/studio/*` per evitare che
 *    chiunque su Internet possa raggiungere l'interfaccia di Sanity
 *    Studio anche solo per vedere il modulo di login (information
 *    disclosure / phishing surface — vedi AUDIT.md sezione 5.6).
 *
 *      Credenziali via env: STUDIO_AUTH_USER + STUDIO_AUTH_PASS.
 *      Se non settate, lo Studio resta accessibile (no regression
 *      in sviluppo locale).
 *
 * 2) **Coming Soon Gate** (modalita' pre-lancio): quando l'env
 *    `COMING_SOON_MODE=true`, TUTTE le rotte pubbliche vengono
 *    riscritte verso `/coming-soon` (rewrite trasparente, URL nella
 *    barra resta quello digitato).
 *
 *    Eccezioni che PASSANO sempre:
 *      - `/studio*`      → CMS sempre raggiungibile (con basic auth)
 *      - `/api/*`        → webhook revalidate Sanity + Resend forms
 *                          (esclusi dal matcher)
 *      - `/coming-soon`  → target del rewrite (ovvio)
 *      - asset statici   → file con estensione + _next (esclusi dal matcher)
 *      - bypass cookie   → impostato via `?preview=<KEY>`
 *
 *    Bypass per anteprima admin:
 *      Visita `https://<dominio>/?preview=<COMING_SOON_BYPASS_KEY>`.
 *      Il proxy verifica la key, setta un cookie httpOnly che dura
 *      14 giorni e fa redirect alla stessa URL senza la query.
 *
 *    Disattivazione:
 *      Cambia `COMING_SOON_MODE=false` (o cancella la variabile) su
 *      Vercel e fai redeploy.
 *
 *    Debug:
 *      Ogni risposta uscita dal proxy ha l'header `x-cs-proxy` con
 *      uno dei valori: `studio-pass | studio-auth | off | passthrough |
 *      bypass-cookie | bypass-grant | rewrite`. Si controlla con:
 *      `curl -I https://<dominio>/` → cerca x-cs-proxy:
 */

const STUDIO_PATH = "/studio";
const COMING_SOON_PATH = "/coming-soon";
const BYPASS_COOKIE = "cs-bypass";
const BYPASS_QUERY = "preview";

function tagged(res: NextResponse, tag: string): NextResponse {
  res.headers.set("x-cs-proxy", tag);
  return res;
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1) Studio Basic Auth — prima di tutto, anche durante coming soon.
  if (pathname.startsWith(STUDIO_PATH)) {
    return studioBasicAuth(req);
  }

  // 2) Coming Soon Gate — attivo solo se env esplicita "true".
  const comingSoonActive = process.env.COMING_SOON_MODE === "true";
  if (!comingSoonActive) {
    return tagged(NextResponse.next(), "off");
  }

  // 2a) La pagina coming-soon stessa deve passare (target del rewrite).
  if (pathname === COMING_SOON_PATH) {
    return tagged(NextResponse.next(), "passthrough");
  }

  // 2b) Bypass via query: ?preview=<KEY>. Setta cookie + redirect a
  //     URL pulita (senza la query).
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
    return tagged(res, "bypass-grant");
  }

  // 2c) Bypass via cookie gia' settato.
  if (req.cookies.get(BYPASS_COOKIE)?.value === "1") {
    return tagged(NextResponse.next(), "bypass-cookie");
  }

  // 2d) Default: rewrite trasparente a /coming-soon. L'URL nella barra
  //     resta quello digitato dall'utente.
  return tagged(
    NextResponse.rewrite(new URL(COMING_SOON_PATH, req.url)),
    "rewrite",
  );
}

function studioBasicAuth(req: NextRequest) {
  const expectedUser = process.env.STUDIO_AUTH_USER;
  const expectedPass = process.env.STUDIO_AUTH_PASS;

  // Se le env non sono configurate, non bloccare nulla.
  if (!expectedUser || !expectedPass) {
    return tagged(NextResponse.next(), "studio-pass");
  }

  const header = req.headers.get("authorization");
  if (header) {
    const [scheme, encoded] = header.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const sep = decoded.indexOf(":");
      const user = sep >= 0 ? decoded.slice(0, sep) : "";
      const pass = sep >= 0 ? decoded.slice(sep + 1) : "";
      if (user === expectedUser && pass === expectedPass) {
        return tagged(NextResponse.next(), "studio-pass");
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Orbassano Calcio Studio", charset="UTF-8"',
      "x-cs-proxy": "studio-auth",
    },
  });
}

export const config = {
  // Matcher canonico Next 16 (vedi docs/01-app/03-api-reference/
  // 03-file-conventions/proxy.md sezione "Negative matching").
  // Esclusioni:
  //  - api          : tutte le route API
  //  - _next/static : asset Next build-time
  //  - _next/image  : ottimizzazione immagini
  //  - favicon/sitemap/robots : file metadata speciali
  //  - opengraph/twitter image : OG dinamiche Next
  //  - .*\\..*      : qualsiasi path con un punto (asset statici tipo
  //                    Logo.png, file.css, font.woff2). path-to-regexp
  //                    interpreta come "ha almeno un punto".
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
