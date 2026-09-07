"use client";

import { usePathname } from "next/navigation";

/**
 * Gate client per il marquee sponsor "sopra il footer" (richiesta
 * utente 2026-09-07). Stesso pattern di SiteFooterCTAs: il marquee
 * arriva gia' renderizzato server-side come children, qui si decide
 * solo se mostrarlo in base alla rotta.
 *
 * Nascosto su:
 *  - `/` — in homepage il marquee sta gia' a meta' pagina, tra
 *    "Storia in numeri" e "Vivi l'Orba"; qui sarebbe un doppione.
 *  - `/sponsor/*` — la sezione sponsor mostra gia' tutti i loghi in
 *    griglia e la CTA "Diventa sponsor" linkerebbe se stessa.
 *  - `/legal/*` — privacy, cookie, termini, accessibilita': pagine
 *    informative che devono restare sobrie, senza blocchi commerciali.
 *  - `/societa/segnalazioni` e `/societa/codice-etico` — governance e
 *    whistleblowing (D.Lgs. 24/2023): loghi in scorrimento e invito a
 *    sponsorizzare sotto un canale di segnalazione ne minerebbero la
 *    percezione di indipendenza.
 *
 * Ovunque altro (news, squadre, calendari, gallery, contatti, academy,
 * tornei, archivio, 5x1000...) il marquee compare prima delle CTA
 * newsletter/ricerca e del footer.
 */
const HIDDEN_PREFIXES = ["/sponsor", "/legal"];
const HIDDEN_EXACT = new Set([
  "/",
  "/societa/segnalazioni",
  "/societa/codice-etico",
]);

export function SponsorMarqueeGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (HIDDEN_EXACT.has(pathname)) return null;
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <>{children}</>;
}
