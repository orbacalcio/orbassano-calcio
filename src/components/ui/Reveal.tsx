"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Reveal allo scroll — versione "solo fade" (calibrata con l'utente
 * 2026-05-22). Niente translateY: il vecchio RevealOnScroll era stato
 * disabilitato proprio perche' lo spostamento verticale creava un
 * "salto verso l'alto" sgradevole. Qui si anima SOLO l'opacita'
 * (0 → 1), quindi i box compaiono in dissolvenza senza muoversi.
 *
 *  - `once: true` → anima una volta sola, niente flicker risalendo;
 *  - `amount` basso → parte appena il blocco entra in viewport;
 *  - reduced-motion → render statico, zero animazione.
 *
 * <RevealStagger> fa comparire i figli a cascata (stagger leggero),
 * es. una griglia di card.
 */

const DURATION = 0.5;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION, ease: "easeOut" } },
};

export function RevealStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <motion.div key={child.key ?? i} variants={itemVariants}>
            {child}
          </motion.div>
        ) : (
          child
        ),
      )}
    </motion.div>
  );
}
