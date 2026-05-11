"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import {
  BookOpen,
  ExternalLink,
  Handshake,
  RefreshCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
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
 * Filtri categoria RIMOSSI su richiesta utente (poca utilita' su una
 * timeline corta, aggiungeva rumore visivo). Le icone categoria
 * restano sulle singole card.
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

/**
 * Icona tematica per ogni categoria. Lucide React (gia' nel bundle del
 * progetto) — niente SVG custom da mantenere. Tutte stessa dimensione +
 * stroke uniforme per coerenza visiva.
 *
 *   Fondazione    → Sparkles    (inizio, scintilla)
 *   Promozione    → TrendingUp  (salire di categoria)
 *   Retrocessione → TrendingDown (scendere di categoria)
 *   Trofeo        → Trophy
 *   Fusione       → Handshake
 *   Rifondazione  → RefreshCcw  (ripartenza, ciclo)
 *   Storico       → BookOpen    (annale, cronaca)
 */
const CATEGORY_ICONS: Record<TimelineCategory, LucideIcon> = {
  Fondazione: Sparkles,
  Promozione: TrendingUp,
  Retrocessione: TrendingDown,
  Trofeo: Trophy,
  Fusione: Handshake,
  Rifondazione: RefreshCcw,
  Storico: BookOpen,
};

const eventVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const VIEWPORT_OPTIONS = { once: true, amount: 0.05 } as const;

export function Timeline({ events }: Props) {
  const reduced = useReducedMotion();

  if (events.length === 0) {
    return (
      <p className="text-ink-mid border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center text-base">
        La timeline non &egrave; ancora popolata. Controlla che il CMS contenga
        eventi storici e i webhook revalidate siano attivi.
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-10">
      {/* Linea verticale: posizione mobile sinistra, desktop centrata */}
      <div
        aria-hidden
        className="border-border/60 absolute top-0 bottom-0 left-3 border-l lg:left-1/2 lg:-translate-x-1/2"
      />

      {events.map((event, i) => {
        const side = i % 2 === 0 ? "left" : "right";
        const variants = reduced ? undefined : eventVariants;
        const Icon = event.category ? CATEGORY_ICONS[event.category] : null;
        return (
          <motion.li
            key={event._id}
            className={cn(
              "relative flex items-start gap-6 lg:gap-12",
              side === "left" ? "lg:flex-row" : "lg:flex-row-reverse",
            )}
            variants={variants}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={VIEWPORT_OPTIONS}
          >
            {/* Pallino sulla linea */}
            <div
              aria-hidden
              className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2"
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
                    "font-display leading-none font-black tracking-[0.005em]",
                    // Periodo (year - yearEnd) ha rendering piu' compatto
                    // per accomodare la stringa estesa "1985 - 1992".
                    event.yearEnd
                      ? "text-2xl sm:text-3xl"
                      : "text-3xl sm:text-4xl",
                    event.isHighlight ? "text-brand-gold" : "text-ink-hi",
                  )}
                >
                  {event.yearEnd
                    ? `${event.year} – ${event.yearEnd}`
                    : event.year}
                </span>
                {event.category && (
                  <span className="border-border/60 text-ink-mid font-mono inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] tracking-[0.15em] uppercase">
                    {Icon && <Icon size={12} aria-hidden />}
                    {event.category}
                  </span>
                )}
              </div>
              {event.season && (
                <span className="text-ink-low font-mono text-xs tracking-wide">
                  Stagione {event.season}
                </span>
              )}
              {event.image && (
                <div className="border-border/40 relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-surface-2">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 70vw, 100vw"
                    className="object-cover"
                    placeholder={event.imageLqip ? "blur" : "empty"}
                    blurDataURL={event.imageLqip ?? undefined}
                  />
                </div>
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
              {event.externalLink && (
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold hover:text-brand-white focus-visible:outline-brand-gold mt-1 inline-flex items-center gap-1.5 self-start text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  Approfondisci
                  <ExternalLink size={12} aria-hidden />
                </a>
              )}
            </article>
          </motion.li>
        );
      })}
    </ol>
  );
}
