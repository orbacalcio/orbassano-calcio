"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Click handler condiviso per i logo "torna alla home" (sidebar
 * desktop, topbar scrolled, topbar mobile).
 *
 * Comportamento:
 * - Se l'utente si trova su una pagina diversa da `/`: nessun
 *   override, il <Link> di Next esegue il route change normale (Next
 *   16 di default scrolla in cima al cambio rotta).
 * - Se l'utente e' GIA' su `/`: previene il navigate (Next non farebbe
 *   nulla comunque, ma e' esplicito) e scrolla smooth in cima alla
 *   pagina. ClientShell rileva l'hero di nuovo nel viewport e
 *   ripristina Topbar trasparente + SidebarLeft, ricreando lo stato
 *   "appena atterrato" senza un hard refresh.
 */
export function useHomeLogoClick() {
  const pathname = usePathname();
  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname],
  );
}
