import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { MatchCard } from "@/components/calendario/MatchCard";
import { cn } from "@/lib/cn";
import { getRomeDateParts } from "@/lib/date";
import { buildSportsEventListLd } from "@/lib/json-ld";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  fetchMatchesBySettoreGiovanile,
  fetchSettoreGiovanileSeasons,
  type MatchAggregated,
} from "@/sanity/fetchers";

const FALLBACK_SEASON = "2026/2027";

const ITALIAN_MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export const metadata: Metadata = {
  title: "Calendario Settore Giovanile Scolastico",
  description:
    "Tutti i calendari del Settore Giovanile Scolastico ASD Orbassano Calcio (Allievi U17/U16, Giovanissimi U15/U14) raccolti in un'unica vista cronologica della stagione.",
  // Canonical fisso: la query string ?season= e' UX-utility, non
  // SEO-valuabile. Evita duplicate content fra ?season=2024/2025 e
  // ?season=2025/2026.
  alternates: {
    canonical: "/squadre/settore-giovanile/calendario",
  },
};

/**
 * Pagina aggregata calendario Settore Giovanile.
 *
 * Mostra TUTTI i match delle squadre del Settore Giovanile in un'UNICA
 * lista cronologica ascendente raggruppata per mese (richiesta utente
 * 2026-05-18: rimosse le 2 sezioni Prossime/Risultati). Ogni match porta
 * un badge oro con il nome della squadra accanto a data, avversario e
 * score, per distinguere a colpo d'occhio U17 / U16 / U15 / U14.
 *
 * Selezione stagione via query string `?season=`. Se piu' stagioni
 * disponibili, default = settings.currentSeason; se quella stagione
 * non ha competition SG (es. inizio anno, ancora vuoto), fallback alla
 * piu' recente fra le disponibili.
 *
 * Le singole pagine /squadre/[slug]/calendario delle squadre SG restano
 * accessibili via URL diretto ma nessun link del sito le richiama
 * (NavigationDrawer accordion Calendario → tutto va qui).
 */
type CurrentSeasonSettings = { currentSeason?: string | null };

async function fetchCurrentSeason(): Promise<string> {
  try {
    const data = (await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    )) as CurrentSeasonSettings | null;
    return data?.currentSeason?.trim() || FALLBACK_SEASON;
  } catch {
    return FALLBACK_SEASON;
  }
}

function monthGroupKey(iso: string): string {
  const d = getRomeDateParts(iso);
  return `${d.year}-${String(d.month).padStart(2, "0")}`;
}

function monthGroupLabel(iso: string): string {
  const d = getRomeDateParts(iso);
  return `${ITALIAN_MONTHS[d.month] ?? "—"} ${d.year}`;
}

function groupByMonth(
  matches: MatchAggregated[],
): Array<{ key: string; label: string; items: MatchAggregated[] }> {
  const map = new Map<string, MatchAggregated[]>();
  for (const m of matches) {
    const k = monthGroupKey(m.date);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  const entries = Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: monthGroupLabel(items[0]!.date),
    items,
  }));
  // Ordine asc cronologico (gennaio → dicembre) — richiesta utente
  // 2026-05-18: niente piu' partizione Prossime/Risultati, lista unica
  // cronologica.
  entries.sort((a, b) => a.key.localeCompare(b.key));
  return entries;
}

type Search = { season?: string };

export default async function CalendarioSettoreGiovanilePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { season: querySeason } = await searchParams;
  const currentSeason = await fetchCurrentSeason();
  const availableSeasons = await fetchSettoreGiovanileSeasons();

  // Default = currentSeason se presente fra le disponibili; altrimenti
  // piu' recente fra quelle che hanno almeno una competition. Se
  // availableSeasons vuoto (inizio anno, niente competition SG caricate),
  // mostriamo comunque currentSeason col placeholder.
  const fallbackSeason = availableSeasons[0] ?? currentSeason;
  const selectedSeason =
    querySeason && availableSeasons.includes(querySeason)
      ? querySeason
      : availableSeasons.includes(currentSeason)
        ? currentSeason
        : fallbackSeason;

  const matches = await fetchMatchesBySettoreGiovanile(selectedSeason);
  const groups = groupByMonth(matches);

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
      ourTeamSlug: m.teamSlug,
      ourTeamName: m.teamName,
      competition: m.competition
        ? {
            shortName: m.competition.shortName,
            season: m.competition.season,
            group: m.competition.group,
          }
        : null,
      opponentName:
        m.opponent?.club?.shortName ?? m.opponent?.club?.name ?? null,
      opponentWebsite: m.opponent?.club?.websiteUrl ?? null,
    })),
  );

  // Lista pill: se ho stagioni disponibili uso quelle; se vuoto, mostro
  // l'unica pill = selectedSeason (currentSeason) come stato attivo.
  const displaySeasons =
    availableSeasons.length > 0 ? availableSeasons : [selectedSeason];

  return (
    <>
      {eventsLd.length > 0 && <JsonLd data={eventsLd} />}

      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <div className="flex max-w-3xl flex-col gap-3">
            <Link
              href="/squadre/settore-giovanile"
              className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-wide transition-colors"
            >
              <ArrowLeft size={12} aria-hidden />
              Torna al Settore Giovanile
            </Link>
            <span className="text-brand-gold font-display text-sm font-extrabold tracking-[0.15em] uppercase md:text-base">
              Settore Giovanile Scolastico · {selectedSeason}
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Calendario &amp; Risultati
            </h1>
            <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
              Tutte le partite delle squadre del Settore Giovanile
              Scolastico in un&apos;unica vista cronologica della
              stagione. Il badge oro accanto a ogni partita indica la
              squadra.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {/* Pill switcher stagioni: sempre visibile per coerenza UI con
            la pagina calendario per-squadra. Selezione tramite query
            string ?season=, niente client state — funziona con JS off. */}
        <nav
          aria-label="Scegli stagione"
          className="border-border/40 mb-8 flex flex-wrap items-center gap-2 border-b pb-4"
        >
          <span className="font-mono text-ink-mid mr-2 text-[11px] tracking-[0.15em] uppercase">
            Stagione:
          </span>
          {displaySeasons.map((s) => {
            const isActive = s === selectedSeason;
            const isCurrent = s === currentSeason;
            return (
              <Link
                key={s}
                href={
                  isCurrent
                    ? `/squadre/settore-giovanile/calendario`
                    : `/squadre/settore-giovanile/calendario?season=${encodeURIComponent(s)}`
                }
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-xs tracking-[0.05em] transition-colors",
                  isActive
                    ? "border-brand-gold bg-brand-gold text-surface-0"
                    : "border-border text-ink-mid hover:border-brand-gold/60 hover:text-ink-hi",
                )}
              >
                {s}
                {isCurrent && !isActive && (
                  <span className="ml-1.5 opacity-60">· in corso</span>
                )}
              </Link>
            );
          })}
        </nav>

        {matches.length === 0 ? (
          <EmptyPlaceholder />
        ) : (
          <MatchList groups={groups} />
        )}
      </Container>
    </>
  );
}

function EmptyPlaceholder() {
  return (
    <p className="border-border/40 bg-surface-1/40 text-ink-mid rounded-2xl border border-dashed p-10 text-center text-base leading-relaxed">
      Il calendario delle squadre del Settore Giovanile non è ancora
      stato pubblicato per questa stagione. Torna presto: le partite
      verranno aggiunte mano a mano che la federazione comunica i
      gironi.
    </p>
  );
}

function MatchList({
  groups,
}: {
  groups: Array<{ key: string; label: string; items: MatchAggregated[] }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <div key={g.key} className="flex flex-col gap-3">
          {/* Header mese + MatchCard allineati alle altre pagine
              calendario (CalendarioFlatList): grafica uniforme,
              punteggio al centro, font grande. Il teamBadge mostra la
              categoria (es. "Allievi U17"), unico discriminante della
              vista aggregata multi-squadra. */}
          <h4 className="font-display text-ink-mid sticky top-[84px] z-10 bg-surface-0/95 -mx-1 px-1 text-lg font-bold tracking-[0.1em] uppercase backdrop-blur-md md:text-xl lg:top-[78px]">
            {g.label}
          </h4>
          <div className="flex flex-col gap-2">
            {g.items.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                ourTeamSlug={m.teamSlug}
                ourTeamName={m.teamDisplayName ?? "Orbassano Calcio"}
                teamBadge={m.teamName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// MatchRow rimossa 2026-05-20: la vista aggregata usa ora direttamente
// MatchCard (vedi MatchList sopra) per uniformita' con le altre pagine
// calendario.

