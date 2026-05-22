"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Reveal allo scroll — versione "elegante e discreta" (calibrata con
 * l'utente 2026-05-22). Sostituisce il vecchio RevealOnScroll che era
 * stato disabilitato perche' il translateY troppo ampio creava un
 * "salto verso l'alto" sgradevole.
 *
 * Differenze chiave che evitano quel problema:
 *  - spostamento PICCOLO (10px), non un salto;
 *  - `once: true` → anima una volta sola, niente flicker risalendo;
 *  - `amount` basso → parte appena il blocco entra, non a meta' schermo;
 *  - reduced-motion → render statico, zero animazione (accessibilita').
 *
 * Usare SOLO su blocchi sotto la piega: l'above-the-fold (hero/header)
 * va lasciato statico, era la causa originale del salto.
 *
 * Due varianti:
 *  - <Reveal>          → un blocco unico fade + rise.
 *  - <RevealStagger>   → contenitore che fa entrare i figli a cascata
 *                        (stagger), es. una griglia di card.
 */

const EASE = [0.215, 0.61, 0.355, 1] as const;
const DURATION = 0.5;
const RISE = 10;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

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
