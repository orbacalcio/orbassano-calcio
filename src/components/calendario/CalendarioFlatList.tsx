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
 * Ordinamento CRESCENTE (richiesta utente 2026-08-10, sostituisce il
 * decrescente del 2026-05-21): si legge come un calendario stampato,
 * dalla prima giornata all'ultima. Le partite sono raggruppate per mese
 * (mesi in ordine crescente).
 *
 * Finestra ancorata alla PROSSIMA PARTITA (richiesta utente
 * 2026-08-10): la lista non parte dalla prima giornata della stagione
 * ma da poco prima della prossima gara in programma, cosi' a campionato
 * in corso non serve paginare per arrivare al match che interessa.
 * Restano visibili `PAST_CONTEXT` gare gia' giocate come contesto, e
 * due bottoni espandono la finestra all'indietro e in avanti.
 * A stagione non ancora iniziata l'ancora e' la prima partita (quindi
 * si parte dall'inizio); a stagione conclusa la finestra si aggancia
 * in fondo, sulle ultime gare disputate.
 *
 * `nowIso` arriva dal server (le pagine calendario sono renderizzate on
 * demand) invece di essere letto con Date.now() in fase di render: cosi'
 * SSR e hydration calcolano la stessa ancora e non c'e' mismatch.
 * Senza la prop il componente parte dalla prima partita, come prima.
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

/** Gare gia' giocate mostrate sopra la prossima, come contesto. */
const PAST_CONTEXT = 2;

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
 * Raggruppa per mese mantenendo l'ordine di inserimento (gia' crescente
 * perche' la lista in ingresso e' ordinata asc). Quindi mesi asc, e
 * all'interno di ogni mese le partite restano asc.
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
  /** Istante del render lato server (ISO). Ancora la finestra iniziale
   *  alla prossima partita; se assente si parte dalla prima. */
  nowIso?: string;
};

export function CalendarioFlatList({
  matches,
  ourTeamSlug,
  ourTeamName,
  showTeamBadge = false,
  enableCategoryFilter = false,
  initialCount = STEP,
  nowIso,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  // Quante partite rivelare oltre la finestra iniziale, nelle due
  // direzioni. Si azzerano al cambio di categoria.
  const [pastExtra, setPastExtra] = useState(0);
  const [futureCount, setFutureCount] = useState(initialCount);

  // Categorie distinte (teamName) per i chip filtro, ordine alfabetico.
  const categories = useMemo(() => {
    if (!enableCategoryFilter) return [];
    const set = new Set<string>();
    for (const m of matches) {
      if (isAggregated(m)) set.add(m.teamName);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
  }, [matches, enableCategoryFilter]);

  // Filtro categoria + ordinamento crescente per data.
  const sorted = useMemo(() => {
    const filtered =
      enableCategoryFilter && activeCategory !== "all"
        ? matches.filter(
            (m) => isAggregated(m) && m.teamName === activeCategory,
          )
        : matches;
    return [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [matches, activeCategory, enableCategoryFilter]);

  // Indice della prossima partita in programma. Se sono tutte giocate
  // vale sorted.length; senza `nowIso` resta 0 (si parte dall'inizio).
  const anchor = useMemo(() => {
    if (!nowIso) return 0;
    const now = new Date(nowIso).getTime();
    if (Number.isNaN(now)) return 0;
    const i = sorted.findIndex((m) => new Date(m.date).getTime() >= now);
    return i === -1 ? sorted.length : i;
  }, [sorted, nowIso]);

  // Finestra visibile [start, end).
  const { start, end } = useMemo(() => {
    const len = sorted.length;
    if (anchor >= len) {
      // Stagione conclusa: aggancio in fondo, sulle ultime disputate.
      return { start: Math.max(0, len - initialCount - pastExtra), end: len };
    }
    return {
      start: Math.max(0, anchor - PAST_CONTEXT - pastExtra),
      end: Math.min(len, anchor + futureCount),
    };
  }, [anchor, sorted.length, pastExtra, futureCount, initialCount]);

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

  const groups = groupByMonth(sorted.slice(start, end));
  const hasPast = start > 0;
  const hasMore = end < sorted.length;

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setPastExtra(0);
    setFutureCount(initialCount);
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

      {hasPast && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPastExtra((p) => p + STEP)}
            className="border-border text-ink-hi hover:border-brand-gold hover:text-brand-gold focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Partite precedenti
          </button>
        </div>
      )}

      {groups.map((g) => (
        <div key={g.key} className="flex flex-col gap-3">
          <h4 className="font-display text-ink-mid sticky top-[95px] z-10 bg-surface-0/95 -mx-1 px-1 text-lg font-bold tracking-[0.1em] uppercase backdrop-blur-md md:text-xl lg:top-[78px]">
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
            onClick={() => setFutureCount((c) => c + STEP)}
            className="border-border text-ink-hi hover:border-brand-gold hover:text-brand-gold focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Carica altre partite
          </button>
        </div>
      )}
    </div>
  );
}

