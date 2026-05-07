import Image from "next/image";
import { Search } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { mainSponsorsQuery } from "@/sanity/queries";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";

/**
 * Topbar superiore (44px, sticky, sempre visibile su md+).
 *
 * Contenuto a destra (replica struttura juventus.com/it):
 * - Box "main sponsor": riquadro orizzontale con i loghi/nomi degli
 *   sponsor principali, separati da divisori verticali sottili
 * - Divisore verticale 1px
 * - Icona ricerca
 * - Margine destro pr-[88px] (16px buffer dopo i 72px della sidebar dx)
 *
 * Comportamento sponsor:
 * - Sanity popolato: legge i logoMonochrome, li mostra come <Image>
 *   con opacita' 70% default, hover 100%
 * - Sanity vuoto (caso attuale in dev): fallback testuale con i 3
 *   nomi placeholder dei main sponsor della stagione corrente in font-display 600
 *   uppercase, in modo che la topbar non sia mai vuota
 *
 * Tablet md..lg: max 3 sponsor visibili (gli altri hidden lg:flex).
 * Mobile <md: la topbar non viene mostrata, i main sponsor vivono in
 * MobileSponsorStrip.
 */
type Sponsor = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  logoMonochrome: string | null;
};

const FALLBACK_MAIN_SPONSORS: Array<{ name: string; placeholder: true }> = [
  { name: "Studio Cambareri", placeholder: true },
  { name: "Reale Mutua", placeholder: true },
  { name: "Ocert", placeholder: true },
];

async function fetchMainSponsors(): Promise<Sponsor[]> {
  try {
    const data = await sanityClient.fetch(
      mainSponsorsQuery,
      {},
      { next: { tags: ["sponsor"] } },
    );
    return (data ?? []) as Sponsor[];
  } catch {
    return [];
  }
}

export async function Topbar() {
  const sponsors = await fetchMainSponsors();
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
        {/* Box main sponsor (riquadro con divisori verticali tra loghi) */}
        {usingFallback ? (
          <ul className="border-border/60 bg-surface-1/60 flex h-7 items-center divide-x divide-border/60 overflow-hidden rounded-md border">
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
          <ul className="border-border/60 bg-surface-1/60 flex h-7 items-center divide-x divide-border/60 overflow-hidden rounded-md border">
            {sponsors.map((s, i) => {
              const src = s.logoMonochrome ?? s.logo;
              const tabletHide = i >= 3 ? "hidden lg:flex" : "flex";
              if (!s.website) return null;
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
                    {src ? (
                      <Image
                        src={src}
                        alt={s.name}
                        width={100}
                        height={20}
                        className="h-5 w-auto object-contain"
                        style={
                          s.logoMonochrome
                            ? undefined
                            : { filter: "brightness(0) invert(1)" }
                        }
                      />
                    ) : (
                      <span className="font-display text-ink-mid text-[11px] font-semibold tracking-[0.15em] uppercase">
                        {s.name}
                      </span>
                    )}
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
