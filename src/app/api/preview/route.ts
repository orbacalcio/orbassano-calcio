import { NextResponse } from "next/server";

/**
 * Bypass per la modalita' Coming Soon (vedi next.config.mjs rewrites
 * + src/app/coming-soon/page.tsx).
 *
 * Uso:
 *  - GET /api/preview?key=<COMING_SOON_BYPASS_KEY>
 *      Setta un cookie httpOnly `cs-bypass=1` per 14 giorni e
 *      redirect a "/". Da quel momento il browser vede il sito reale
 *      (le rewrites coming-soon hanno `missing: cookie cs-bypass=1`).
 *  - GET /api/preview?reset=1
 *      Cancella il cookie e redirect a "/". Torna a vedere la coming
 *      soon (utile per testare).
 *  - GET /api/preview (senza parametri o con key errata)
 *      → 401, niente cookie settato.
 *
 * Forzato dynamic perche' deve sempre runtime-execute (legge query e
 * setta cookie). Non vogliamo che venga prerenderato al build.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reset = url.searchParams.get("reset");

  if (reset === "1") {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("cs-bypass", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    return res;
  }

  const key = url.searchParams.get("key");
  const expected = process.env.COMING_SOON_BYPASS_KEY;
  if (!key || !expected || key !== expected) {
    return new NextResponse("Invalid or missing key", { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("cs-bypass", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14, // 14 giorni
    path: "/",
  });
  return res;
}
