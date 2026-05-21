"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/ui/FilterSelect";
import type { MatchAggregated, MatchSummary } from "@/sanity/fetchers";
import { getRomeDateParts } from "@/lib/date";
import { MatchCard } from "./MatchCard";

/**
 * Vista calendario "piatta" condivisa da tutte le pagine calendario
 * (Prima Squadra, Juniores, per-squadra e Settore Giovanile aggregato).
 *
 * Ordinamento DECRESCENTE (richiesta utente 2026-05-21): in cima la
 * partita piu' recente, scendendo verso le piu' vecchie. Le partite
 * sono raggruppate per mese (mesi in ordine decrescente).
 *
 * Paginazione "Carica altro" (richiesta utente 2026-05-21): di default
 * mostra solo le prime `initialCount` partite per non rendere la pagina
 * enorme; il bottone rivela `STEP` partite in piu' alla volta.
 *
 * Modalita' aggregata (Settore Giovanile): se i match sono
 * MatchAggregated (`showTeamBadge`), ogni card usa il proprio
 * teamSlug/teamName e mostra il badge categoria. Con
 * `enableCategoryFilter` compaiono i chip per filtrare per squadra
 * (es. solo U14).
 */
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

const STEP = 8;

type AnyMatch = MatchSummary | MatchAggregated;

function isAggregated(m: AnyMatch): m is MatchAggregated {
  return "teamSlug" in m;
}

function monthKey(iso: string): string {
  const d = getRomeDateParts(iso);
  return `${d.year}-${String(d.month).padStart(2, "0")}`;
}

function monthLabel(iso: string): string {
  const d = getRomeDateParts(iso);
  return `${ITALIAN_MONTHS[d.month] ?? "—"} ${d.year}`;
}

/**
 * Raggruppa per mese mantenendo l'ordine di inserimento (gia'
 * decrescente perche' la lista in ingresso e' ordinata desc). Quindi
 * mesi desc, e all'interno di ogni mese le partite restano desc.
 */
function groupByMonth(
  matches: AnyMatch[],
): Array<{ key: string; label: string; items: AnyMatch[] }> {
  const map = new Map<string, AnyMatch[]>();
  for (const m of matches) {
    const k = monthKey(m.date);
    const list = map.get(k);
    if (list) list.push(m);
    else map.set(k, [m]);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: items[0] ? monthLabel(items[0].date) : key,
    items,
  }));
}

type Props = {
  matches: AnyMatch[];
  ourTeamSlug: string;
  ourTeamName: string;
  /** Mostra il badge categoria su ogni card (vista SG aggregata). */
  showTeamBadge?: boolean;
  /** Mostra i chip filtro per squadra/categoria (vista SG aggregata). */
  enableCategoryFilter?: boolean;
  initialCount?: number;
};

export function CalendarioFlatList({
  matches,
  ourTeamSlug,
  ourTeamName,
  showTeamBadge = false,
  enableCategoryFilter = false,
  initialCount = STEP,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(initialCount);

  // Categorie distinte (teamName) per i chip filtro, ordine alfabetico.
  const categories = useMemo(() => {
    if (!enableCategoryFilter) return [];
    const set = new Set<string>();
    for (const m of matches) {
      if (isAggregated(m)) set.add(m.teamName);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
  }, [matches, enableCategoryFilter]);

  // Filtro categoria + ordinamento decrescente per data.
  const sorted = useMemo(() => {
    const filtered =
      enableCategoryFilter && activeCategory !== "all"
        ? matches.filter(
            (m) => isAggregated(m) && m.teamName === activeCategory,
          )
        : matches;
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [matches, activeCategory, enableCategoryFilter]);

  if (matches.length === 0) {
    return (
      <div className="border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center">
        <p className="text-ink-hi font-display text-xl font-bold tracking-[0.005em] uppercase">
          Calendario in arrivo
        </p>
        <p className="text-ink-mid mx-auto mt-3 max-w-md text-sm leading-relaxed">
          La LND pubblica i gironi a fine agosto. Appena disponibili,
          troverai qui tutto il calendario stagionale.
        </p>
      </div>
    );
  }

  const visible = sorted.slice(0, visibleCount);
  const groups = groupByMonth(visible);
  const hasMore = visibleCount < sorted.length;

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setVisibleCount(initialCount);
  }

  return (
    <div className="flex flex-col gap-8">
      {enableCategoryFilter && categories.length > 1 && (
        <FilterSelect
          id="categoria-filter"
          label="Filtra per categoria"
          value={activeCategory}
          onChange={handleCategory}
          options={[
            { value: "all", label: "Tutte le categorie" },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
        />
      )}

      {groups.map((g) => (
        <div key={g.key} className="flex flex-col gap-3">
          <h4 className="font-display text-ink-mid sticky top-[84px] z-10 bg-surface-0/95 -mx-1 px-1 text-lg font-bold tracking-[0.1em] uppercase backdrop-blur-md md:text-xl lg:top-[78px]">
            {g.label}
          </h4>
          <div className="flex flex-col gap-2">
            {g.items.map((match) => {
              const agg = isAggregated(match);
              return (
                <MatchCard
                  key={match._id}
                  match={match}
                  ourTeamSlug={agg ? match.teamSlug : ourTeamSlug}
                  ourTeamName={
                    agg ? match.teamDisplayName ?? ourTeamName : ourTeamName
                  }
                  teamBadge={showTeamBadge && agg ? match.teamName : undefined}
                />
              );
            })}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + STEP)}
            className="border-border text-ink-hi hover:border-brand-gold hover:text-brand-gold focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Carica altre partite
          </button>
        </div>
      )}
    </div>
  );
}

