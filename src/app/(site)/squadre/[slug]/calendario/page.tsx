import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CalendarioClient } from "@/components/calendario/CalendarioClient";
import { CalendarioFlatList } from "@/components/calendario/CalendarioFlatList";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { buildSportsEventListLd } from "@/lib/json-ld";
import {
  fetchMatchesByTeam,
  fetchTeamBySlug,
  fetchTeamSeasons,
} from "@/sanity/fetchers";

const FALLBACK_SEASON = "2026/2027";

type Params = { slug: string };
type Search = { season?: string };

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
    openGraph: team.heroImage
      ? { images: [{ url: team.heroImage, alt: team.name }] }
      : undefined,
  };
}

export default async function CalendarioPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { season: querySeason } = await searchParams;
  const team = await fetchTeamBySlug(slug);
  if (!team) notFound();

  // Lista stagioni disponibili per questa squadra (distinct su
  // competition.season). Se la query string `?season=` e' valorizzata
  // e presente in lista, la usa; altrimenti default = team.season
  // (stagione corrente del documento Team) o fallback hardcoded.
  const seasons = await fetchTeamSeasons(slug);
  const teamCurrentSeason = team.season ?? FALLBACK_SEASON;
  const season =
    querySeason && seasons.includes(querySeason)
      ? querySeason
      : teamCurrentSeason;
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
              gare, risultati, tabellini ufficiali e tag V/X/P per ogni
              incontro disputato.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {/* Tab switcher stagioni: sempre visibile per consistenza UI
            tra Prima Squadra e Settore Giovanile. Se la squadra ha
            solo la stagione corrente, mostra l'unica pill come stato
            "attiva". Selezione tramite query string ?season=, niente
            client state — funziona anche con JS off. Fallback se
            fetchTeamSeasons restituisce vuoto (nessuna competition
            in CMS): usa la stagione corrente del Team doc. */}
        {(() => {
          const displaySeasons =
            seasons.length > 0 ? seasons : [teamCurrentSeason];
          return (
            <nav
              aria-label="Scegli stagione"
              className="border-border/40 mb-8 flex flex-wrap items-center gap-2 border-b pb-4"
            >
              <span className="font-mono text-ink-mid mr-2 text-[11px] tracking-[0.15em] uppercase">
                Stagione:
              </span>
              {displaySeasons.map((s) => {
                const isCurrent = s === season;
                const isOriginal = s === teamCurrentSeason;
                return (
                  <Link
                    key={s}
                    href={
                      isOriginal
                        ? `/squadre/${slug}/calendario`
                        : `/squadre/${slug}/calendario?season=${encodeURIComponent(s)}`
                    }
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "rounded-full border px-4 py-1.5 font-mono text-xs tracking-[0.05em] transition-colors",
                      isCurrent
                        ? "border-brand-gold bg-brand-gold text-surface-0"
                        : "border-border text-ink-mid hover:border-brand-gold/60 hover:text-ink-hi",
                    )}
                  >
                    {s}
                    {isOriginal && !isCurrent && (
                      <span className="ml-1.5 opacity-60">· in corso</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          );
        })()}

        {/* Prima Squadra: CalendarioClient con tab Prossime/Risultati/
            Tutte (volumi alti, l'utente cerca tipicamente "prossima
            partita" o "ultimo risultato" separatamente). Tutte le
            altre categorie (Juniores, Settore Giovanile, Scuola
            Calcio): lista flat cronologica ascendente raggruppata per
            mese, niente tab — richiesta utente 2026-05-18. */}
        {team.category === "Prima Squadra" ? (
          <CalendarioClient
            matches={matches}
            ourTeamSlug={slug}
            ourTeamName={team.displayName || "Orbassano Calcio"}
            defaultTab={season === teamCurrentSeason ? "prossime" : "risultati"}
          />
        ) : (
          <CalendarioFlatList
            matches={matches}
            ourTeamSlug={slug}
            ourTeamName={team.displayName || "Orbassano Calcio"}
          />
        )}
      </Container>
    </>
  );
}
