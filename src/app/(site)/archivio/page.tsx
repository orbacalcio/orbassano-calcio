import type { Metadata } from "next";
import { Archive } from "lucide-react";
import {
  ArchiveSeasonList,
  type ArchiveSeasonGroup,
} from "@/components/archivio/ArchiveSeasonList";
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
  alternates: { canonical: "/archivio" },
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

/**
 * Raggruppa per stagione (desc) e, dentro ogni stagione, per categoria
 * nell'ordine CATEGORY_ORDER. Restituisce una struttura serializzabile
 * (array, niente Map) passata al client ArchiveSeasonList per il filtro
 * stagione.
 */
function groupBySeason(
  entries: ArchiveTeamSeasonEntry[],
): ArchiveSeasonGroup[] {
  const byCat = new Map<
    string,
    { totalMatches: number; categories: Map<CategoryName, ArchiveTeamSeasonEntry[]> }
  >();
  for (const e of entries) {
    let g = byCat.get(e.season);
    if (!g) {
      g = { totalMatches: 0, categories: new Map() };
      byCat.set(e.season, g);
    }
    const cat = categoryOf(e);
    const list = g.categories.get(cat) ?? [];
    list.push(e);
    g.categories.set(cat, list);
    g.totalMatches += e.matchCount;
  }

  const orderedCategories: CategoryName[] = [...CATEGORY_ORDER, "Altro"];

  return Array.from(byCat.entries())
    // Stagioni desc
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([season, g]) => ({
      season,
      totalMatches: g.totalMatches,
      categories: orderedCategories
        .map((cat) => {
          const list = g.categories.get(cat);
          if (!list || list.length === 0) return null;
          // Card ordinate per team (A→Z) poi competizione (A→Z).
          const entriesSorted = [...list].sort((a, b) => {
            const teamCmp = a.teamName.localeCompare(b.teamName, "it");
            if (teamCmp !== 0) return teamCmp;
            return a.competitionName.localeCompare(b.competitionName, "it");
          });
          return { category: cat, entries: entriesSorted };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null),
    }));
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
          <ArchiveSeasonList groups={seasons} />
        )}
      </Container>
    </>
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
