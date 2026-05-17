"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Triggera `revealed=true` SOLO la prima volta che l'elemento entra
 * nel viewport mentre l'utente sta scrollando verso il basso.
 * Una volta diventato true, resta true per sempre — niente reverse,
 * niente re-trigger. Scroll-up successivi sopra l'elemento non
 * triggerano l'animazione (per spec utente: "mai allo scroll up").
 *
 * Casi edge:
 *  - Elemento gia' in viewport al mount (es. utente atterra su anchor
 *    diretto): trattiamo come "primo scroll-down" implicito → reveal
 *    al volo (l'animazione parte appena monta).
 *  - Utente scrolla SU verso un elemento mai visto: NON reveala —
 *    l'animazione partira' solo se poi scrolla giu' attraverso l'elemento.
 *
 * Differenza da framer-motion `whileInView: { once: true }`: questo
 * hook impone anche la direzione (DOWN-only) sul primo trigger.
 * `once: true` da solo permetterebbe trigger su scroll-up se l'utente
 * landing-on-anchor poi torna alla sezione.
 */
export function useFirstScrollDownReveal(
  ref: RefObject<Element | null>,
  options?: { amount?: number },
): boolean {
  const [revealed, setRevealed] = useState(false);
  const lastScrollY = useRef(0);
  // default true: se l'elemento e' visibile gia' al mount lo trattiamo
  // come "primo scroll-down" implicito (landing diretto su pagina che
  // include l'elemento in viewport).
  const isScrollingDown = useRef(true);

  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;

    lastScrollY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      // >= per trattare "scroll fermo" come down (default permissive)
      isScrollingDown.current = y >= lastScrollY.current;
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (isScrollingDown.current) {
          setRevealed(true);
        }
      },
      { threshold: options?.amount ?? 0.4 },
    );
    observer.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [ref, revealed, options?.amount]);

  return revealed;
}
