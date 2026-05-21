"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { useFirstScrollDownReveal } from "@/lib/use-first-scroll-down-reveal";
import type { StoryNumberItem } from "@/sanity/fetchers";

/**
 * Renderer client di "Storia in numeri": riceve i dati gia' fetchati
 * dal parent server e si occupa solo di animare i counter al primo
 * ingresso nel viewport.
 *
 * prefers-reduced-motion: il counter parte gia' al valore finale,
 * niente conteggio progressivo.
 */
type Props = {
  eyebrow: string;
  title: string;
  items: StoryNumberItem[];
};

function Counter({ end }: { end: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Reveala SOLO al primo scroll-down attraverso l'elemento. Scroll-up
  // o re-entry successivi non re-triggerano il conteggio.
  const inView = useFirstScrollDownReveal(ref, { amount: 0.6 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? end : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * end));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, end]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

export function StoryNumbersGrid({ items }: Props) {
  // Single hook a livello di grid: tutte le tile rivelano insieme al
  // primo scroll-down attraverso la grid. Niente re-trigger su
  // scroll-up/down successivi.
  const gridRef = useRef<HTMLUListElement>(null);
  const gridRevealed = useFirstScrollDownReveal(gridRef, { amount: 0.4 });
  return (
    <section
      aria-label="Storia del club in numeri"
      className="bg-light-bg-0 relative overflow-hidden py-10 sm:py-14 lg:py-20"
    >
      {/* Banda navy full-wide che incornicia il gruppo numeri: si
          estende dai limiti pagina e contiene le 4 tile centrate.
          Stesso navy delle tile (bg-surface-2) per continuita': i
          lati e il box sono uniformi, separati solo dai gap-px tra
          le tile. */}
      <div className="bg-surface-2 relative">
        <Container className="relative" size="wide">
          <ul
            ref={gridRef}
            className={`grid grid-cols-2 gap-px overflow-hidden bg-border/60 ${gridColsClass(items.length)}`}
          >
            {items.map((s, i) => (
              <motion.li
                key={`${s.label}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                animate={gridRevealed ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-surface-2 flex flex-col items-start gap-3 p-5 sm:p-7 lg:p-10"
              >
                {/* Su mobile (320–375px) con grid 2 colonne, il numero
                    deve restare contenuto: numeri a 4 cifre tipo "1930"
                    a text-6xl overflow-erebbero. Scaling text-4xl → 6xl. */}
                <span className="font-display text-brand-gold flex items-baseline gap-1 text-4xl leading-none font-black tracking-[0.005em] sm:text-5xl lg:text-6xl">
                  {s.prefix && (
                    <span className="text-2xl sm:text-3xl lg:text-4xl">
                      {s.prefix}
                    </span>
                  )}
                  <Counter end={s.value} />
                  {s.suffix && (
                    <span className="text-2xl sm:text-3xl lg:text-4xl">
                      {s.suffix}
                    </span>
                  )}
                </span>
                <span className="font-display text-ink-hi text-sm font-bold tracking-[0.01em] uppercase sm:text-base lg:text-lg">
                  {s.label}
                </span>
                {s.caption && (
                  <span className="text-ink-mid text-xs leading-relaxed sm:text-sm">
                    {s.caption}
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}

/**
 * Adatta il numero di colonne al numero di voci CMS-driven. 4 voci e'
 * il caso target ma l'admin puo' inserirne 3 o 6 senza che il layout
 * vada in segmenti orfani.
 */
function gridColsClass(n: number): string {
  if (n <= 1) return "lg:grid-cols-1";
  if (n === 2) return "lg:grid-cols-2";
  if (n === 3) return "lg:grid-cols-3";
  if (n === 4) return "lg:grid-cols-4";
  if (n === 5) return "lg:grid-cols-5";
  return "lg:grid-cols-6";
}
