"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Carosello hero — coreografia cinematografica stile juventus.com.
 *
 * Sequenza di transizione (timing in ms; tutti scalati dal
 * moltiplicatore = transitionMs / 300):
 *   t=0     exit testi vecchi         (200ms, fade + y +8)
 *   t=200   exit immagine vecchia     (300ms, fade)
 *   t=200   enter immagine nuova      (500ms, fade + scale 1.05→1.0 easeOut)
 *   t=600   enter eyebrow             (220ms, clip-path reveal da sx)
 *   t=600+220+200=1020 underline gold (400ms, scaleX 0→1 origin left)
 *   t=800   enter headline (riga per riga, stagger 80ms, clip-path)
 *   t=1100  enter subhead             (300ms, fade + y +12 → 0)
 *   t=1300  enter CTA                 (250ms, fade + y +8 + scale 0.96→1, back)
 *   ultima riga headline glow oro     (600ms, fade in/out di text-shadow)
 *   CTA primaria pulse                (800ms, scale 1→1.02→1, una volta)
 *
 * Ken Burns: la foto, dopo l'enter, fa scale 1 → 1.08 lineare per
 * tutta la durata della slide. Slide dispari traslate +1% verso
 * destra, pari restano centrali — evita ripetitività. Skip su mobile
 * (CPU saver) e su prefers-reduced-motion.
 *
 * Anti-sfarfallio:
 *  - 2 AnimatePresence separate: immagine senza mode (overlap
 *    cross-fade), testi con mode="wait" (sequential, no overlap).
 *  - Stato isTransitioning -> classe will-change attiva solo
 *    durante l'animazione, rimossa al termine (no transform layer
 *    permanente, no compositing waste).
 *  - min-h-[40vh] sul layer testuale -> riserva spazio, no layout
 *    shift quando le slide hanno headline di lunghezza diversa.
 *
 * Reduced motion: hard fade 150ms, niente Ken Burns / clip-path /
 * glow / pulse CTA. La pagina resta utilizzabile e prevedibile.
 */

export type HeroSlide = {
  _id: string;
  alt: string;
  image: string;
  imageLqip: string | null;
  credits: string | null;
  eyebrow: string | null;
  headline: string;
  subhead: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  customDurationS: number | null;
};

export type HeroCarouselConfig = {
  slideDurationS: number;
  transitionMs: number;
  autoplayEnabled: boolean;
};

const BASE_TRANSITION_MS = 300;

// Cubic-bezier presets — Framer Motion accetta array [x1,y1,x2,y2].
const EASE_OUT_CUBIC: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
const EASE_OUT_QUART: [number, number, number, number] = [0.165, 0.84, 0.44, 1];
const EASE_BACK_OUT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// Coreografia totale ms (da exit-to-enter-CTA-end, base x1):
// ultimo step = enter CTA delay 1300 + duration 250 = 1550ms
const CHOREO_TOTAL_MS = 1550;

export function HeroCarousel({
  slides,
  config,
}: {
  slides: HeroSlide[];
  config: HeroCarouselConfig;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile via matchMedia (no SSR mismatch: initial state false,
  // promote a true al primo paint client se serve).
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const mult = Math.max(0.3, config.transitionMs / BASE_TRANSITION_MS);
  const transitionS = config.transitionMs / 1000;
  const kenBurnsContinuous = !reduced && !isMobile;

  // Autoplay: setTimeout per slide perche' la durata puo' variare.
  useEffect(() => {
    const autoplayActive =
      config.autoplayEnabled && !reduced && !paused && slides.length > 1;
    if (!autoplayActive) return;

    const current = slides[index];
    if (!current) return;

    const baseDurationS = current.customDurationS ?? config.slideDurationS;
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

  // isTransitioning gating: attivo durante la coreografia, spento al termine.
  // Usato per will-change dinamico — niente compositing layer permanente.
  // Il setState e' wrappato in rAF per evitare cascading renders sincroni
  // (regola react-hooks/set-state-in-effect).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsTransitioning(true));
    const totalMs = reduced ? 200 : CHOREO_TOTAL_MS * mult;
    const id = setTimeout(() => setIsTransitioning(false), totalMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [index, mult, reduced]);

  if (slides.length === 0) return null;
  const current = slides[index];
  if (!current) return null;

  // Navigazione manuale (swipe + dot): normalizza l'indice in [0, n).
  const goTo = (i: number) =>
    setIndex(((i % slides.length) + slides.length) % slides.length);

  const headlineLines = splitHeadline(current.headline);
  const showCta = !!(current.ctaLabel && current.ctaLink);
  const isOddSlide = index % 2 === 1;

  // Durata lineare Ken Burns: dalla fine dell'enter scale (500ms) fino
  // a 300ms prima del prossimo cross-fade (cosi' lo zoom non viene
  // troncato bruscamente).
  const slideTotalS = current.customDurationS ?? config.slideDurationS;
  const enterScaleS = 0.5 * mult;
  const exitReserveS = transitionS + 0.3;
  const kenBurnsDurS = Math.max(0.6, slideTotalS - enterScaleS - exitReserveS);
  const totalImageAnimS = enterScaleS + kenBurnsDurS;

  return (
    <motion.div
      className={cn(
        "absolute inset-0",
        isTransitioning && "[&_*]:will-change-transform",
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Swipe orizzontale su touch: onPanEnd NON muove il layer (il
      // carosello e' in cross-fade, non a slittamento) e NON blocca lo
      // scroll verticale della pagina. Soglia 50px + dominanza
      // orizzontale per non scattare durante uno scroll verticale.
      onPanEnd={(_event, info: PanInfo) => {
        if (slides.length < 2) return;
        if (
          Math.abs(info.offset.x) < 50 ||
          Math.abs(info.offset.x) <= Math.abs(info.offset.y)
        )
          return;
        goTo(info.offset.x < 0 ? index + 1 : index - 1);
      }}
      aria-live="off"
    >
      {/* Layer 1: foto carosello con cross-fade overlap + Ken Burns. */}
      <AnimatePresence>
        <motion.div
          key={`img-${current._id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduced
              ? { duration: 0.15 }
              : {
                  // Enter immagine: ritardato di 200ms × mult (mentre i
                  // testi vecchi escono). Durata 500ms × mult.
                  delay: 0.2 * mult,
                  duration: 0.5 * mult,
                  ease: EASE_OUT_CUBIC,
                }
          }
          className="absolute inset-0"
        >
          {/* Inner motion: gestisce scale enter + Ken Burns continuo. */}
          <motion.div
            initial={{ scale: reduced ? 1 : 1.05, x: "0%" }}
            animate={
              reduced
                ? { scale: 1, x: "0%" }
                : kenBurnsContinuous
                  ? {
                      scale: [1.05, 1.0, 1.08],
                      x: ["0%", "0%", isOddSlide ? "1%" : "0%"],
                    }
                  : { scale: [1.05, 1.0] }
            }
            transition={
              reduced
                ? { duration: 0.15 }
                : kenBurnsContinuous
                  ? {
                      scale: {
                        duration: totalImageAnimS,
                        times: [0, enterScaleS / totalImageAnimS, 1],
                        ease: ["easeOut", "linear"],
                      },
                      x: {
                        duration: totalImageAnimS,
                        ease: "linear",
                      },
                    }
                  : {
                      duration: enterScaleS,
                      ease: EASE_OUT_CUBIC,
                    }
            }
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt={current.alt}
              fill
              sizes="100vw"
              priority={index === 0}
              placeholder={current.imageLqip ? "blur" : "empty"}
              blurDataURL={current.imageLqip ?? undefined}
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Layer 2a: tint blu uniforme full-cover. Scurisce leggermente
          la foto e tinge col brand quando la sorgente e' molto chiara
          (cielo, divise bianche, esultanze in primo piano) — i testi
          dell'hero restano leggibili senza dover dipendere dal solo
          gradient bottom-up. */}
      <div
        aria-hidden
        className="bg-brand-blue/25 absolute inset-0"
      />

      {/* Layer 2b: gradient di leggibilita' bottom-up (statico, no fade).
          Rinforza il dark sotto, dove vivono headline + subhead + CTA. */}
      <div
        aria-hidden
        className="from-surface-0 via-surface-0/60 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      {/* Layer 3: testo della slide — mode="wait" (no overlap).
          Centrato verticalmente nel viewport hero: il flex-col del
          parent absolute usa justify-center, e l'inner div lascia
          gap-6 + padding simmetrico per respirare. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current._id}`}
            initial="hidden"
            animate="show"
            exit="exit"
            // hero-slide-text: classe-marker per la CSS rule in
            // globals.css che compensa il padding-left del main
            // durante la transizione past-hero. Cosi' il testo non
            // scivola a sinistra quando le sidebar si ritirano —
            // testo+CTA restano fermi al loro X di partenza.
            className="hero-slide-text pointer-events-auto flex flex-col items-start justify-center gap-6 px-6 py-12 sm:py-16 lg:px-12"
          >
            {current.eyebrow && (
              <EyebrowBlock
                text={current.eyebrow}
                mult={mult}
                reduced={!!reduced}
              />
            )}

            <HeadlineBlock
              lines={headlineLines}
              slideId={current._id}
              mult={mult}
              reduced={!!reduced}
            />

            {current.subhead && (
              <motion.p
                variants={makeSubheadVariants(mult, !!reduced)}
                className="text-ink-mid max-w-xl text-base leading-relaxed sm:text-lg"
              >
                {current.subhead}
              </motion.p>
            )}

            {showCta && (
              <CtaBlock
                label={current.ctaLabel!}
                href={current.ctaLink!}
                mult={mult}
                reduced={!!reduced}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicatori slide (pallini) — tappabili, hit-area 44px (h-11).
          Solo con piu' di una slide: su touch sono l'unico modo per
          capire che il carosello ha piu' immagini e saltare a una. */}
      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center gap-1 md:bottom-6">
          {slides.map((s, i) => {
            const isActive = i === index;
            return (
              <button
                key={`dot-${s._id}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Vai alla slide ${i + 1} di ${slides.length}`}
                aria-current={isActive ? "true" : undefined}
                className="focus-visible:outline-brand-gold pointer-events-auto flex h-11 w-6 items-center justify-center focus-visible:outline-2"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-brand-gold w-6" : "bg-ink-hi/40 w-1.5",
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ---------- Sotto-componenti animati ----------------------------------------

function EyebrowBlock({
  text,
  mult,
  reduced,
}: {
  text: string;
  mult: number;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <motion.span
        variants={makeReducedFadeVariants()}
        className="font-display text-[#FFD580] text-sm font-bold tracking-[0.2em] uppercase md:text-base"
      >
        {text}
      </motion.span>
    );
  }
  return (
    <motion.span
      variants={makeEyebrowVariants(mult)}
      className="font-display relative inline-block overflow-hidden text-[#FFD580] text-sm font-bold tracking-[0.2em] uppercase md:text-base"
    >
      <span className="block">{text}</span>
      <motion.span
        aria-hidden
        className="mt-1 block h-px w-full origin-left bg-[#FFD580]"
        variants={makeEyebrowUnderlineVariants(mult)}
      />
    </motion.span>
  );
}

function HeadlineBlock({
  lines,
  slideId,
  mult,
  reduced,
}: {
  lines: string[];
  slideId: string;
  mult: number;
  reduced: boolean;
}) {
  return (
    <motion.h1
      variants={makeWrapperVariants()}
      className="font-display text-ink-hi text-[clamp(3.5rem,8vw,9rem)] leading-[0.92] font-black tracking-[0.005em] uppercase"
    >
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        const highlight = isLast && lines.length >= 2;
        return (
          <motion.span
            key={`${slideId}-line-${i}`}
            variants={makeHeadlineLineVariants(i, mult, reduced)}
            className={cn(
              "block",
              highlight && "text-brand-gold",
              !reduced && "overflow-hidden",
            )}
          >
            <motion.span
              className="block"
              variants={
                highlight && !reduced
                  ? makeHeadlineGoldGlowVariants(i, mult)
                  : undefined
              }
            >
              {line}
            </motion.span>
          </motion.span>
        );
      })}
    </motion.h1>
  );
}

function CtaBlock({
  label,
  href,
  mult,
  reduced,
}: {
  label: string;
  href: string;
  mult: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      variants={reduced ? makeReducedFadeVariants() : makeCtaVariants(mult)}
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : { scale: [1, 1.02, 1] }
        }
        transition={
          reduced
            ? undefined
            : {
                duration: 0.8 * mult,
                delay: (1.3 + 0.25) * mult,
                times: [0, 0.5, 1],
                ease: EASE_OUT_CUBIC,
              }
        }
      >
        <Link
          href={href}
          className="bg-brand-red btn-wow-sweep text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {label}
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ---------- Variants factories ----------------------------------------------

function makeWrapperVariants(): Variants {
  return {
    hidden: {},
    show: {},
    exit: {},
  };
}

function makeReducedFadeVariants(): Variants {
  return {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };
}

function makeEyebrowVariants(mult: number): Variants {
  return {
    hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
    show: {
      clipPath: "inset(0 0 0 0)",
      opacity: 1,
      transition: {
        duration: 0.22 * mult,
        delay: 0.6 * mult,
        ease: EASE_OUT_QUART,
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.2 * mult, ease: EASE_OUT_CUBIC },
    },
  };
}

function makeEyebrowUnderlineVariants(mult: number): Variants {
  return {
    hidden: { scaleX: 0, transformOrigin: "left" },
    show: {
      scaleX: 1,
      transition: {
        duration: 0.4 * mult,
        delay: (0.6 + 0.22 + 0.2) * mult,
        ease: EASE_OUT_QUART,
      },
    },
    exit: {
      scaleX: 0,
      transformOrigin: "right",
      transition: { duration: 0.2 * mult, ease: EASE_OUT_CUBIC },
    },
  };
}

function makeHeadlineLineVariants(
  lineIndex: number,
  mult: number,
  reduced: boolean,
): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { duration: 0.2, delay: 0.05 * lineIndex },
      },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }
  return {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    show: {
      clipPath: "inset(0 0 0 0)",
      transition: {
        duration: 0.35 * mult,
        delay: (0.8 + lineIndex * 0.08) * mult,
        ease: EASE_OUT_QUART,
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.2 * mult, ease: EASE_OUT_CUBIC },
    },
  };
}

function makeHeadlineGoldGlowVariants(
  lineIndex: number,
  mult: number,
): Variants {
  // Pulse glow oro sull'ultima riga (highlight) per i primi 600ms × mult
  // dopo che la riga e' apparsa. Suggerisce "questa e' la parola chiave".
  return {
    hidden: { textShadow: "0 0 0px rgba(223, 177, 108, 0)" },
    show: {
      textShadow: [
        "0 0 0px rgba(223, 177, 108, 0)",
        "0 0 20px rgba(223, 177, 108, 0.3)",
        "0 0 0px rgba(223, 177, 108, 0)",
      ],
      transition: {
        duration: 0.6 * mult,
        delay: (0.8 + lineIndex * 0.08 + 0.35) * mult,
        times: [0, 0.5, 1],
      },
    },
    exit: { textShadow: "0 0 0px rgba(223, 177, 108, 0)" },
  };
}

function makeSubheadVariants(mult: number, reduced: boolean): Variants {
  if (reduced) return makeReducedFadeVariants();
  return {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3 * mult,
        delay: 1.1 * mult,
        ease: EASE_OUT_CUBIC,
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.2 * mult, ease: EASE_OUT_CUBIC },
    },
  };
}

function makeCtaVariants(mult: number): Variants {
  return {
    hidden: { opacity: 0, y: 8, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25 * mult,
        delay: 1.3 * mult,
        ease: EASE_BACK_OUT,
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.2 * mult, ease: EASE_OUT_CUBIC },
    },
  };
}

// ---------- Helpers ---------------------------------------------------------

function splitHeadline(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}
