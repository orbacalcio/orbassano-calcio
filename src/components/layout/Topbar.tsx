"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Z } from "@/lib/z-indexes";
import { useHomeLogoClick } from "@/lib/use-home-logo-click";
import { MainSponsorTile } from "@/components/sponsors/MainSponsorTile";
import type { MainSponsor } from "@/sanity/fetchers";
import { sidebarMainItems } from "./SidebarLeft.items";

/**
 * Topbar unica (pattern juventus.com): una sola barra che cambia
 * "forma" tra HERO e SCROLLED, invece di due barre separate con
 * crossfade.
 *
 * Ruoli:
 *  - HERO (heroVisible=true): la barra e' contenuta tra le sidebar
 *    verticali (lg:left-[88px] lg:right-[80px]). Mostra solo i tile
 *    main sponsor a destra (196×78, logo +20% vs marquee).
 *  - SCROLLED (heroVisible=false): la barra si allarga full-width
 *    (left=0 right=0). Hamburger + nav inline + logo centrale a
 *    sinistra; sponsor compatti a destra (168×48). Le sidebar
 *    verticali svaniscono in parallelo (gestito in ClientShell).
 *
 * La transizione e' un'unica animazione coerente (450ms,
 * cubic-bezier(0.4,0,0.2,1)): bordi sx/dx, opacity dei contenuti
 * scrolled-only e dimensioni dei tile sponsor animano insieme. Niente
 * compositing alpha tra DOM differenti — tutto vive dentro la stessa
 * barra che si trasforma.
 *
 * Mobile (<lg): la topbar e' nascosta del tutto. Pattern mobile
 * (MobileTopbar + MobileSponsorStrip) resta invariato.
 */
const FALLBACK_MAIN_SPONSORS = [
  { name: "Studio Cambareri" },
  { name: "Reale Mutua" },
  { name: "Ocert" },
];

const HERO_LEFT = 88;
const HERO_RIGHT = 80;
const SCROLLED_LEFT = 0;
const SCROLLED_RIGHT = 0;

const HERO_TILE_W = 196;
const HERO_TILE_H = 78;
const HERO_LOGO_MAX_H = 72;
const SCROLLED_TILE_W = 168;
const SCROLLED_TILE_H = 48;
const SCROLLED_LOGO_MAX_H = 32;

const TRANSITION_MS = 450;
const TRANSITION_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export function Topbar({
  sponsors,
  heroVisible,
  onMenuClick,
  onSearchClick,
}: {
  sponsors: MainSponsor[];
  heroVisible: boolean;
  onMenuClick: () => void;
  onSearchClick: () => void;
}) {
  const reduced = useReducedMotion();
  const usingFallback = sponsors.length === 0;
  const navItems = sidebarMainItems.filter((i) => !i.isLogoItem);
  const onLogoClick = useHomeLogoClick();

  const transition = reduced
    ? { duration: 0 }
    : {
        duration: TRANSITION_MS / 1000,
        ease: [0.4, 0, 0.2, 1] as const,
      };

  // Stile passato ai tile/loghi sponsor per animare width/height via
  // CSS transition (motion.div solo sui contenuti scrolled-only).
  const tileTransitionStyle = reduced
    ? undefined
    : {
        transition: `width ${TRANSITION_MS}ms ${TRANSITION_EASE}, height ${TRANSITION_MS}ms ${TRANSITION_EASE}, max-height ${TRANSITION_MS}ms ${TRANSITION_EASE}`,
      };

  const tileWidth = heroVisible ? HERO_TILE_W : SCROLLED_TILE_W;
  const tileHeight = heroVisible ? HERO_TILE_H : SCROLLED_TILE_H;
  const logoMaxH = heroVisible ? HERO_LOGO_MAX_H : SCROLLED_LOGO_MAX_H;

  return (
    <motion.header
      className="bg-surface-0 border-border/50 fixed top-0 hidden h-[90px] items-center border-b lg:flex"
      style={{ zIndex: Z.topbar }}
      initial={false}
      animate={{
        left: heroVisible ? HERO_LEFT : SCROLLED_LEFT,
        right: heroVisible ? HERO_RIGHT : SCROLLED_RIGHT,
      }}
      transition={transition}
      role="banner"
      aria-label="Barra di navigazione"
    >
      {/* Sx scrolled-only: hamburger + nav inline. Visibile in
          SCROLLED, fade-out in HERO. pointerEvents segue l'opacity
          per non rendere cliccabile cio' che e' invisibile. */}
      <motion.div
        className="absolute left-0 flex h-full items-center gap-7 pl-8"
        initial={false}
        animate={{
          opacity: heroVisible ? 0 : 1,
          pointerEvents: heroVisible ? "none" : "auto",
        }}
        transition={transition}
      >
        <button
          type="button"
          aria-label="Apri menu completo"
          aria-controls="navigation-drawer"
          onClick={onMenuClick}
          className="text-ink-hi hover:text-brand-gold focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-2"
        >
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.25}
            strokeLinecap="round"
            aria-hidden
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" className="stroke-brand-gold" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <ul className="flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-display text-ink-hi hover:text-brand-gold text-sm font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Centro scrolled-only: logo Orbassano. Visibile in SCROLLED. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        initial={false}
        animate={{
          opacity: heroVisible ? 0 : 1,
          pointerEvents: heroVisible ? "none" : "auto",
        }}
        transition={transition}
      >
        <Link
          href="/"
          onClick={onLogoClick}
          aria-label="ASD Orbassano Calcio - Home"
          className="pointer-events-auto"
        >
          <Image
            src="/Logo_Orbassano_2K.png"
            alt=""
            width={56}
            height={79}
            priority
          />
        </Link>
      </motion.div>

      {/* Dx: tile sponsor + divider + search. Sempre visibili.
          Le dimensioni dei tile e l'altezza dell'ul animano via CSS
          transition (gestita da tileTransitionStyle). */}
      <div className="ml-auto flex items-center gap-4 pr-4">
        {usingFallback ? (
          <ul
            className="border-border/60 bg-surface-1/60 divide-border/60 flex items-center divide-x overflow-hidden rounded-md border"
            style={{
              height: `${tileHeight}px`,
              ...tileTransitionStyle,
            }}
          >
            {FALLBACK_MAIN_SPONSORS.map((s) => (
              <li
                key={s.name}
                className="font-display text-ink-mid flex h-full items-center px-5 text-[12px] font-semibold tracking-[0.15em] uppercase"
              >
                {s.name}
              </li>
            ))}
          </ul>
        ) : (
          <ul
            className="border-border/60 divide-border/60 flex items-center divide-x overflow-hidden rounded-md border"
            style={{
              height: `${tileHeight}px`,
              ...tileTransitionStyle,
            }}
          >
            {sponsors.map((s) => (
              <MainSponsorTile
                key={s._id}
                sponsor={s}
                width={tileWidth}
                logoMaxHeight={logoMaxH}
                transitionStyle={tileTransitionStyle}
              />
            ))}
          </ul>
        )}

        <div aria-hidden className="bg-border h-5 w-px" />

        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Cerca nel sito"
          className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Search size={20} />
        </button>
      </div>
    </motion.header>
  );
}
