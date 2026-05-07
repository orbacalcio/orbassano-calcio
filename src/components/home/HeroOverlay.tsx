"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

/**
 * Testo dell'hero homepage. Bottom-left, stagger fade-in dei figli.
 * NON cambia con la slide: il carosello e' "atmosfera", non editoriale.
 */
type Props = {
  season: string;
  league: string;
  group: string;
};

const wrapper: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function HeroOverlay({ season, league, group }: Props) {
  const reduced = useReducedMotion();
  const initial = reduced ? "show" : "hidden";

  // Compongo l'eyebrow filtrando i pezzi vuoti: il girone (es. "B")
  // viene aggiunto solo quando popolato dal CMS, altrimenti l'eyebrow
  // mostra solo "Stagione · Categoria" senza separatore vuoto.
  const eyebrow = [
    season ? `Stagione ${season}` : null,
    league || null,
    group ? `Girone ${group}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      variants={wrapper}
      initial={initial}
      animate="show"
      className="relative flex flex-col items-start gap-6 px-6 pb-16 sm:pb-24 lg:px-12"
    >
      <motion.span
        variants={item}
        className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base"
      >
        {eyebrow}
      </motion.span>
      <motion.h1
        variants={item}
        className="font-display text-ink-hi text-7xl leading-[0.92] font-black tracking-[0.005em] uppercase sm:text-8xl lg:text-[10rem]"
      >
        Dal 1930
        <br />
        il calcio di
        <br />
        <span className="text-brand-gold">Orbassano</span>
      </motion.h1>
      <motion.p
        variants={item}
        className="text-ink-mid max-w-xl text-base leading-relaxed sm:text-lg"
      >
        Novantacinque anni di rossoblù. Una storia di promozioni, fusioni,
        rinascite e di campioni che si sono allenati sui nostri campi.
      </motion.p>
      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <Link
          href="/societa/storia"
          className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Scopri la storia
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/5x1000"
          className="border-brand-gold/40 text-brand-gold font-display hover:bg-brand-gold/10 focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Heart size={16} />
          Sostieni con il 5×1000
        </Link>
      </motion.div>
    </motion.div>
  );
}
