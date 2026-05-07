"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Carosello hero della homepage.
 *
 * Spec da docs/LAYOUT_NAVIGATION.md §3:
 * - Auto-play ogni 5 secondi, crossfade 800ms
 * - Non sfogliabile, no indicatori, no controlli (broadcast non interattivo)
 * - Pausa al hover (desktop)
 * - Pausa per prefers-reduced-motion: solo prima slide
 *
 * Se le slide sono assenti (Sanity vuoto in dev), il fallback gestito dal
 * parent Hero mostra il logo + gradient brand al posto delle foto.
 */
type Slide = {
  _id: string;
  title: string;
  alt: string;
  image: string;
  credits?: string | null;
};

const INTERVAL_MS = 5000;

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || paused || slides.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [reduced, paused, slides.length]);

  if (slides.length === 0) return null;
  const current = slides[index];
  if (!current) return null;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="off"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={current.image}
            alt={current.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      {/* Gradient di leggibilita' sul testo dell'hero */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/60 to-transparent"
      />
    </div>
  );
}
