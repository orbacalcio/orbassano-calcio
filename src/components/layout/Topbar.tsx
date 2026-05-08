"use client";

import { Search } from "lucide-react";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import type { MainSponsor } from "@/sanity/fetchers";

/**
 * Topbar superiore in modalita' "hero" (44px, sticky, solo md+).
 *
 * Mostrata quando l'utente e' in cima alla pagina (hero visibile).
 * Quando si scrolla oltre, ClientShell la nasconde via opacity e
 * mostra TopbarScrolled al suo posto.
 *
 * Pattern: trasparente con backdrop-blur + box main sponsor a destra
 * + divisore + icona search. Loghi sponsor mono via <SponsorLogo
 * variant="mono"> — strict, niente filtro CSS: se logoMonochrome
 * manca compare il fallback testuale del nome sponsor.
 */
const FALLBACK_MAIN_SPONSORS = [
  { name: "Studio Cambareri" },
  { name: "Reale Mutua" },
  { name: "Ocert" },
];

export function Topbar({ sponsors }: { sponsors: MainSponsor[] }) {
  const usingFallback = sponsors.length === 0;

  return (
    <header
      className={cn(
        "border-border/50 bg-surface-0/70 fixed inset-x-0 top-0 hidden h-11 border-b backdrop-blur-md md:flex",
      )}
      style={{ zIndex: Z.topbar }}
      role="banner"
      aria-label="Barra superiore con sponsor principali"
    >
      <div className="flex w-full items-center justify-end gap-4 pr-[88px] pl-[calc(88px+1rem)]">
        {usingFallback ? (
          <ul className="border-border/60 bg-surface-1/60 divide-border/60 flex h-7 items-center divide-x overflow-hidden rounded-md border">
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
          <ul className="border-border/60 bg-surface-1/60 divide-border/60 flex h-7 items-center divide-x overflow-hidden rounded-md border">
            {sponsors.map((s, i) => {
              if (!s.website) return null;
              const tabletHide = i >= 3 ? "hidden lg:flex" : "flex";
              return (
                <li
                  key={s._id}
                  className={cn("h-full items-center px-3", tabletHide)}
                >
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.name} (sponsor principale)`}
                    className="opacity-70 transition-opacity hover:opacity-100"
                  >
                    <SponsorLogo
                      sponsor={s}
                      variant="mono"
                      width={100}
                      height={20}
                      className="h-5 w-auto"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        <div aria-hidden className="bg-border h-5 w-px" />

        <button
          type="button"
          aria-label="Cerca nel sito"
          className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Search size={18} />
        </button>
      </div>
    </header>
  );
}
