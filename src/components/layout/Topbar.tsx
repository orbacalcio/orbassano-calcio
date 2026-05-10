"use client";

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
 *  - 1024+:   Topbar (hero) h-[90px] statica con bg opaco e tile
 *             main sponsor 196×78 (logo +20% vs marquee in basso).
 *
 * Mostrata quando l'utente e' in cima alla pagina (hero visibile).
 * Quando si scrolla oltre, ClientShell la nasconde via opacity e
 * mostra TopbarScrolled al suo posto. La TopbarScrolled e' alla
 * stessa altezza (h-[90px]): il crossfade e' solo opacity tra
 * elementi geometricamente identici, niente salto visivo (lesson
 * learned dallo shrink animato precedente che faceva uno scatto
 * sgradevole tra HERO e SCROLLED).
 *
 * Bordi orizzontali (left-[88px], right-[80px]) per non sovrapporsi
 * alle sidebar verticali, che sono visibili in modalita' hero.
 */
const FALLBACK_MAIN_SPONSORS = [
  { name: "Studio Cambareri" },
  { name: "Reale Mutua" },
  { name: "Ocert" },
];

export function Topbar({
  sponsors,
  onSearchClick,
}: {
  sponsors: MainSponsor[];
  onSearchClick: () => void;
}) {
  const usingFallback = sponsors.length === 0;

  return (
    <header
      className={cn(
        "border-border/50 bg-surface-0 fixed top-0 hidden h-[90px] border-b lg:left-[88px] lg:right-[80px] lg:flex",
      )}
      style={{ zIndex: Z.topbar }}
      role="banner"
      aria-label="Barra superiore con sponsor principali"
    >
      <div className="flex w-full items-center justify-end gap-4 px-4">
        {usingFallback ? (
          <ul className="border-border/60 bg-surface-1/60 divide-border/60 flex h-[78px] items-center divide-x overflow-hidden rounded-md border">
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
          <ul className="border-border/60 divide-border/60 flex h-[78px] items-center divide-x overflow-hidden rounded-md border">
            {sponsors.map((s) => (
              <MainSponsorTile key={s._id} sponsor={s} />
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
