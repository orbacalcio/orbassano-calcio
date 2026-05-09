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
 * Questa scelta evita la collisione che esisteva tra Topbar md:flex e
 * MobileTopbar lg:hidden nel range 768-1023, dove entrambe finivano
 * fissate a top-0 sovrapposte. Ora il gating e' netto:
 *  - 0-1023:  MobileTopbar + MobileSponsorStrip
 *  - 1024+:   Topbar (h-16, tile main sponsor 120×48 su bianco)
 *
 * Mostrata quando l'utente e' in cima alla pagina (hero visibile).
 * Quando si scrolla oltre, ClientShell la nasconde via opacity e
 * mostra TopbarScrolled al suo posto.
 *
 * Pattern: trasparente con backdrop-blur + tile main sponsor + divider
 * + icona search che apre la SearchDialog full-screen (gestita da
 * ClientShell via onSearchClick prop).
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
        "border-border/50 bg-surface-0/70 fixed inset-x-0 top-0 hidden h-16 border-b backdrop-blur-md lg:flex",
      )}
      style={{ zIndex: Z.topbar }}
      role="banner"
      aria-label="Barra superiore con sponsor principali"
    >
      <div className="flex w-full items-center justify-end gap-4 pr-[88px] pl-[calc(88px+1rem)]">
        {usingFallback ? (
          <ul className="border-border/60 bg-surface-1/60 divide-border/60 flex h-12 items-center divide-x overflow-hidden rounded-md border">
            {FALLBACK_MAIN_SPONSORS.map((s) => (
              <li
                key={s.name}
                className="font-display text-ink-mid flex h-full items-center px-3 text-[11px] font-semibold tracking-[0.15em] uppercase"
              >
                {s.name}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="border-border/60 divide-border/60 flex h-12 items-center divide-x overflow-hidden rounded-md border">
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
