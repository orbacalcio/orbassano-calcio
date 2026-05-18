import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { FEATURES } from "@/lib/features";
import {
  fetchAllPlayersForSitemap,
  fetchAllTeamSlugs,
  fetchHasActivePartners,
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
  const [teamSlugs, players, hasPartners] = await Promise.all([
    fetchAllTeamSlugs(),
    fetchAllPlayersForSitemap(),
    fetchHasActivePartners(),
  ]);

  const playersByTeam = new Map<string, typeof players>();
  for (const p of players) {
    const list = playersByTeam.get(p.teamSlug) ?? [];
    list.push(p);
    playersByTeam.set(p.teamSlug, list);
  }

  // Mappa allineata alla struttura del sito al 2026-05-17.
  // NB: pagine deliberatamente NASCOSTE dal sito (URL diretto OK ma
  // nessun link interno) NON compaiono qui: /calendario hub
  // ("Tutti i calendari"), /newsletter, /ricerca, /squadre (hub
  // generico), /societa (hub generico). Pattern juventus.com: niente
  // landing intermedia, naviga dal menu direttamente alla pagina.
  const sections: Section[] = [
    {
      title: "Pagine principali",
      links: [
        { href: "/", label: "Home" },
        { href: "/news", label: "Archivio news" },
        { href: "/gallery", label: "Gallery" },
        { href: "/sponsor", label: "Sponsor" },
        { href: "/contatti", label: "Contatti" },
      ],
    },
    {
      title: "Società",
      links: [
        { href: "/societa/storia", label: "Storia" },
        { href: "/societa/organigramma", label: "Organigramma" },
        { href: "/societa/impianti", label: "Impianti sportivi" },
        { href: "/societa/biglietteria", label: "Biglietteria" },
        ...(FEATURES.governanceSection
          ? [
              { href: "/societa/codice-etico", label: "Codice Etico" },
              { href: "/societa/segnalazioni", label: "Segnalazioni" },
            ]
          : []),
      ],
    },
    {
      title: "Squadre",
      links: [
        // /squadre/settore-giovanile e' una vista categoria (4 card
        // U14-U17 + Open Days + Tornei + modulo iscrizione) — non
        // corrisponde a uno slug team, va inserita manualmente.
        { href: "/squadre/settore-giovanile", label: "Settore Giovanile (hub)" },
        ...teamSlugs.map((slug) => ({
          href: `/squadre/${slug}`,
          label: humanizeSlug(slug),
        })),
      ],
    },
    {
      title: "Calendari & eventi",
      links: [
        { href: "/squadre/prima-squadra/calendario", label: "Calendario Prima Squadra" },
        { href: "/squadre/juniores/calendario", label: "Calendario Juniores" },
        {
          href: "/squadre/settore-giovanile/calendario",
          label: "Calendario Settore Giovanile (aggregato)",
        },
        { href: "/settore-giovanile/open-days", label: "Open Days" },
        { href: "/tornei", label: "Tornei" },
        { href: "/archivio", label: "Archivio stagioni passate" },
      ],
    },
    {
      title: "Sponsor & partner",
      links: [
        { href: "/sponsor", label: "I nostri sponsor" },
        ...(hasPartners
          ? [{ href: "/sponsor/partner", label: "Corporate partner" }]
          : []),
        { href: "/sponsor/opportunita", label: "Diventa sponsor" },
      ],
    },
    {
      title: "Sostieni il club",
      links: [
        { href: "/5x1000", label: "5×1000" },
      ],
    },
    {
      title: "Legale",
      links: [
        { href: "/legal/privacy", label: "Informativa privacy" },
        { href: "/legal/cookie", label: "Informativa cookie" },
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

        {/* Sezione "News pubblicate" rimossa 2026-05-17 (richiesta
            utente): le news sono navigabili dalla /news archive +
            dalla ricerca; elencarle ad una a una nella mappa rendeva
            la pagina inutilmente lunga. Le news restano in sitemap.xml
            per i crawler search engine. */}

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
