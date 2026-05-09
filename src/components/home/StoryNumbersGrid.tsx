"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
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
  const inView = useInView(ref, { once: true, amount: 0.6 });
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

export function StoryNumbersGrid({ eyebrow, title, items }: Props) {
  return (
    <section
      aria-label="Storia del club in numeri"
      className="bg-surface-1 border-border/50 relative overflow-hidden border-y py-20"
    >
      <div
        aria-hidden
        className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
      />
      <Container className="relative" size="wide">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            {eyebrow}
          </span>
          <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
            {title}
          </h2>
        </header>

        <ul className={`mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl ${gridColsClass(items.length)}`}>
          {items.map((s, i) => (
            <motion.li
              key={`${s.label}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-surface-2/70 flex flex-col items-start gap-3 p-8 lg:p-10"
            >
              <span className="font-display text-brand-gold flex items-baseline gap-1 text-6xl leading-none font-black tracking-[0.005em] sm:text-7xl">
                {s.prefix && (
                  <span className="text-4xl sm:text-5xl">{s.prefix}</span>
                )}
                <Counter end={s.value} />
                {s.suffix && (
                  <span className="text-4xl sm:text-5xl">{s.suffix}</span>
                )}
              </span>
              <span className="font-display text-ink-hi text-lg font-bold tracking-[0.01em] uppercase">
                {s.label}
              </span>
              {s.caption && (
                <span className="text-ink-mid text-sm leading-relaxed">
                  {s.caption}
                </span>
              )}
            </motion.li>
          ))}
        </ul>
      </Container>
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
