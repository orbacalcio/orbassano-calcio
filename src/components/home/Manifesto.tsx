"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { useFirstScrollDownReveal } from "@/lib/use-first-scroll-down-reveal";

/**
 * Sezione manifesto: testo gigante con strisce verticali rossoblu' che
 * richiamano la maglia da gioco del 1930. Stesso pattern juventus.com
 * (impatto editoriale, sfondo chiaro, scan-effect) ma riadattato col
 * cromatismo del club: vertical stripes red+blue invece di linee
 * orizzontali nere.
 *
 * Tecnica:
 * - `repeating-linear-gradient(to right, ...)` come background del <h2>
 *   alterna brand-red e brand-blue a strisce di 22px (totale 44px =
 *   ~3 strisce per larghezza-glifo, proporzioni jersey)
 * - `background-clip: text` + `WebkitTextFillColor: transparent`
 *   ritaglia il pattern dentro le glifi
 *
 * Wow effect: al primo ingresso in viewport (viewport.once = true), le
 * strisce scorrono orizzontalmente dentro le lettere da -440px (10 cicli
 * di 44px) a 0 sopra 1.6s ease-out. Single play, niente loop infinito.
 * Reduced-motion: pattern statico, niente animazione.
 *
 * Sfondo cream (#F5F1E8) vintage/parchment: stesso contrasto del
 * bianco puro per far brillare il rossoblu', ma transizione meno
 * stridente col navy del resto della pagina.
 */
export function Manifesto() {
  const reduced = useReducedMotion();
  // Hook custom: reveala SOLO al primo scroll-down attraverso l'elemento.
  // Subsequent scroll-up/down sopra il manifesto NON re-triggerano
  // l'animazione delle strisce. L'effetto hover (CSS keyframe loop +
  // scale + drop-shadow) e' INDIPENDENTE da questo stato: funziona
  // sempre, anche prima del reveal.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const revealed = useFirstScrollDownReveal(titleRef, { amount: 0.4 });
  return (
    <section
      aria-labelledby="manifesto-title"
      className="bg-light-bg-0 relative overflow-hidden py-24 lg:py-32"
    >
      <Container
        size="wide"
        className="flex flex-col items-center gap-10 text-center sm:gap-12"
      >
        {/* Hover wow effect: al passaggio del mouse le strisce
            rossoblu' scorrono in loop orizzontale infinito (CSS
            keyframe `manifesto-stripes-loop` in globals.css), il
            testo fa un leggero scale-up e si tinge di un drop-shadow
            oro. L'entry animation (framer) gira una volta sola al
            primo ingresso viewport; il loop hover convive senza
            conflitti perche' modifica la stessa proprieta'
            (background-position-x) solo durante :hover. */}
        <motion.h2
          ref={titleRef}
          id="manifesto-title"
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
            // Dimensione fluida con clamp: 320px iPhone SE → 2.5rem
            // (40px, 12 char "Never give up" wrappa pulito su 1 riga),
            // 1280px desktop → ~11rem, >=1486px max 13rem.
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
          <br />
          Since 1930
        </motion.h2>

        <Link
          href="/societa/storia"
          className="bg-brand-red text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          La nostra storia
          <ArrowRight size={14} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
