import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  fetchArchiveTeamSeasons,
  type ArchiveTeamSeasonEntry,
} from "@/sanity/fetchers";

const FALLBACK_SEASON = "2026/2027";

/**
 * Hub /archivio — stagioni passate raggruppate per stagione (desc),
 * con cards per squadra che ha disputato partite quella stagione.
 *
 * Le cards linkano a /squadre/[slug]/calendario?season=X: la pagina
 * calendario per-squadra accetta gia' query string `?season=` e
 * mostra il calendar dei match di quella stagione. Niente nuova
 * pagina di dettaglio: l'archivio e' un puro entry point di
 * scoperta delle stagioni passate.
 */

const CATEGORY_ORDER = [
  "Prima Squadra",
  "Juniores",
  "Settore Giovanile",
  "Scuola Calcio",
] as const;

type CategoryName = (typeof CATEGORY_ORDER)[number] | "Altro";

export const metadata: Metadata = {
  title: "Archivio stagioni",
  description:
    "Archivio storico delle stagioni passate di ASD Orbassano Calcio: tutte le partite di Prima Squadra, Juniores, Settore Giovanile e Scuola Calcio raccolte per stagione.",
};

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

function categoryOf(entry: ArchiveTeamSeasonEntry): CategoryName {
  const c = entry.teamCategory;
  if (
    c === "Prima Squadra" ||
    c === "Juniores" ||
    c === "Settore Giovanile" ||
    c === "Scuola Calcio"
  ) {
    return c;
  }
  return "Altro";
}

type SeasonGroup = {
  season: string;
  byCategory: Map<CategoryName, ArchiveTeamSeasonEntry[]>;
  totalMatches: number;
};

function groupBySeason(entries: ArchiveTeamSeasonEntry[]): SeasonGroup[] {
  const groups = new Map<string, SeasonGroup>();
  for (const e of entries) {
    let g = groups.get(e.season);
    if (!g) {
      g = { season: e.season, byCategory: new Map(), totalMatches: 0 };
      groups.set(e.season, g);
    }
    const cat = categoryOf(e);
    const list = g.byCategory.get(cat) ?? [];
    list.push(e);
    g.byCategory.set(cat, list);
    g.totalMatches += e.matchCount;
  }
  // Ordina stagioni desc
  const sorted = Array.from(groups.values()).sort((a, b) =>
    b.season.localeCompare(a.season),
  );
  // Ordinamento card: prima per team (A→Z) poi per nome competizione
  // (A→Z), cosi' una squadra che ha disputato Campionato + Coppa nella
  // stessa stagione vede le due card una accanto all'altra in ordine
  // alfabetico di denominazione.
  for (const g of sorted) {
    for (const [, list] of g.byCategory) {
      list.sort((a, b) => {
        const teamCmp = a.teamName.localeCompare(b.teamName, "it");
        if (teamCmp !== 0) return teamCmp;
        return a.competitionName.localeCompare(b.competitionName, "it");
      });
    }
  }
  return sorted;
}

export default async function ArchivioPage() {
  const currentSeason = await fetchCurrentSeason();
  const entries = await fetchArchiveTeamSeasons(currentSeason);
  const seasons = groupBySeason(entries);

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <Archive size={16} aria-hidden />
              Archivio storico
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Stagioni passate
            </h1>
            <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
              Tutte le stagioni concluse di ASD Orbassano Calcio, squadra
              per squadra. Apri il calendario di una stagione per vedere
              tutte le partite, i risultati e i tabellini.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {seasons.length === 0 ? (
          <EmptyPlaceholder currentSeason={currentSeason} />
        ) : (
          <div className="flex flex-col gap-16">
            {seasons.map((group) => (
              <SeasonSection key={group.season} group={group} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

function SeasonSection({ group }: { group: SeasonGroup }) {
  const orderedCategories: CategoryName[] = [...CATEGORY_ORDER, "Altro"];
  return (
    <section className="flex flex-col gap-6">
      <div className="border-border/40 flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
        <h2 className="font-display text-ink-hi text-3xl font-extrabold tracking-[0.005em] uppercase sm:text-4xl">
          {group.season}
        </h2>
        <span className="text-ink-low font-mono text-xs tracking-[0.12em] uppercase">
          {group.totalMatches}{" "}
          {group.totalMatches === 1 ? "partita disputata" : "partite disputate"}
        </span>
      </div>
      <div className="flex flex-col gap-10">
        {orderedCategories.map((cat) => {
          const list = group.byCategory.get(cat);
          if (!list || list.length === 0) return null;
          return (
            <div key={cat} className="flex flex-col gap-4">
              <h3 className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
                {cat}
              </h3>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((entry) => (
                  <li
                    key={`${entry.season}-${entry.teamSlug}-${entry.competitionSlug}`}
                  >
                    <TeamSeasonCard entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TeamSeasonCard({ entry }: { entry: ArchiveTeamSeasonEntry }) {
  const href = `/squadre/${entry.teamSlug}/calendario?season=${encodeURIComponent(entry.season)}`;
  // Record V/N/P: mostrato come 3 mini-stat affiancate. Visibile solo
  // se c'e' almeno un match con score (cancelled-only → nascondi
  // record e mostra solo il totale partite).
  const hasRecord = entry.wins + entry.draws + entry.losses > 0;
  return (
    <Link
      href={href}
      className="group bg-surface-1 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {/* Eyebrow: denominazione competizione (richiesta utente
          2026-05-18, sostituisce la stagione che resta visibile come
          intestazione di sezione "2024/2025"). Title attribute con
          full name competition come fallback per nomi troncati. */}
      <span
        className="text-brand-gold font-mono text-[10px] tracking-[0.15em] uppercase line-clamp-2"
        title={entry.competitionFullName}
      >
        {entry.competitionName}
      </span>
      <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase">
        {entry.teamName}
      </span>
      {hasRecord && (
        <div className="border-border/40 mt-2 flex items-stretch gap-px overflow-hidden rounded-lg border">
          <StatCell label="V" value={entry.wins} />
          <StatCell label="N" value={entry.draws} />
          <StatCell label="P" value={entry.losses} />
        </div>
      )}
      <div className="text-ink-mid border-border/40 mt-auto flex items-center justify-between border-t pt-4 text-xs">
        <span className="font-mono tracking-wide uppercase">
          {entry.matchCount}{" "}
          {entry.matchCount === 1 ? "partita" : "partite"}
        </span>
        <ArrowUpRight
          size={14}
          className="text-brand-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}

/**
 * Mini-stat cell V/N/P nella card archivio. Layout 3-up affiancato:
 * numero grande sopra (font-display extrabold), label uppercase
 * sotto (font-mono ink-mid). Neutrale per coerenza con la regola
 * "no colori semantici basati su esito" (commit 5bb4351).
 */
function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-2/40 flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
      <span className="font-display text-ink-hi text-lg font-extrabold leading-none tabular-nums">
        {value}
      </span>
      <span className="text-ink-mid font-mono text-[9px] tracking-[0.15em] uppercase">
        {label}
      </span>
    </div>
  );
}

function EmptyPlaceholder({ currentSeason }: { currentSeason: string }) {
  return (
    <div className="border-border/40 bg-surface-1/40 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
      <p className="text-ink-mid text-base leading-relaxed">
        L&apos;archivio storico è in costruzione: al momento la stagione
        in corso è{" "}
        <span className="text-ink-hi font-semibold">{currentSeason}</span>{" "}
        e non sono ancora state caricate partite di stagioni precedenti.
      </p>
      <p className="text-ink-low text-sm">
        Torna presto: i risultati delle stagioni passate verranno aggiunti
        progressivamente.
      </p>
    </div>
  );
}
