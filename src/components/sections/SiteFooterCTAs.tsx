"use client";

import { usePathname } from "next/navigation";

/**
 * Gate client per le CTA "sopra il footer" (NewsletterCTA +
 * SearchPromptCTA). Riceve i 2 CTA gia' pre-renderizzati server-side
 * dal layout e li nasconde su rotte dove sarebbero ridondanti o
 * intrusive:
 *  - `/squadre/<slug>` (pagina rosa juventus-style: si presenta da
 *    sola, senza distrazioni in fondo)
 *  - `/ricerca` (la pagina ha gia' una barra ricerca propria in alto,
 *    una seconda in fondo sarebbe duplicata e confusa)
 */
export function SiteFooterCTAs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTeamRoster = /^\/squadre\/[^/]+$/.test(pathname);
  const isSearchPage = pathname === "/ricerca";
  if (isTeamRoster || isSearchPage) return null;
  return <>{children}</>;
}
