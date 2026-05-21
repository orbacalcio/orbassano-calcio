"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsCategory, NewsSummary } from "@/sanity/fetchers";
import { cn } from "@/lib/cn";

/**
 * Archivio news con filtro categoria client-side. Mostra una card
 * "featured" (la prima pinned o piu' recente) sopra la griglia 2-col.
 *
 * Filtro: chip selezionabili che mantengono il conteggio per
 * categoria (UI educativa, l'utente sa cosa trova prima di cliccare).
 *
 * Vuoto stato per filtro che non matcha: messaggio + reset chip.
 */
type Props = {
  news: NewsSummary[];
};

const CATEGORIES: NewsCategory[] = [
  "Prima Squadra",
  "Settore Giovanile",
  "Scuola Calcio",
  "Società",
  "Sponsor",
];

// Quante card mostrare oltre la featured prima del "Carica altro", e
// di quante crescere ad ogni click. 9 = 3 righe piene su lg (grid-3).
const REST_STEP = 9;

export function NewsArchive({ news }: Props) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "all">(
    "all",
  );
  const [visibleRest, setVisibleRest] = useState(REST_STEP);

  // Cambiando categoria si riparte dal primo blocco (altrimenti il
  // "Carica altro" gia' espanso falserebbe il conteggio della nuova
  // categoria).
  function selectCategory(cat: NewsCategory | "all") {
    setActiveCategory(cat);
    setVisibleRest(REST_STEP);
  }

  const filtered = useMemo(() => {
    if (activeCategory === "all") return news;
    return news.filter((n) => n.category === activeCategory);
  }, [activeCategory, news]);

  const counts = useMemo(() => {
    const map = new Map<NewsCategory | "all", number>();
    map.set("all", news.length);
    for (const c of CATEGORIES) {
      map.set(c, news.filter((n) => n.category === c).length);
    }
    return map;
  }, [news]);

  if (news.length === 0) {
    return (
      <div className="border-light-border bg-light-bg-1 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <h2 className="font-display text-light-ink-hi text-2xl font-bold tracking-[0.01em] uppercase">
          Archivio in arrivo
        </h2>
        <p className="text-light-ink-mid max-w-md text-sm leading-relaxed">
          La redazione del club non ha ancora pubblicato articoli. Torna
          qui appena la stagione ricomincia.
        </p>
      </div>
    );
  }

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const visible = rest.slice(0, visibleRest);
  const hasMore = rest.length > visibleRest;

  return (
    <div className="flex flex-col gap-12">
      {/* Filtri categoria (su banda chiara: testi navy per leggibilita') */}
      <div className="flex flex-col gap-3">
        <div className="text-light-ink-mid flex items-center gap-2 text-xs">
          <Filter size={14} aria-hidden />
          <span className="font-mono tracking-[0.12em] uppercase">
            Filtra per categoria
          </span>
        </div>
        <ul className="flex flex-wrap gap-2">
          <li>
            <CategoryChip
              active={activeCategory === "all"}
              onClick={() => selectCategory("all")}
              count={counts.get("all") ?? 0}
            >
              Tutto
            </CategoryChip>
          </li>
          {CATEGORIES.map((c) => {
            const count = counts.get(c) ?? 0;
            if (count === 0) return null;
            return (
              <li key={c}>
                <CategoryChip
                  active={activeCategory === c}
                  onClick={() => selectCategory(c)}
                  count={count}
                >
                  {c}
                </CategoryChip>
              </li>
            );
          })}
        </ul>
      </div>

      {filtered.length === 0 ? (
        <div className="border-light-border bg-light-bg-1 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
          <p className="text-light-ink-mid text-sm">
            Nessun articolo per questa categoria.
          </p>
          <button
            type="button"
            onClick={() => selectCategory("all")}
            className="text-brand-gold hover:text-light-ink-hi text-sm font-semibold underline-offset-2 hover:underline"
          >
            Mostra tutto
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {featured && (
            <NewsCard news={featured} variant="featured" />
          )}
          {visible.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((n) => (
                <NewsCard key={n._id} news={n} />
              ))}
            </div>
          )}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleRest((c) => c + REST_STEP)}
                className="border-light-border text-light-ink-hi hover:border-brand-gold hover:text-brand-gold focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-6 py-3 font-display text-sm font-bold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Carica altre news
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border-light-border focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
        active
          ? "border-brand-gold bg-brand-gold text-surface-0"
          : "text-light-ink-mid hover:border-brand-gold/50 hover:text-light-ink-hi",
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "font-mono text-[10px]",
          active ? "text-surface-0/70" : "text-light-ink-low",
        )}
      >
        {count}
      </span>
    </button>
  );
}
