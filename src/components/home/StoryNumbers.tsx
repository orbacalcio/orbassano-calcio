"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";

/**
 * Storia in numeri — quattro contatori animati al primo ingresso
 * nel viewport. Rimpiazza la ChampionsMarquee come blocco identitario.
 *
 * Numeri (DATA_ORBASSANO §1, §2, §3, §5):
 * - 95 anni di storia (1930 → 2025)
 * - 23 atleti in prima squadra
 * - 120+ giovani nel SGS
 * - 9 partecipazioni in Serie D
 */
type Stat = {
  end: number;
  suffix?: string;
  label: string;
  caption: string;
};

const STATS: Stat[] = [
  {
    end: 95,
    label: "Anni di storia",
    caption: "Dal 1930 al campo, senza fermarsi davvero mai.",
  },
  {
    end: 23,
    label: "Atleti prima squadra",
    caption:
      "La rosa di riferimento dell'ultima stagione completa, in attesa dei nuovi tesseramenti 2026/27.",
  },
  {
    end: 120,
    suffix: "+",
    label: "Giovani nel settore",
    caption: "Quattro categorie U14-U17 più la Scuola Calcio.",
  },
  {
    end: 9,
    label: "Partecipazioni Serie D",
    caption: "Dagli anni '80 fino alle semifinali playoff 2005-07.",
  },
];

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
      // ease-out cubic
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

export function StoryNumbers() {
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
          <span className="text-brand-gold font-display text-xs font-semibold tracking-[0.3em] uppercase">
            Storia in numeri
          </span>
          <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
            Novantacinque anni di rossoblù raccontati in quattro numeri
          </h2>
        </header>

        <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-surface-2/70 flex flex-col items-start gap-3 p-8 lg:p-10"
            >
              <span className="font-display text-brand-gold text-6xl leading-none font-black tracking-[0.005em] sm:text-7xl">
                <Counter end={s.end} />
                {s.suffix}
              </span>
              <span className="font-display text-ink-hi text-lg font-bold tracking-[0.01em] uppercase">
                {s.label}
              </span>
              <span className="text-ink-mid text-sm leading-relaxed">
                {s.caption}
              </span>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
