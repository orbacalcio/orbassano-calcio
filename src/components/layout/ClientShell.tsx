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
 * 3. Switch sidebar verticali (heroVisible) <-> TopbarScrolled
 *    (!heroVisible) via pattern UNCOVER (non crossfade simultaneo).
 *
 *    Crossfade simultaneo soffriva di compositing alpha: per un
 *    momento entrambe le barre erano semi-trasparenti, i loro
 *    contenuti diversi (sponsor grandi HERO vs hamburger+nav+sponsor
 *    compatti SCROLLED) si vedevano sovrapposti, percepito come
 *    "saltino" anche con geometria identica.
 *
 *    Pattern uncover: TopbarScrolled e' montata SOTTO la Topbar HERO
 *    (z-stack via DOM order: SCROLLED prima, HERO dopo). Quando
 *    heroVisible passa a false, la SCROLLED appare istantaneamente
 *    sotto la HERO che ancora la copre; poi la HERO sfuma in 450ms
 *    rivelando la SCROLLED gia' pronta. Quando heroVisible torna
 *    true, la HERO ricompare in fade in davanti alla SCROLLED, e
 *    la SCROLLED scompare con delay 450ms (cioe' DOPO che la HERO
 *    l'ha completamente coperta). Niente compositing alpha visibile.
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
  // Curva Material "standard" (0.4, 0, 0.2, 1) per il fade della
  // HERO. 450ms e' il sweet spot percettivo.
  const heroFade = reduced
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const };

  // SCROLLED: appare/scompare istantaneamente.
  // - Quando entriamo in scrolled (heroVisible false): nessun delay,
  //   la barra c'e' subito sotto la HERO che sta ancora svanendo.
  // - Quando torniamo in hero (heroVisible true): delay 450ms, cosi'
  //   la SCROLLED scompare DOPO che la HERO l'ha gia' coperta in
  //   fade-in. Niente vuoto visibile in nessuna delle due direzioni.
  const scrolledSwap = reduced
    ? { duration: 0 }
    : { duration: 0, delay: heroVisible ? 0.45 : 0 };

  return (
    <>
      {/* Mobile topbar (sempre visibile <lg, niente switch su mobile) */}
      <MobileTopbar onMenuClick={openDrawer} />

      {/* SCROLLED layer — DIETRO la HERO (DOM order: prima qui, poi
          HERO dopo). Appare/scompare istantaneamente; il fade della
          HERO sopra fa il lavoro percettivo della transizione. */}
      <motion.div
        initial={false}
        animate={{
          opacity: heroVisible ? 0 : 1,
          pointerEvents: heroVisible ? "none" : "auto",
        }}
        transition={scrolledSwap}
      >
        <TopbarScrolled
          sponsors={sponsors}
          onMenuClick={openDrawer}
          onSearchClick={openSearch}
        />
      </motion.div>

      {/* HERO layer — DAVANTI alla SCROLLED. Fade lento 450ms quando
          heroVisible cambia: nello scroll-out svanisce e rivela la
          SCROLLED gia' montata; nello scroll-in riappare coprendo
          la SCROLLED. Le sidebar verticali fadeno con la HERO. */}
      <motion.div
        initial={false}
        animate={{
          opacity: heroVisible ? 1 : 0,
          pointerEvents: heroVisible ? "auto" : "none",
        }}
        transition={heroFade}
      >
        <Topbar sponsors={sponsors} onSearchClick={openSearch} />
        <SidebarLeft />
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
