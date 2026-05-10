"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Table of Contents laterale sticky con scroll-spy.
 *
 * Su desktop: sticky a sinistra del contenuto. L'item corrente in TOC
 * si evidenzia (text-brand-gold + border-l-2) man mano che l'utente
 * scrolla, basato su IntersectionObserver applicato agli anchor
 * #cap-N delle <Chapter>.
 *
 * Su mobile (lg-): TOC nascosta. Il contenuto e' lineare.
 *
 * Click su voce → scroll smooth all'anchor (CSS scroll-behavior:smooth
 * gestita dal scroll-mt-24 sul target).
 */
const ITEMS = [
  { id: "cap-0", label: "Premessa" },
  { id: "cap-1", label: "1. Guida all'uso" },
  { id: "cap-2", label: "2. Principi generali" },
  { id: "cap-3", label: "3. Settore giovanile" },
  { id: "cap-4", label: "4. Dirigenti e tecnici" },
  { id: "cap-5", label: "5. Calciatori" },
  { id: "cap-6", label: "6. Sponsor e partner" },
  { id: "cap-7", label: "7. Enti pubblici" },
  { id: "cap-8", label: "8. Dati personali" },
  { id: "cap-9", label: "9. Patrimonio" },
  { id: "cap-10", label: "10. Sanzioni" },
  { id: "cap-11", label: "11. Segnalazioni" },
  { id: "cap-12", label: "12. Disposizioni finali" },
] as const;

export function ChapterNav() {
  const [activeId, setActiveId] = useState<string>("cap-0");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const targets = ITEMS.map((it) => document.getElementById(it.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Selezione robusta: tra le sezioni intersecate, la più alta
        // (più vicina al top) e' attiva.
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(top.target.id);
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      },
    );

    targets.forEach((t) => observerRef.current?.observe(t));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <nav
      aria-label="Indice del Codice Etico"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
    >
      <span className="font-display text-brand-gold text-xs font-bold tracking-[0.25em] uppercase">
        Indice
      </span>
      <ol className="mt-4 flex flex-col">
        {ITEMS.map((it) => {
          const isActive = activeId === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                  isActive
                    ? "border-brand-gold text-brand-gold font-semibold"
                    : "border-border/40 text-ink-mid hover:text-ink-hi"
                }`}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
