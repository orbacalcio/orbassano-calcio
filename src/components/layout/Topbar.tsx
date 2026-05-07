import Image from "next/image";
import { Search } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { mainSponsorsQuery } from "@/sanity/queries";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";

/**
 * Topbar superiore (44px, sticky, sempre visibile).
 *
 * Contenuto:
 * - Loghi Main Sponsor dinamici (1-5) letti da Sanity, monocromatici
 * - Divisore + icona ricerca
 *
 * Su tablet (md..lg) mostra max 3 main sponsor (gli altri hidden).
 * Su mobile (<md) la topbar mostra solo l'hamburger + logo: i main
 * sponsor vivono in MobileSponsorStrip sotto.
 */
type Sponsor = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  logoMonochrome: string | null;
};

async function fetchMainSponsors(): Promise<Sponsor[]> {
  try {
    const data = await sanityClient.fetch(
      mainSponsorsQuery,
      {},
      { next: { tags: ["sponsor"] } },
    );
    return (data ?? []) as Sponsor[];
  } catch {
    // In dev senza credenziali Sanity restituiamo array vuoto: la
    // topbar sara' priva di sponsor finche' .env.local non e' compilato.
    return [];
  }
}

export async function Topbar() {
  const sponsors = await fetchMainSponsors();

  return (
    <header
      className={cn(
        "border-border/50 bg-surface-0/70 fixed inset-x-0 top-0 hidden h-11 border-b backdrop-blur-md md:flex",
      )}
      style={{ zIndex: Z.topbar }}
      role="banner"
      aria-label="Barra superiore con sponsor principali"
    >
      <div className="flex w-full items-center justify-end gap-6 pr-4 pl-[calc(72px+1rem)]">
        {sponsors.length > 0 && (
          <ul className="flex items-center gap-6">
            {sponsors.map((s, i) => {
              const src = s.logoMonochrome ?? s.logo;
              const tabletHide = i >= 3 ? "hidden lg:flex" : "flex";
              if (!src || !s.website) return null;
              return (
                <li key={s._id} className={cn("h-6 items-center", tabletHide)}>
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.name} (sponsor principale)`}
                    className="opacity-70 transition-opacity hover:opacity-100"
                  >
                    <Image
                      src={src}
                      alt={s.name}
                      width={120}
                      height={24}
                      className="h-6 w-auto object-contain"
                      style={
                        s.logoMonochrome
                          ? undefined
                          : {
                              filter: "brightness(0) invert(1)",
                            }
                      }
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        <div aria-hidden className="bg-border/50 hidden h-6 w-px md:block" />
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
