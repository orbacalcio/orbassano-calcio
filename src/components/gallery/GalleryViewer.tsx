"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { urlFor } from "@/sanity/image";
import type { GalleryImageItem } from "@/sanity/fetchers";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";

/**
 * Viewer client di un singolo album.
 *
 * 1) Mosaico (masonry CSS columns) — rispetta gli aspect ratio nativi
 *    delle foto: 16:9, 4:5, 1:1, portrait. Niente layout shift grazie
 *    a next/image con width/height reali + LQIP blur placeholder.
 *
 * 2) Lightbox popup — al click su una foto si apre un dialog full-screen
 *    con:
 *    - foto al centro, max 90vh / 90vw
 *    - frecce ←/→ (DOM + tastiera) per navigare avanti/indietro
 *    - Click sulla foto: toggle zoom 1x ↔ 2x (CSS scale + transition)
 *    - Close: X in alto a destra, ESC, click sul backdrop scuro
 *    - body scroll lock mentre aperto
 *    - reduced motion: niente transition smooth (rispetto preferenze a11y)
 *
 * 3) Anti-download (deterrente, non blocco assoluto — vedi NB in fondo):
 *    - onContextMenu={e => e.preventDefault()} sull'immagine e sul wrapper
 *      lightbox → niente menu "Salva immagine con nome"
 *    - CSS user-select:none + -webkit-user-drag:none → niente drag-to-save
 *    - draggable={false} sull'<img>
 *    - Watermark CSS sovrapposto in basso a destra con logo + dominio
 *    - Pointer-events sul backdrop solo per chiudere, non per ispezione
 *
 * NB sul "no screenshot mobile": non e' tecnicamente possibile bloccare
 * gli screenshot dei sistemi operativi (iOS/Android) da un sito web.
 * Solo le app native con flag DRM (Widevine per video, Android FLAG_SECURE
 * per foto) possono farlo. Su web l'unico deterrente reale e' il
 * watermark visibile, che resta nello screenshot identificando la fonte.
 */

type Props = {
  images: GalleryImageItem[];
  albumTitle: string;
};

export function GalleryViewer({ images, albumTitle }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const reduced = useReducedMotion();

  const close = useCallback(() => {
    setSelectedIndex(null);
    setZoomed(false);
  }, []);

  const next = useCallback(() => {
    if (selectedIndex === null) return;
    setZoomed(false);
    setSelectedIndex((i) =>
      i === null ? null : (i + 1) % images.length,
    );
  }, [selectedIndex, images.length]);

  const prev = useCallback(() => {
    if (selectedIndex === null) return;
    setZoomed(false);
    setSelectedIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  }, [selectedIndex, images.length]);

  // Keyboard handlers: ESC chiude, frecce navigano. Effect attivo SOLO
  // quando il lightbox e' aperto per non sprecare listener.
  useEffect(() => {
    if (selectedIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, close, next, prev]);

  // Body scroll lock mentre lightbox aperto: evita che la pagina sotto
  // scrolli con touch/wheel quando si naviga nel popup.
  useEffect(() => {
    if (selectedIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedIndex]);

  const selected =
    selectedIndex !== null ? images[selectedIndex] ?? null : null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
        {images.map((img, i) => {
          const src = urlFor(img).width(1200).fit("max").url();
          const w = img.width ?? 1200;
          const h = img.height ?? 800;
          return (
            <figure
              key={img._key}
              className="overflow-hidden rounded-xl bg-surface-1"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(i)}
                onContextMenu={(e) => e.preventDefault()}
                aria-label={`Apri ${img.alt ?? albumTitle} a tutto schermo`}
                className="focus-visible:outline-brand-gold block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
              >
                <Image
                  src={src}
                  alt={img.alt ?? albumTitle}
                  width={w}
                  height={h}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  placeholder={img.lqip ? "blur" : "empty"}
                  blurDataURL={img.lqip ?? undefined}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="h-auto w-full select-none [-webkit-user-drag:none]"
                />
              </button>
              {img.caption && (
                <figcaption className="text-ink-mid bg-surface-1 px-3 py-2 text-xs">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && selectedIndex !== null && (
          <motion.div
            key="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ${selectedIndex + 1} di ${images.length}: ${selected.alt ?? albumTitle}`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onContextMenu={(e) => e.preventDefault()}
            className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md"
            style={{ zIndex: Z.modal }}
          >
            {/* Click sul backdrop chiude. Il pulsante avvolge tutto lo
                schermo MA escludiamo gli elementi UI sopra. */}
            <button
              type="button"
              aria-label="Chiudi popup"
              onClick={close}
              className="absolute inset-0 cursor-zoom-out"
            />

            {/* Top bar: contatore + close */}
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 md:p-6 pointer-events-none">
              <span className="font-mono text-white/80 text-xs tracking-wide uppercase pointer-events-auto select-none">
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Chiudi"
                className="focus-visible:outline-brand-gold pointer-events-auto rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-2"
              >
                <X size={22} aria-hidden />
              </button>
            </div>

            {/* Frecce navigazione (nascoste se 1 sola foto) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Foto precedente"
                  className="focus-visible:outline-brand-gold absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 md:left-6"
                >
                  <ChevronLeft size={28} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Foto successiva"
                  className="focus-visible:outline-brand-gold absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 md:right-6"
                >
                  <ChevronRight size={28} aria-hidden />
                </button>
              </>
            )}

            {/* Foto + zoom toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              onContextMenu={(e) => e.preventDefault()}
              aria-label={zoomed ? "Riduci zoom" : "Aumenta zoom 2x"}
              className={cn(
                "relative z-[1] max-h-[90vh] max-w-[90vw] overflow-hidden transition-transform duration-300 ease-out",
                zoomed
                  ? "cursor-zoom-out scale-[2]"
                  : "cursor-zoom-in scale-100",
              )}
            >
              {/* La foto stessa: src 2000px wide per qualità adeguata
                  al zoom 2x. fit=max preserva l'aspect ratio originale. */}
              <Image
                src={urlFor(selected).width(2000).fit("max").url()}
                alt={selected.alt ?? albumTitle}
                width={selected.width ?? 2000}
                height={selected.height ?? 1333}
                priority
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="block max-h-[90vh] w-auto select-none [-webkit-user-drag:none]"
                placeholder={selected.lqip ? "blur" : "empty"}
                blurDataURL={selected.lqip ?? undefined}
              />
              {/* Watermark CSS sovrapposto: identifica la fonte negli
                  screenshot. Logo orbassano (semi-trasparente) + dominio.
                  Su zoom 2x scala con la foto e resta visibile. */}
              <span
                aria-hidden
                className="font-mono pointer-events-none absolute bottom-2 right-2 rounded bg-black/40 px-2 py-1 text-[10px] tracking-wider uppercase text-white/70 md:bottom-3 md:right-3 md:text-xs"
              >
                © orbassanocalcio.com
              </span>
            </button>

            {/* Hint zoom in basso a sx (icona indicativa) */}
            <span
              aria-hidden
              className="font-mono pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] tracking-wider uppercase text-white/70 md:bottom-6 md:left-6 md:text-xs"
            >
              {zoomed ? (
                <>
                  <ZoomOut size={12} aria-hidden /> Click per ridurre
                </>
              ) : (
                <>
                  <ZoomIn size={12} aria-hidden /> Click per zoom 2x
                </>
              )}
            </span>

            {/* Caption se presente */}
            {selected.caption && (
              <span className="font-mono pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80vw] truncate rounded bg-black/40 px-3 py-1.5 text-xs text-white/80 md:bottom-6">
                {selected.caption}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
