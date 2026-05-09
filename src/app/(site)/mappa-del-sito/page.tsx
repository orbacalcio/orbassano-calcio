import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  fetchAllNewsSlugs,
  fetchAllPlayersForSitemap,
  fetchAllTeamSlugs,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Mappa del sito",
  description:
    "Tutte le sezioni del sito ASD Orbassano Calcio: news, squadre, società, sponsor, contatti, legali. Indice navigabile completo.",
};

/**
 * Mappa del sito user-friendly. Diversa dal `/sitemap.xml` (machine
 * readable per crawler): questa e' una pagina HTML con TUTTI i link
 * navigabili del sito, raggruppati per area.
 *
 * Contenuti dinamici (news / squadre / players) fetchati da Sanity per
 * dare un indice completo aggiornato. Buono anche per SEO (link
 * interni dense).
 */
type Section = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

export default async function MappaDelSitoPage() {
  const [newsSlugs, teamSlugs, players] = await Promise.all([
    fetchAllNewsSlugs(),
    fetchAllTeamSlugs(),
    fetchAllPlayersForSitemap(),
  ]);

  const playersByTeam = new Map<string, typeof players>();
  for (const p of players) {
    const list = playersByTeam.get(p.teamSlug) ?? [];
    list.push(p);
    playersByTeam.set(p.teamSlug, list);
  }

  const sections: Section[] = [
    {
      title: "Pagine principali",
      links: [
        { href: "/", label: "Home" },
        { href: "/news", label: "Archivio news" },
        { href: "/squadre", label: "Squadre" },
        { href: "/societa", label: "Società" },
        { href: "/sponsor", label: "Sponsor" },
        { href: "/contatti", label: "Contatti" },
      ],
    },
    {
      title: "Società",
      links: [
        { href: "/societa", label: "Overview" },
        { href: "/societa/storia", label: "Storia" },
        { href: "/societa/organigramma", label: "Organigramma" },
        { href: "/societa/impianti", label: "Impianti sportivi" },
        { href: "/societa/biglietteria", label: "Biglietteria" },
      ],
    },
    {
      title: "Squadre",
      links: [
        { href: "/squadre", label: "Hub squadre" },
        ...teamSlugs.map((slug) => ({
          href: `/squadre/${slug}`,
          label: humanizeSlug(slug),
        })),
      ],
    },
    {
      title: "Sponsor & partner",
      links: [
        { href: "/sponsor", label: "I nostri sponsor" },
        { href: "/sponsor/partner", label: "Corporate partner" },
        { href: "/sponsor/opportunita", label: "Diventa sponsor" },
      ],
    },
    {
      title: "Sostieni il club",
      links: [
        { href: "/5x1000", label: "5×1000" },
        { href: "/newsletter", label: "Newsletter" },
      ],
    },
    {
      title: "Legale",
      links: [
        { href: "/legal/privacy", label: "Informativa privacy" },
        { href: "/legal/cookie", label: "Cookie policy" },
        { href: "/legal/termini", label: "Termini e condizioni" },
      ],
    },
  ];

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-12 lg:py-16" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Mappa del sito
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Tutto il sito in un colpo d&apos;occhio
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Indice completo delle sezioni del sito orbassanocalcio.com.
              Per la versione machine-readable per i motori di ricerca,{" "}
              <a
                href="/sitemap.xml"
                className="text-brand-gold hover:text-brand-white inline-flex items-center gap-1 underline-offset-2 hover:underline"
              >
                sitemap.xml
                <ExternalLink size={12} aria-hidden />
              </a>
              .
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-16 lg:py-20" size="wide">
        <RevealOnScroll>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <section
                key={section.title}
                className="flex flex-col gap-4"
              >
                <h2 className="font-display text-brand-gold text-lg font-bold tracking-[0.15em] uppercase">
                  {section.title}
                </h2>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-ink-mid hover:text-ink-hi group inline-flex items-center gap-2 text-sm transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight
                          size={12}
                          className="text-brand-gold opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </RevealOnScroll>

        {newsSlugs.length > 0 && (
          <RevealOnScroll>
            <section className="border-border/40 mt-16 flex flex-col gap-4 border-t pt-10">
              <h2 className="font-display text-brand-gold text-lg font-bold tracking-[0.15em] uppercase">
                News pubblicate
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {newsSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/news/${slug}`}
                      className="text-ink-mid hover:text-ink-hi text-sm transition-colors"
                    >
                      {humanizeSlug(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </RevealOnScroll>
        )}

        {playersByTeam.size > 0 &&
          Array.from(playersByTeam.entries()).map(([teamSlug, list]) => (
            <RevealOnScroll key={teamSlug}>
              <section className="border-border/40 mt-12 flex flex-col gap-4 border-t pt-10">
                <h2 className="font-display text-brand-gold text-lg font-bold tracking-[0.15em] uppercase">
                  Rosa {humanizeSlug(teamSlug)}
                </h2>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {list.map((p) => (
                    <li key={`${p.teamSlug}-${p.slug}`}>
                      <Link
                        href={`/squadre/${p.teamSlug}/${p.slug}`}
                        className="text-ink-mid hover:text-ink-hi text-sm transition-colors"
                      >
                        {humanizeSlug(p.slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </RevealOnScroll>
          ))}
      </Container>
    </>
  );
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
