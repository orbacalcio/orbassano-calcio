import { sanityClient } from "@/sanity/client";
import { mainSponsorsQuery } from "@/sanity/queries";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { Z } from "@/lib/z-indexes";

/**
 * Mobile (<lg): striscia sponsor sticky a 40px sotto la topbar mobile.
 * Layout flex con scroll orizzontale snap se i loghi non entrano.
 *
 * Loghi mono via <SponsorLogo variant="mono">: se logoMonochrome
 * manca compare il fallback testuale del nome sponsor — niente
 * filtro CSS automatico (vedi commit feat(sponsors): SponsorLogo
 * strict).
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
    return [];
  }
}

export async function MobileSponsorStrip() {
  const sponsors = await fetchMainSponsors();
  if (sponsors.length === 0) return null;
  return (
    <div
      className="border-border/50 bg-surface-1 fixed inset-x-0 top-11 flex h-10 items-center gap-4 overflow-x-auto border-b px-4 lg:hidden"
      style={{
        zIndex: Z.mobileSponsorStrip,
        scrollSnapType: "x mandatory",
        scrollbarWidth: "none",
        // Sfumatura sul bordo destro: segnala che la striscia scorre
        // in orizzontale (niente scrollbar visibile). La label "Main
        // Sponsor" a sinistra resta nitida.
        maskImage:
          "linear-gradient(to right, black calc(100% - 2rem), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, black calc(100% - 2rem), transparent)",
      }}
      role="region"
      aria-label="Sponsor principali"
    >
      <span className="text-ink-low font-display shrink-0 text-[9px] font-semibold tracking-[0.2em] uppercase">
        Main Sponsor
      </span>
      <ul className="flex shrink-0 items-center gap-5">
        {sponsors.map((s) => {
          if (!s.website) return null;
          return (
            <li
              key={s._id}
              className="shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <a
                href={s.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.name} (sponsor principale)`}
                className="opacity-80 hover:opacity-100"
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
    </div>
  );
}
