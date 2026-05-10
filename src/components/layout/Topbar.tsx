"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";
import { MainSponsorTile } from "@/components/sponsors/MainSponsorTile";
import type { MainSponsor } from "@/sanity/fetchers";

/**
 * Topbar superiore in modalita' "hero" (sticky, solo lg+).
 *
 * Sotto lg (<1024px) la topbar desktop e' nascosta del tutto: il
 * tablet eredita il pattern mobile (MobileTopbar + MobileSponsorStrip).
 * Gating netto:
 *  - 0-1023:  MobileTopbar + MobileSponsorStrip
 *  - 1024+:   Topbar (hero) shrinka da h-[90px] a h-16 con scroll
 *             0..80px, loghi main sponsor da 72px a 32px, tile da
 *             196 a 168 px. Background gia' opaco (bg-surface-0)
 *             senza fade trasparenza per evitare il "vuoto scuro"
 *             durante il primo scroll.
 *
 * Mostrata quando l'utente e' in cima alla pagina (hero visibile).
 * Quando si scrolla oltre, ClientShell la nasconde via opacity e
 * mostra TopbarScrolled al suo posto.
 *
 * Bordi orizzontali (left-[88px], right-[80px]) per non sovrapporsi
 * alle sidebar verticali, che sono visibili in modalita' hero.
 */
const FALLBACK_MAIN_SPONSORS = [
  { name: "Studio Cambareri" },
  { name: "Reale Mutua" },
  { name: "Ocert" },
];

const SHRINK_END_PX = 80;

const HERO_HEADER_H = 90;
const SCROLLED_HEADER_H = 64;
const HERO_UL_H = 78;
const SCROLLED_UL_H = 48;
const HERO_TILE_W = 196;
const SCROLLED_TILE_W = 168;
const HERO_LOGO_MAX_H = 72;
const SCROLLED_LOGO_MAX_H = 32;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Hook minimale: ritorna un float 0..1 che cresce linearmente con
 * window.scrollY nei primi SHRINK_END_PX, poi resta a 1. requestAnimation
 * Frame per evitare layout thrashing su scroll fast.
 */
function useScrollShrink(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const y = Math.max(0, Math.min(SHRINK_END_PX, window.scrollY));
      setProgress(y / SHRINK_END_PX);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return progress;
}

export function Topbar({
  sponsors,
  onSearchClick,
}: {
  sponsors: MainSponsor[];
  onSearchClick: () => void;
}) {
  const usingFallback = sponsors.length === 0;
  const p = useScrollShrink();

  const headerH = lerp(HERO_HEADER_H, SCROLLED_HEADER_H, p);
  const ulH = lerp(HERO_UL_H, SCROLLED_UL_H, p);
  const tileW = lerp(HERO_TILE_W, SCROLLED_TILE_W, p);
  const logoMaxH = lerp(HERO_LOGO_MAX_H, SCROLLED_LOGO_MAX_H, p);

  return (
    <header
      className={cn(
        "border-border/50 bg-surface-0 fixed top-0 hidden border-b lg:left-[88px] lg:right-[80px] lg:flex",
      )}
      style={{
        zIndex: Z.topbar,
        height: `${headerH}px`,
      }}
      role="banner"
      aria-label="Barra superiore con sponsor principali"
    >
      <div className="flex w-full items-center justify-end gap-4 px-4">
        {usingFallback ? (
          <ul
            className="border-border/60 bg-surface-1/60 divide-border/60 flex items-center divide-x overflow-hidden rounded-md border"
            style={{ height: `${ulH}px` }}
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
            style={{ height: `${ulH}px` }}
          >
            {sponsors.map((s) => (
              <MainSponsorTile
                key={s._id}
                sponsor={s}
                width={tileW}
                logoMaxHeight={logoMaxH}
              />
            ))}
          </ul>
        )}

        <div aria-hidden className="bg-border h-5 w-px" />

        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Cerca nel sito"
          className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Search size={18} />
        </button>
      </div>
    </header>
  );
}
