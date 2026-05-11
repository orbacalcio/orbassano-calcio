"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import type {
  TimelineCategory,
  TimelineEvent,
} from "@/sanity/fetchers";
import { cn } from "@/lib/cn";

/**
 * Timeline interattiva della storia del club. Layout verticale a "spina
 * dorsale" con eventi alternati left/right su desktop, stack su mobile.
 *
 * Filtri categoria (chip click): mostrano solo gli eventi che matchano
 * la categoria selezionata, manteniendo invariato l'ordine cronologico.
 *
 * Animazione: fadeInUp staggered con `whileInView` sul singolo nodo
 * (il "puntino" oro che si attacca alla linea verticale anima per
 * primo, poi il contenuto adiacente).
 *
 * Prefers-reduced-motion → render statico, niente transizioni.
 */
type Props = {
  events: TimelineEvent[];
};

const CATEGORIES: TimelineCategory[] = [
  "Fondazione",
  "Promozione",
  "Trofeo",
  "Fusione",
  "Rifondazione",
  "Storico",
];

const eventVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
  },
};

// Trigger ad ingresso pagina (amount: 0.05 invece di 0.4): l'animazione
// scatta non appena il 5% dell'elemento entra in viewport. Con amount
// 0.4 + card alte come quelle della timeline, l'IntersectionObserver
// non scattava mai sui contenuti "lunghi" e gli eventi restavano
// opacity 0 — pagina vuota a video.
const VIEWPORT_OPTIONS = { once: true, amount: 0.05 } as const;

export function Timeline({ events }: Props) {
  const reduced = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<
    TimelineCategory | "all"
  >("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return events;
    return events.filter((e) => e.category === activeCategory);
  }, [activeCategory, events]);

  const counts = useMemo(() => {
    const map = new Map<TimelineCategory | "all", number>();
    map.set("all", events.length);
    for (const c of CATEGORIES) {
      map.set(c, events.filter((e) => e.category === c).length);
    }
    return map;
  }, [events]);

  if (events.length === 0) {
    return (
      <p className="text-ink-mid border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center text-base">
        La timeline non &egrave; ancora popolata. Controlla che il CMS contenga
        eventi storici e i webhook revalidate siano attivi.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Filtri categoria */}
      <div className="flex flex-col gap-3">
        <div className="text-ink-mid flex items-center gap-2 text-xs">
          <Filter size={14} aria-hidden />
          <span className="font-mono tracking-[0.12em] uppercase">
            Filtra per categoria
          </span>
        </div>
        <ul className="flex flex-wrap gap-2">
          <li>
            <CategoryChip
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
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
                  onClick={() => setActiveCategory(c)}
                  count={count}
                >
                  {c}
                </CategoryChip>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Spina + eventi */}
      <ol className="relative flex flex-col gap-10">
        {/* Linea verticale: posizione mobile sinistra, desktop centrata */}
        <div
          aria-hidden
          className="border-border/60 absolute top-0 bottom-0 left-3 border-l lg:left-1/2 lg:-translate-x-1/2"
        />

        {filtered.map((event, i) => {
          const side = i % 2 === 0 ? "left" : "right";
          const variants = reduced ? undefined : eventVariants;
          return (
            <motion.li
              key={event._id}
              className={cn(
                "relative flex items-start gap-6 lg:gap-12",
                side === "left"
                  ? "lg:flex-row"
                  : "lg:flex-row-reverse",
              )}
              variants={variants}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "show"}
              viewport={VIEWPORT_OPTIONS}
            >
              {/* Pallino sulla linea */}
              <div
                aria-hidden
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2",
                  event.isHighlight ? "" : "",
                )}
              >
                <span
                  className={cn(
                    "block h-3 w-3 rounded-full",
                    event.isHighlight
                      ? "bg-brand-gold ring-brand-gold/30 ring-4"
                      : "bg-brand-blue ring-surface-1 ring-4",
                  )}
                />
              </div>

              {/* Card contenuto */}
              <article
                className={cn(
                  "border-border bg-surface-1 hover:border-brand-gold/30 flex w-full flex-col gap-3 rounded-2xl border p-6 transition-colors lg:w-[calc(50%-3rem)]",
                  event.isHighlight ? "border-brand-gold/30" : "",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      "font-display text-3xl leading-none font-black tracking-[0.005em] sm:text-4xl",
                      event.isHighlight
                        ? "text-brand-gold"
                        : "text-ink-hi",
                    )}
                  >
                    {event.year}
                  </span>
                  {event.category && (
                    <span className="border-border/60 text-ink-mid font-mono inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[10px] tracking-[0.15em] uppercase">
                      {event.category}
                    </span>
                  )}
                </div>
                {event.season && (
                  <span className="text-ink-low font-mono text-xs tracking-wide">
                    Stagione {event.season}
                  </span>
                )}
                <h3 className="font-display text-ink-hi text-xl leading-tight font-bold tracking-[0.005em]">
                  {event.title}
                </h3>
                {event.description && (
                  <PortableTextBody
                    value={event.description}
                    className="text-ink-mid text-sm"
                  />
                )}
              </article>
            </motion.li>
          );
        })}
      </ol>
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
        "border-border focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
        active
          ? "border-brand-gold bg-brand-gold text-surface-0"
          : "text-ink-mid hover:border-brand-gold/50 hover:text-ink-hi",
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "font-mono text-[10px]",
          active ? "text-surface-0/70" : "text-ink-low",
        )}
      >
        {count}
      </span>
    </button>
  );
}
