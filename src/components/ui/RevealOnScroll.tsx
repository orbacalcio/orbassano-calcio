"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Wrapper di "reveal" sui blocchi della homepage che non hanno
 * un'animazione propria. Fa fade + translateY al primo ingresso nel
 * viewport (`once: true`), poi resta inerte.
 *
 * Pattern editoriale: ogni sezione cinematografica "respira" entrando
 * in scena, senza saltare. La regia complessiva e' coerente con il
 * carosello hero che apre la pagina.
 *
 * Accetta children renderizzati lato server (es. <NewsGrid /> server
 * async): React serializza il markup e lo passa qui, motion.div lo
 * anima senza trasformarli in client.
 *
 * prefers-reduced-motion → niente animazione, render diretto.
 */

const variants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  },
};

export function RevealOnScroll({
  children,
  className,
  amount = 0.05,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * Frazione del componente che deve essere visibile prima di animare
   * (0-1). Default 0.05 (5%): basta che il blocco inizi a entrare in
   * viewport per partire l'animazione. Valori piu' alti (es. 0.2)
   * non scattavano mai su blocchi alti come Timeline o NewsArchive,
   * lasciando il contenuto opacity 0 a video (pagina visivamente vuota).
   */
  amount?: number;
  /** Ritardo aggiuntivo in secondi. */
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
