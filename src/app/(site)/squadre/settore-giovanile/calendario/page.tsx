import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { TeamLogo } from "@/components/calendario/TeamLogo";
import { buildSportsEventListLd } from "@/lib/json-ld";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  fetchMatchesBySettoreGiovanile,
  type MatchAggregated,
} from "@/sanity/fetchers";

const FALLBACK_SEASON = "2026/2027";
const OUR_LOGO_SRC = "/Logo_Orbassano_2K.png";

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

const ITALIAN_DAYS_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

export const metadata: Metadata = {
  title: "Calendario Settore Giovanile",
  description:
    "Tutti i calendari del Settore Giovanile ASD Orbassano Calcio (Under 14, Under 15, Under 16, Under 17) raccolti in un'unica vista cronologica: prossime gare e risultati di ogni squadra giovanile.",
};

/**
 * Pagina aggregata calendario Settore Giovanile.
 *
 * Mostra TUTTI i match delle squadre del Settore Giovanile (U14-U17 +
 * Scuola Calcio se attiva) in 2 sezioni: "Prossime partite" + "Risultati".
 * Ogni match riporta un badge gold con il nome della squadra accanto
 * a data, avversario e score: cosi' un'unica pagina copre tutto il
 * settore senza dover navigare team-per-team.
 *
 * Le singole pagine /squadre/[slug]/calendario delle squadre SG
 * restano accessibili via URL diretto ma nessun link del sito le
 * richiama (vedi NavigationDrawer accordion Calendario → tutto va a
 * /squadre/settore-giovanile/calendario).
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

function isPast(m: MatchAggregated, now: number): boolean {
  if (m.status === "finished") return true;
  if (m.status === "cancelled") return true;
  return new Date(m.date).getTime() < now;
}

function formatItalianDateTime(iso: string): string {
  const d = new Date(iso);
  const day = ITALIAN_DAYS_SHORT[d.getDay()] ?? "";
  const dd = String(d.getDate()).padStart(2, "0");
  const month = ITALIAN_MONTHS[d.getMonth()] ?? "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${dd} ${month} · ${hh}:${mm}`;
}

function monthGroupKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
}

function monthGroupLabel(iso: string): string {
  const d = new Date(iso);
  return `${ITALIAN_MONTHS[d.getMonth()] ?? "—"} ${d.getFullYear()}`;
}

/**
 * Partiziona match in upcoming/past usando Date.now(). Extracted in
 * funzione esterna (non body component) per non triggerare il check
 * react-hooks/purity di React 19 sui server component.
 */
function partitionMatches(matches: MatchAggregated[]): {
  upcoming: MatchAggregated[];
  past: MatchAggregated[];
} {
  const now = Date.now();
  return {
    upcoming: matches.filter((m) => !isPast(m, now)),
    past: matches.filter((m) => isPast(m, now)).reverse(),
  };
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
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: monthGroupLabel(items[0]!.date),
    items,
  }));
}

export default async function CalendarioSettoreGiovanilePage() {
  const season = await fetchCurrentSeason();
  const matches = await fetchMatchesBySettoreGiovanile(season);

  // partitionMatches isola Date.now() in funzione esterna per
  // bypassare il check react-hooks/purity di React 19.
  const { upcoming, past } = partitionMatches(matches);

  const upcomingByMonth = groupByMonth(upcoming);
  const pastByMonth = groupByMonth(past);

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
              Settore Giovanile · {season}
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Calendario &amp; Risultati
            </h1>
            <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
              Tutte le partite delle squadre del Settore Giovanile
              (U14-U17) in un&apos;unica vista cronologica. Il badge oro
              accanto a ogni partita indica la squadra.
            </p>
          </div>
        </Container>
      </header>

      <Container className="flex flex-col gap-16 py-12 lg:py-16" size="wide">
        {matches.length === 0 ? (
          <EmptyPlaceholder />
        ) : (
          <>
            <MatchSection
              title="Prossime partite"
              emptyLabel="Nessuna partita in programma."
              groups={upcomingByMonth}
            />
            <MatchSection
              title="Risultati"
              emptyLabel="Nessuna partita ancora giocata."
              groups={pastByMonth}
            />
          </>
        )}
      </Container>
    </>
  );
}

function EmptyPlaceholder() {
  return (
    <p className="border-border/40 bg-surface-1/40 text-ink-mid rounded-2xl border border-dashed p-10 text-center text-base leading-relaxed">
      Il calendario delle squadre del Settore Giovanile non è ancora
      stato pubblicato. Torna presto: le partite verranno aggiunte mano
      a mano che la federazione comunica i gironi.
    </p>
  );
}

function MatchSection({
  title,
  emptyLabel,
  groups,
}: {
  title: string;
  emptyLabel: string;
  groups: Array<{ key: string; label: string; items: MatchAggregated[] }>;
}) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-ink-hi text-2xl font-extrabold tracking-[0.005em] uppercase sm:text-3xl">
        {title}
      </h2>
      {groups.length === 0 ? (
        <p className="text-ink-mid text-sm italic">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((g) => (
            <div key={g.key} className="flex flex-col gap-3">
              <h3 className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
                {g.label}
              </h3>
              <ul className="divide-border/40 border-border/40 flex flex-col divide-y border-y">
                {g.items.map((m) => (
                  <MatchRow key={m._id} match={m} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Riga sintetica match nella lista aggregata. Layout:
 *   [BADGE SQUADRA] | [DATA/ORA] | [HOME LOGO + NAME] vs [AWAY LOGO + NAME] | [SCORE / "—"]
 * Su mobile collassa a 2 righe (badge+data sopra, match sotto).
 */
function MatchRow({ match }: { match: MatchAggregated }) {
  const opponentName =
    match.opponent?.club?.shortName ??
    match.opponent?.club?.name ??
    (match.isOpponentTbd ? "Avversario TBD" : "—");
  const opponentLogo = match.opponent?.club?.logo ?? null;
  const homeName = match.home ? match.teamName : opponentName;
  const homeLogo = match.home ? OUR_LOGO_SRC : opponentLogo;
  const awayName = match.home ? opponentName : match.teamName;
  const awayLogo = match.home ? opponentLogo : OUR_LOGO_SRC;
  const showScore =
    typeof match.scoreHome === "number" && typeof match.scoreAway === "number";

  return (
    <li className="grid grid-cols-1 items-center gap-3 py-4 md:grid-cols-[7rem_10rem_1fr_5rem] md:gap-x-4">
      <span className="text-brand-gold border-brand-gold/40 inline-flex w-fit items-center gap-1 self-start rounded-full border px-2.5 py-1 font-display text-[10px] font-bold tracking-[0.15em] uppercase">
        {match.teamName}
      </span>
      <span className="text-ink-mid font-mono text-[11px] tracking-wide uppercase">
        {match.isDateTbd ? "Data TBD" : formatItalianDateTime(match.date)}
      </span>
      <div className="text-ink-hi flex items-center gap-2 text-sm md:gap-3">
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate">{homeName}</span>
          <TeamLogo
            src={homeLogo}
            name={homeName}
            size={28}
            interactive={false}
          />
        </span>
        <span className="text-ink-low shrink-0 font-mono text-[11px] tracking-wide uppercase">
          vs
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <TeamLogo
            src={awayLogo}
            name={awayName}
            size={28}
            interactive={false}
          />
          <span className="truncate">{awayName}</span>
        </span>
      </div>
      <span className="text-ink-hi text-right font-mono text-base font-semibold tabular-nums sm:text-lg">
        {showScore ? `${match.scoreHome}-${match.scoreAway}` : "—"}
      </span>
    </li>
  );
}
