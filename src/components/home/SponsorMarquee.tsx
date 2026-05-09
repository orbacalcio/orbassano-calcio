import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { allActiveSponsorsQuery } from "@/sanity/queries";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { Container } from "@/components/ui/Container";

/**
 * Marquee sponsor: scorrimento infinito orizzontale dei loghi a
 * colori pieni su sfondo BIANCO. I loghi degli sponsor sono
 * progettati per stampe su materiale chiaro (maglia, banner stadio):
 * sfondo bianco massimizza la leggibilita' rispetto al navy del resto
 * della home, identico approccio dei tile in topbar.
 *
 * Mostra TUTTI gli sponsor attivi (Main + Official, NON Corporate
 * Partner che vivono nella loro pagina dedicata) per dare visibilita'
 * massima nel marquee homepage.
 */
type Sponsor = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  logoMonochrome?: string | null;
};

type SponsorGroups = {
  main: Sponsor[];
  official: Sponsor[];
  partners: Sponsor[];
};

async function fetchSponsors(): Promise<Sponsor[]> {
  try {
    const data = (await sanityClient.fetch(
      allActiveSponsorsQuery,
      {},
      { next: { tags: ["sponsor"] } },
    )) as SponsorGroups | null;
    if (!data) return [];
    return [...(data.main ?? []), ...(data.official ?? [])];
  } catch {
    return [];
  }
}

export async function SponsorMarquee() {
  const sponsors = await fetchSponsors();
  if (sponsors.length === 0) {
    return (
      <section
        aria-label="Sponsor del club"
        className="bg-white py-12"
      >
        <Container
          className="flex flex-col items-center gap-3 text-center"
          size="default"
        >
          <span className="text-brand-blue font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            Sponsor & Partner
          </span>
          <p className="text-surface-0/70 text-sm">
            La parete sponsor verrà popolata appena lo Studio Sanity sarà
            collegato e i loghi caricati.
          </p>
          <Link
            href="/sponsor/opportunita"
            className="text-brand-red hover:text-brand-blue inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            Diventa sponsor
            <ArrowUpRight size={14} />
          </Link>
        </Container>
      </section>
    );
  }

  // Duplico per scroll infinito
  const reel = [...sponsors, ...sponsors];

  return (
    <section
      aria-label="Sponsor del club"
      className="bg-white relative overflow-hidden py-16"
    >
      <Container
        className="flex flex-col items-center gap-3 text-center"
        size="default"
      >
        <span className="text-brand-red font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
          Sponsor & Partner 2026/27
        </span>
        <h2 className="font-display text-surface-0 max-w-2xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
          Insieme rendiamo possibile ogni partita
        </h2>
      </Container>

      <div className="relative mt-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white to-transparent"
        />
        <ul
          className="flex w-max items-center gap-16 motion-safe:animate-[marquee-sponsor_50s_linear_infinite]"
          aria-hidden="true"
        >
          {reel.map((s, i) => (
            <li
              key={`${s._id}-${i}`}
              className="flex h-20 shrink-0 items-center"
            >
              {s.website ? (
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="block"
                >
                  <SponsorLogo
                    sponsor={s}
                    variant="color"
                    width={300}
                    height={144}
                    className="font-display text-surface-0 h-[60px] w-auto text-2xl font-bold tracking-[0.02em]"
                  />
                </a>
              ) : (
                <SponsorLogo
                  sponsor={s}
                  variant="color"
                  width={300}
                  height={144}
                  className="font-display text-surface-0 h-12 w-auto text-2xl font-bold tracking-[0.02em]"
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Lista accessibile invisibile */}
      <ul className="sr-only">
        {sponsors.map((s) => (
          <li key={s._id}>{s.name}</li>
        ))}
      </ul>

      <div className="mt-10 flex justify-center">
        <Link
          href="/sponsor"
          className="text-brand-red hover:text-brand-blue inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          Tutti gli sponsor del club
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <style>{`
        @keyframes marquee-sponsor {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
