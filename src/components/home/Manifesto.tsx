"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";

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
  return (
    <section
      aria-labelledby="manifesto-title"
      className="relative overflow-hidden bg-[#F5F1E8] py-24 lg:py-32"
    >
      <Container
        size="wide"
        className="flex flex-col items-center gap-10 text-center sm:gap-12"
      >
        <motion.h2
          id="manifesto-title"
          className="font-display leading-[0.9] font-black tracking-[0.005em] uppercase"
          initial={reduced ? false : { backgroundPositionX: "-440px" }}
          whileInView={{ backgroundPositionX: "0px" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 1.6,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          style={{
            // Dimensione fluida con clamp: 320px iPhone SE → 3rem,
            // 1280px desktop → ~11rem, >=1486px max 13rem.
            fontSize: "clamp(3rem, 14vw, 13rem)",
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
          className="bg-brand-blue text-brand-white hover:bg-brand-red hover:text-brand-white focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          La nostra storia
          <ArrowRight size={14} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
