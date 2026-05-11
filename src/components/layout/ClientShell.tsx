"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import type { MainSponsor } from "@/sanity/fetchers";
import { MobileTopbar } from "./MobileTopbar";
import { NavigationDrawer } from "./NavigationDrawer";
import { SidebarLeft } from "./SidebarLeft";
import { SidebarRight } from "./SidebarRight";
import { Topbar } from "./Topbar";

/**
 * Orchestratore client del shell del sito pubblico.
 *
 * Riceve solo dato serializzabile (sponsors prefetched dal padre server)
 * e importa i sotto-componenti direttamente. Le funzioni-prop tra
 * server e client component non sono permesse, quindi tutta la logica
 * di handler vive qui.
 *
 * Responsabilita':
 * 1. IntersectionObserver su [data-hero-sentinel] -> heroVisible.
 *    Sostituisce gli IO duplicati che vivevano in SidebarLeft/SidebarRight.
 * 2. Stato open/close del NavigationDrawer condiviso (hamburger mobile +
 *    hamburger Topbar scrolled).
 * 3. Switch sidebar verticali (heroVisible) <-> Topbar in modalita'
 *    scrolled (!heroVisible). Pattern juventus.com: la Topbar e' UNA
 *    sola e cambia "forma" (allargamento + contenuti scrolled-only).
 *    Le sidebar verticali svaniscono in fade in parallelo con la
 *    trasformazione della Topbar.
 */
export function ClientShell({
  sponsors,
  hasPartners,
  activeTeamSlugs,
}: {
  sponsors: MainSponsor[];
  hasPartners: boolean;
  activeTeamSlugs: string[];
}) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduced = useReducedMotion();
  const pathname = usePathname();

  // Re-osserva il sentinel hero ad ogni cambio rotta. ClientShell vive
  // nel SiteLayout quindi NON si rimonta tra pagine: senza `pathname`
  // nelle deps il primo IntersectionObserver creato (es. su /squadre,
  // dove il sentinel non esiste) restava attivo anche dopo navigazione
  // a `/`, lasciando heroVisible=false e quindi mostrando Topbar
  // scrolled invece di Topbar+SidebarLeft. Re-runnando l'effect ad
  // ogni route change risolviamo: cleanup vecchio observer, nuovo
  // lookup nel DOM appena renderizzato.
  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) {
      // Pagine senza hero (es. /squadre, /societa): mostra subito il
      // pattern scrolled. requestAnimationFrame evita il setState
      // sincrono dentro effect body (lint react-hooks/set-state-in-effect).
      const raf = requestAnimationFrame(() => setHeroVisible(false));
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "-44px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openSearch = useCallback(() => {
    setDrawerOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Curva Material "standard" (0.4, 0, 0.2, 1), 450ms. Stessa usata
  // dentro Topbar per allargamento/contenuti scrolled — sincronizzato.
  const sidebarFade = reduced
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <>
      {/* Mobile topbar (sempre visibile <lg, niente switch su mobile) */}
      <MobileTopbar onMenuClick={openDrawer} />

      {/* Topbar unica: cambia forma in base a heroVisible. Si allarga
          dai bordi sidebar (88+80) a full-width, e fade-in dei
          contenuti scrolled-only (hamburger, nav, logo centrale). */}
      <Topbar
        sponsors={sponsors}
        heroVisible={heroVisible}
        onMenuClick={openDrawer}
        onSearchClick={openSearch}
      />

      {/* Sidebar verticali: visibili in HERO, fadono in parallelo
          all'allargamento della Topbar (stessa curva, stessa durata).
          Il bottone "Altro" della SidebarLeft apre il NavigationDrawer
          (pattern juventus.com): pass-through del callback openDrawer. */}
      <motion.div
        initial={false}
        animate={{
          opacity: heroVisible ? 1 : 0,
          pointerEvents: heroVisible ? "auto" : "none",
        }}
        transition={sidebarFade}
      >
        <SidebarLeft onMoreClick={openDrawer} />
        <SidebarRight />
      </motion.div>

      {/* Drawer condiviso (mobile + desktop scrolled) */}
      <NavigationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSearchClick={openSearch}
        hasPartners={hasPartners}
        activeTeamSlugs={activeTeamSlugs}
      />

      {/* Dialog di ricerca site-wide */}
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
