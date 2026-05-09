"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Z } from "@/lib/z-indexes";
import type { NewsGalleryImage } from "@/sanity/fetchers";

/**
 * Gallery foto news con lightbox al click.
 *
 * Comportamento:
 * - Griglia thumbnail (1, 2 o 3 colonne in base al numero di foto)
 * - Click su una thumb apre l'overlay lightbox con foto piena
 * - Frecce sx/dx per navigare (anche keyboard ←/→)
 * - Esc chiude, click sullo sfondo chiude
 * - prefers-reduced-motion: niente fade/scale, taglio netto
 *
 * Filtra fuori le foto senza url (caso edge: asset cancellato in
 * Sanity ma reference orfana nel documento).
 */
type Props = {
  images: NewsGalleryImage[];
};

export function NewsGallery({ images }: Props) {
  const valid = images.filter((img): img is NewsGalleryImage & { url: string } =>
    Boolean(img.url),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((i) => {
      if (i === null) return null;
      return (i + 1) % valid.length;
    });
  }, [valid.length]);
  const prev = useCallback(() => {
    setActiveIndex((i) => {
      if (i === null) return null;
      return (i - 1 + valid.length) % valid.length;
    });
  }, [valid.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, next, prev]);

  // Lock dello scroll body quando il lightbox e' aperto
  useEffect(() => {
    if (activeIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeIndex]);

  if (valid.length === 0) return null;

  const cols =
    valid.length === 1
      ? "grid-cols-1"
      : valid.length === 2
        ? "grid-cols-2"
        : "grid-cols-1 sm:grid-cols-3";
  const active = activeIndex !== null ? valid[activeIndex] : null;

  return (
    <>
      <ul className={`grid gap-3 ${cols}`}>
        {valid.map((img, i) => (
          <li key={img.url ?? `gallery-${i}`}>
            <button
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Apri foto ${i + 1}: ${img.alt ?? img.caption ?? ""}`}
              className="group focus-visible:outline-brand-gold relative block aspect-[4/3] w-full overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Image
                src={img.url}
                alt={img.alt ?? img.caption ?? ""}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes={
                  valid.length === 1
                    ? "(max-width: 1024px) 100vw, 768px"
                    : "(max-width: 640px) 100vw, 33vw"
                }
                placeholder={img.lqip ? "blur" : "empty"}
                blurDataURL={img.lqip ?? undefined}
              />
              <div
                aria-hidden
                className="from-surface-0/30 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="bg-surface-0/70 text-ink-hi absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
              >
                <ZoomIn size={12} />
                Zoom
              </span>
              {img.caption && (
                <span className="bg-surface-0/80 text-ink-hi absolute bottom-0 left-0 right-0 px-3 py-2 text-xs leading-snug backdrop-blur-md">
                  {img.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            key="lightbox"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface-0/95 fixed inset-0 flex flex-col"
            style={{ zIndex: Z.modal }}
            role="dialog"
            aria-modal="true"
            aria-label={
              active.alt ?? active.caption ?? "Foto della galleria news"
            }
            onClick={close}
          >
            <header className="flex items-center justify-between p-4">
              <span className="text-ink-mid font-mono text-xs tracking-[0.15em] uppercase">
                {(activeIndex ?? 0) + 1} / {valid.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                aria-label="Chiudi galleria"
                className="text-ink-hi hover:text-brand-gold focus-visible:outline-brand-gold flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <X size={22} aria-hidden />
              </button>
            </header>

            <div
              className="relative flex flex-1 items-center justify-center px-4 pb-8 lg:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {valid.length > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Foto precedente"
                  className="bg-surface-1/80 text-ink-hi hover:bg-surface-2 focus-visible:outline-brand-gold absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-colors focus-visible:outline-2 lg:left-6"
                >
                  <ChevronLeft size={24} aria-hidden />
                </button>
              )}

              <motion.div
                key={active.url}
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center"
              >
                <div className="relative flex h-full w-full items-center justify-center">
                  <Image
                    src={active.url}
                    alt={active.alt ?? active.caption ?? ""}
                    width={active.width ?? 1600}
                    height={active.height ?? 1200}
                    className="max-h-[80vh] w-auto rounded-xl object-contain"
                    placeholder={active.lqip ? "blur" : "empty"}
                    blurDataURL={active.lqip ?? undefined}
                    priority
                  />
                </div>
                {active.caption && (
                  <p className="text-ink-mid mt-4 max-w-2xl text-center text-sm leading-relaxed">
                    {active.caption}
                  </p>
                )}
              </motion.div>

              {valid.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Foto successiva"
                  className="bg-surface-1/80 text-ink-hi hover:bg-surface-2 focus-visible:outline-brand-gold absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-colors focus-visible:outline-2 lg:right-6"
                >
                  <ChevronRight size={24} aria-hidden />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
