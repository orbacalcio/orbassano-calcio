import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CalendarioFlatList } from "@/components/calendario/CalendarioFlatList";
import { SeasonSelect } from "@/components/calendario/SeasonSelect";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
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
    // Canonical fisso (no query string): le varianti ?season=YYYY/YYYY
    // sono UX-utility, non SEO-valuabili. Evita duplicate content fra
    // /squadre/prima-squadra/calendario e /squadre/prima-squadra/calendario?season=2024/2025.
    alternates: {
      canonical: `/squadre/${slug}/calendario`,
    },
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

  // Header competition-led: preferiamo sempre il CAMPIONATO, non la
  // prima competition in ordine di data. Senza questo filtro, quando
  // esiste una coppa che parte prima del campionato (caso tipico: Coppa
  // Piemonte a fine agosto, campionato a metà settembre) l'header della
  // pagina mostrerebbe la coppa al posto del campionato di riferimento.
  // Fallback a matches[0] per le squadre che hanno solo coppe/amichevoli.
  const firstComp =
    matches.find((m) => m.competition?.category === "championship")
      ?.competition ?? matches[0]?.competition;
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
        <HeaderMotif variant="pitch" />
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
              Tutte le partite di {team.name} stagione {season}, dalla
              più recente: risultati, tabellini ufficiali e prossime
              gare.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {/* Selettore stagione a tendina (richiesta utente 2026-05-21:
            tutti i filtri a tendina). Mostrato solo se esiste piu' di
            una stagione: con una sola stagione la select sarebbe inutile
            (l'header riporta gia' la stagione corrente). Naviga via
            ?season= con router.push (SeasonSelect, client). */}
        {(() => {
          const displaySeasons =
            seasons.length > 0 ? seasons : [teamCurrentSeason];
          if (displaySeasons.length <= 1) return null;
          return (
            <div className="border-border/40 mb-8 border-b pb-4">
              <SeasonSelect
                basePath={`/squadre/${slug}/calendario`}
                seasons={displaySeasons}
                selectedSeason={season}
                resetSeason={teamCurrentSeason}
              />
            </div>
          );
        })()}

        {/* Tutte le categorie (Prima Squadra inclusa, richiesta utente
            2026-05-18): lista flat cronologica ascendente raggruppata
            per mese, niente tab Prossime/Risultati/Tutte. La logica
            "data presente" e' implicita nella sequenza temporale. */}
        <CalendarioFlatList
          matches={matches}
          ourTeamSlug={slug}
          ourTeamName={team.displayName || "Orbassano Calcio"}
          nowIso={new Date().toISOString()}
        />
      </Container>
    </>
  );
}
