import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CalendarioClient } from "@/components/calendario/CalendarioClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { buildSportsEventListLd } from "@/lib/json-ld";
import { fetchMatchesByTeam, fetchTeamBySlug } from "@/sanity/fetchers";

const FALLBACK_SEASON = "2026/2027";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await fetchTeamBySlug(slug);
  if (!team) return { title: "Calendario non trovato" };
  return {
    title: `Calendario & Risultati ${team.name}`,
    description: `Tutte le partite di ${team.name} ASD Orbassano Calcio nella stagione ${team.season ?? FALLBACK_SEASON}: prossime gare, risultati, classifica.`,
  };
}

export default async function CalendarioPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const team = await fetchTeamBySlug(slug);
  if (!team) notFound();

  const season = team.season ?? FALLBACK_SEASON;
  const matches = await fetchMatchesByTeam(slug, season);

  // Header competition-led: prendiamo il nome del campionato dalla
  // prima competition disponibile nei match, oppure fallback a
  // team.league (legacy). Se vuoto, mostriamo solo il titolo squadra.
  const firstComp = matches[0]?.competition;
  const competitionLabel =
    firstComp?.shortName ?? firstComp?.name ?? team.league ?? null;
  const groupLabel = firstComp?.group ?? team.group ?? null;
  const headerLine = [
    competitionLabel,
    groupLabel ? `Girone ${groupLabel}` : null,
    season,
  ]
    .filter(Boolean)
    .join(" · ");

  // JSON-LD SportsEvent[] — uno per match. Renderizzato in array singolo.
  const eventsLd = buildSportsEventListLd(
    matches.map((m) => ({
      match: {
        _id: m._id,
        date: m.date,
        matchday: m.matchday,
        home: m.home,
        venue: m.venue,
        status: m.status,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
        isOpponentTbd: m.isOpponentTbd,
        isDateTbd: m.isDateTbd,
      },
      ourTeamSlug: slug,
      ourTeamName: team.name,
      competition: m.competition
        ? {
            shortName: m.competition.shortName,
            season: m.competition.season,
            group: m.competition.group,
          }
        : null,
      opponentName: m.opponent?.club?.shortName ?? m.opponent?.club?.name ?? null,
      opponentWebsite: m.opponent?.club?.websiteUrl ?? null,
    })),
  );

  return (
    <>
      {eventsLd.length > 0 && <JsonLd data={eventsLd} />}

      {/* HERO competition-led */}
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <div className="flex max-w-3xl flex-col gap-3">
            <Link
              href={`/squadre/${slug}`}
              className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-wide transition-colors"
            >
              <ArrowLeft size={12} aria-hidden />
              Torna a {team.name}
            </Link>
            {headerLine && (
              <span className="text-brand-gold font-display text-sm font-extrabold tracking-[0.15em] uppercase md:text-base">
                {headerLine}
              </span>
            )}
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Calendario &amp; Risultati
            </h1>
            <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
              Tutte le partite di {team.name} stagione {season}: prossime
              gare, risultati, tabellini ufficiali e tag W/D/L per ogni
              incontro disputato.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        <CalendarioClient
          matches={matches}
          ourTeamSlug={slug}
          ourTeamName={team.name}
        />
      </Container>
    </>
  );
}
