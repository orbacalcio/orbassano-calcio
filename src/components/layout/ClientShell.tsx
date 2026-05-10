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
import { TopbarScrolled } from "./TopbarScrolled";

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
 *    hamburger TopbarScrolled).
 * 3. Switch animato sidebar verticali (heroVisible) <-> TopbarScrolled
 *    (!heroVisible) via Framer Motion, 450ms con curva cubic-bezier
 *    "standard" Material (0.4, 0, 0.2, 1). Crossfade SOLO opacity:
 *    Topbar HERO e TopbarScrolled hanno geometria identica (h-[90px]
 *    + lg:left-[88px] lg:right-[80px]), quindi il fade tra le due
 *    barre e' percettivamente perfetto, niente translate o
 *    "saltino" laterale. Le sidebar verticali svaniscono insieme
 *    alla Topbar HERO; i loro 88+80px laterali vuoti restano
 *    coperti dal bg-surface-0 navy continuo del body. Le due barre
 *    restano SEMPRE montate per evitare flash al cambio.
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
  // a `/`, lasciando heroVisible=false e quindi mostrando TopbarScrolled
  // invece di Topbar+SidebarLeft. Re-runnando l'effect ad ogni route
  // change risolviamo: cleanup vecchio observer, nuovo lookup nel DOM
  // appena renderizzato.
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
  // Curva Material "standard" (0.4, 0, 0.2, 1): partenza decisa,
  // arrivo morbido. 450ms e' il sweet spot per un crossfade UI che
  // si percepisce intenzionale ma non lento.
  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <>
      {/* Mobile topbar (sempre visibile <lg, niente switch su mobile) */}
      <MobileTopbar onMenuClick={openDrawer} />

      {/* Hero state (in cima): topbar minimale + sidebar verticali */}
      <motion.div
        initial={false}
        animate={{
          opacity: heroVisible ? 1 : 0,
          pointerEvents: heroVisible ? "auto" : "none",
        }}
        transition={transition}
      >
        <Topbar sponsors={sponsors} onSearchClick={openSearch} />
        <SidebarLeft />
        <SidebarRight />
      </motion.div>

      {/* Scrolled state (oltre hero): topbar orizzontale.
          Stessa geometria della HERO (h-[90px] + lg:left-[88px]
          lg:right-[80px]), quindi il crossfade e' solo opacity —
          niente translate, niente "saltino" durante il fade. */}
      <motion.div
        initial={false}
        animate={{
          opacity: heroVisible ? 0 : 1,
          pointerEvents: heroVisible ? "none" : "auto",
        }}
        transition={transition}
      >
        <TopbarScrolled
          sponsors={sponsors}
          onMenuClick={openDrawer}
          onSearchClick={openSearch}
        />
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
