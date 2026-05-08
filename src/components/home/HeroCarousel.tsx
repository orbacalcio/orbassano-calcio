"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Carosello hero della homepage — pattern editoriale juventus.com.
 *
 * Ogni slide porta il proprio set testuale (eyebrow / headline /
 * subhead / ctaLabel + ctaLink) sincronizzato con la foto: quando
 * l'autoplay scatta sia la foto che i testi fanno il cross-fade
 * nello stesso istante. Lo stagger interno dei testi (100ms tra
 * elementi) parte all'inizio della transizione e scorre eyebrow →
 * headline → subhead → cta.
 *
 * Timing controllato dallo Studio Sanity (settings.heroX): durata
 * slide, durata transizione, autoplay on/off. La singola slide puo'
 * sovrascrivere la durata via heroSlide.customDuration (utile per
 * slide con piu' testo da leggere).
 *
 * Edge cases gestiti runtime:
 * - <=1 slide attive: autoplay disattivato (niente senso ruotare su
 *   una sola slide).
 * - settings.heroAutoplayEnabled === false: nessun timer, viene
 *   mostrata staticamente solo la prima slide.
 * - slideDuration < transitionMs: la slide cambierebbe prima che la
 *   transizione finisca. Forziamo runtime un minimum di
 *   transitionMs + 500ms.
 * - prefers-reduced-motion: niente autoplay, niente cross-fade
 *   animato (rimane solo la prima slide statica).
 */

export type HeroSlide = {
  _id: string;
  alt: string;
  image: string;
  credits: string | null;
  eyebrow: string | null;
  headline: string;
  subhead: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  customDurationS: number | null;
};

export type HeroCarouselConfig = {
  /** Durata di default di ogni slide in secondi (override per-slide via customDurationS). */
  slideDurationS: number;
  /** Durata del cross-fade in millisecondi. */
  transitionMs: number;
  /** Se false, niente autoplay: viene mostrata solo la prima slide. */
  autoplayEnabled: boolean;
};

const textWrapper: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      // 100ms di ritardo tra ogni figlio: eyebrow t=0, headline t=0.1,
      // subhead t=0.2, cta t=0.3. Se uno e' nascosto, lo stagger si
      // applica solo agli elementi effettivamente renderizzati.
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function HeroCarousel({
  slides,
  config,
}: {
  slides: HeroSlide[];
  config: HeroCarouselConfig;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const transitionS = config.transitionMs / 1000;

  // Autoplay: setTimeout per slide perche' la durata puo' variare
  // (customDurationS per slide). Quando index cambia, il useEffect
  // ri-runa e schedula il prossimo step usando la durata della
  // slide corrente.
  useEffect(() => {
    const autoplayActive =
      config.autoplayEnabled &&
      !reduced &&
      !paused &&
      slides.length > 1;
    if (!autoplayActive) return;

    const current = slides[index];
    if (!current) return;

    const baseDurationS = current.customDurationS ?? config.slideDurationS;
    // Edge case: durata troppo corta vs transizione → clamp a
    // transition + 500ms in modo che il fade abbia tempo di completarsi.
    const minDurationS = transitionS + 0.5;
    const safeDurationS = Math.max(baseDurationS, minDurationS);

    const id = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      safeDurationS * 1000,
    );
    return () => clearTimeout(id);
  }, [
    index,
    slides,
    paused,
    reduced,
    config.autoplayEnabled,
    config.slideDurationS,
    transitionS,
  ]);

  if (slides.length === 0) return null;
  const current = slides[index];
  if (!current) return null;

  const headlineLines = splitHeadline(current.headline);
  const showCta = !!(current.ctaLabel && current.ctaLink);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="off"
    >
      {/* Layer 1: foto carosello con cross-fade dinamico */}
      <AnimatePresence>
        <motion.div
          key={`img-${current._id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionS }}
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

      {/* Layer 2: gradient di leggibilita' (statico, no fade) */}
      <div
        aria-hidden
        className="from-surface-0 via-surface-0/60 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      {/* Layer 3: testo della slide, sincronizzato con la foto */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end">
        <AnimatePresence>
          <motion.div
            key={`text-${current._id}`}
            variants={textWrapper}
            initial={reduced ? "show" : "hidden"}
            animate="show"
            exit="exit"
            className="pointer-events-auto flex flex-col items-start gap-6 px-6 pb-16 sm:pb-24 lg:px-12"
          >
            {current.eyebrow && (
              <motion.span
                variants={textItem}
                className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base"
              >
                {current.eyebrow}
              </motion.span>
            )}

            <motion.h1
              variants={textItem}
              className="font-display text-ink-hi text-7xl leading-[0.92] font-black tracking-[0.005em] uppercase sm:text-8xl lg:text-[10rem]"
            >
              {headlineLines.map((line, i) => {
                const isLast = i === headlineLines.length - 1;
                const highlight = isLast && headlineLines.length >= 2;
                return (
                  <span
                    key={`${current._id}-line-${i}`}
                    className={highlight ? "text-brand-gold block" : "block"}
                  >
                    {line}
                  </span>
                );
              })}
            </motion.h1>

            {current.subhead && (
              <motion.p
                variants={textItem}
                className="text-ink-mid max-w-xl text-base leading-relaxed sm:text-lg"
              >
                {current.subhead}
              </motion.p>
            )}

            {showCta && (
              <motion.div variants={textItem}>
                <Link
                  href={current.ctaLink!}
                  className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {current.ctaLabel}
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function splitHeadline(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}
