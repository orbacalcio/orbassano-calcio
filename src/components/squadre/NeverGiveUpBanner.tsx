"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { useFirstScrollDownReveal } from "@/lib/use-first-scroll-down-reveal";

/**
 * Banner "NEVER GIVE UP / SINCE 1930" con strisce rossoblu' come fill
 * del testo + hover wow effect. Variante navy del Manifesto home
 * pensata come stacco tra hero scuro e bande chiare delle hub
 * (/squadre, /societa, /calendario).
 *
 * Tecnica:
 * - `repeating-linear-gradient` rossoblu' applicato come background
 *   delle glifi via `background-clip: text`. Pattern visivo identico
 *   al Manifesto home, qui senza CTA per non competere con le
 *   sezioni navigation sotto.
 * - Entry: strisce slidano da -440px a 0 al primo scroll-down
 *   (useFirstScrollDownReveal). reduced-motion → statico.
 * - Hover: loop infinito strisce + scale 1.02 + drop-shadow oro,
 *   CSS keyframe `manifesto-stripes-loop` in globals.css.
 *
 * Sfondo: bg-surface-0 (continuazione hero) con border-y per
 * separazione dal banda chiara delle card sotto.
 */
export function NeverGiveUpBanner() {
  const reduced = useReducedMotion();
  const titleRef = useRef<HTMLParagraphElement>(null);
  const revealed = useFirstScrollDownReveal(titleRef, { amount: 0.4 });
  return (
    <section
      aria-label="Lo spirito Orbassano"
      className="bg-surface-0 relative overflow-hidden py-14 sm:py-20 lg:py-28"
    >
      {/* Blob radiale blu identico a quello del hero /squadre,
          posizionato al TOP del banner per estendere visivamente
          l'aurora del hero dentro al banner: niente "edge" visibile
          tra le due sezioni, transizione fluida. Mirror-image del
          blob hero per simmetria, posizionato al bottom (-translate
          y-1/2 sotto top-0 = blob centrato leggermente sopra il top
          del banner). */}
      <div
        aria-hidden
        className="bg-brand-blue/15 pointer-events-none absolute top-0 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
      />
      <Container size="wide" className="relative flex flex-col items-center text-center">
        <motion.p
          ref={titleRef}
          className="font-display cursor-default leading-[0.9] font-black tracking-[0.005em] uppercase transition-transform duration-300 ease-out hover:scale-[1.02] hover:[animation:manifesto-stripes-loop_1.4s_linear_infinite] hover:[filter:drop-shadow(0_0_40px_rgba(223,177,108,0.85))]"
          initial={reduced ? false : { backgroundPositionX: "-440px" }}
          animate={
            revealed || reduced ? { backgroundPositionX: "0px" } : undefined
          }
          transition={{
            duration: 1.6,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          style={{
            fontSize: "clamp(2.5rem, 12vw, 13rem)",
            backgroundImage:
              "repeating-linear-gradient(to right, #e91f22 0, #e91f22 22px, #213f8c 22px, #213f8c 44px)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          Never give up
        </motion.p>
      </Container>
    </section>
  );
}
