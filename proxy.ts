import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 "proxy" (ex-middleware): aggiunge un layer di Basic Auth
 * davanti alle rotte /studio/* per evitare che chiunque su Internet
 * possa raggiungere l'interfaccia di Sanity Studio anche solo per
 * vedere il modulo di login (information disclosure / phishing
 * surface — vedi AUDIT.md sezione 5.6).
 *
 * Sanity ha gia' la propria auth (richiede login Google/SSO con un
 * account membro del project), ma esporre l'URL `/studio` pubblico
 * permette a crawler/bot di profilare lo stack e tentare credential
 * stuffing. Il basic auth a livello edge nasconde completamente lo
 * Studio finche' l'admin non si autentica.
 *
 * Credenziali via env:
 *   STUDIO_AUTH_USER=<username scelta dal club>
 *   STUDIO_AUTH_PASS=<password lunga e robusta>
 *
 * Se le env non sono settate, lo Studio resta accessibile (no
 * regression in sviluppo locale). In produzione Vercel le env vanno
 * configurate prima del DNS cutover.
 */

const STUDIO_PATH = "/studio";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith(STUDIO_PATH)) {
    return NextResponse.next();
  }

  const expectedUser = process.env.STUDIO_AUTH_USER;
  const expectedPass = process.env.STUDIO_AUTH_PASS;

  // Se le env non sono configurate, non bloccare nulla (sviluppo
  // locale + scenario "non ho ancora messo le credenziali Vercel").
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
      "WWW-Authenticate": 'Basic realm="Orbassano Calcio Studio", charset="UTF-8"',
    },
  });
}

export const config = {
  // Matcher Next 16: applica il proxy SOLO sotto /studio. Il sito
  // pubblico (/news, /squadre, etc.) non viene toccato — zero overhead
  // su ogni richiesta.
  matcher: ["/studio/:path*", "/studio"],
};
