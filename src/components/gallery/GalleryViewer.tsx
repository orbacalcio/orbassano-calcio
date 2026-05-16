"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";

/**
 * Photo unificata che astrae le due sorgenti possibili:
 * - 'sanity': asset legacy su CDN Sanity
 * - 'cloudinary': asset nuovo su CDN Cloudinary
 *
 * Il viewer non si interessa della sorgente al rendering: usa
 * src/srcFull/width/height/alt/caption/lqip in modo uniforme. Le
 * funzioni che costruiscono l'URL diversificano in base al source
 * tipo (urlFor vs buildCloudinaryUrl).
 */
export type UnifiedPhoto = {
  key: string;
  src: string; // URL preview (1200px wide)
  srcFull: string; // URL full-res (2000px) per il lightbox zoom 2x
  width: number;
  height: number;
  alt: string | null;
  caption: string | null;
  lqip: string | null;
  source: "sanity" | "cloudinary";
};

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
  photos: UnifiedPhoto[];
  albumTitle: string;
};

export function GalleryViewer({ photos: images, albumTitle }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  // Dimensioni viewport per calcolare i bounds del drag pan in modo
  // generoso: quando foto scalata 2x, l'utente puo' pannare fino a
  // ~50% di viewport in qualunque direzione → vede tutti i bordi
  // della foto zoomata. Senza window-size, dragConstraints di
  // framer-motion confonde le coordinate post-scale e blocca il pan
  // a pochi centimetri (bug noto framer-motion con scale + drag).
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const reduced = useReducedMotion();
  // Ref del backdrop del lightbox (mantenuto per ESC/click outside).
  const dragContainerRef = useRef<HTMLDivElement>(null);

  // Update viewport size on mount + window resize.
  useEffect(() => {
    function update() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
          return (
            <figure
              key={img.key}
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
                  src={img.src}
                  alt={img.alt ?? albumTitle}
                  width={img.width}
                  height={img.height}
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
            ref={dragContainerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ${selectedIndex + 1} di ${images.length}: ${selected.alt ?? albumTitle}`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onContextMenu={(e) => e.preventDefault()}
            className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-md"
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

            {/* Foto con click-to-zoom + pan via drag quando zoomata.
                motion.div invece di button: framer-motion gestisce
                onTap (click semplice senza drag) e drag (>5px movimento)
                in modo mutuamente esclusivo — non si interferiscono.
                Tasto a11y separato in basso a sx per chi usa solo
                tastiera (Tab + Enter su 'Zoom'). */}
            <motion.div
              role="img"
              aria-label={selected.alt ?? albumTitle}
              onContextMenu={(e) => e.preventDefault()}
              animate={{ scale: zoomed ? 2 : 1, x: zoomed ? undefined : 0, y: zoomed ? undefined : 0 }}
              transition={{ type: "tween", duration: reduced ? 0 : 0.3, ease: "easeOut" }}
              drag={zoomed}
              // Bounds calcolati su viewport (non sul container ref):
              // a scale 2x l'utente puo' pannare fino a meta' viewport
              // per direzione → vede tutti i bordi della foto. Le
              // coordinate sono pre-scale (framer-motion). Bounds 0 se
              // non zoomata → niente pan accidentale.
              dragConstraints={
                zoomed
                  ? {
                      left: -viewport.w / 2,
                      right: viewport.w / 2,
                      top: -viewport.h / 2,
                      bottom: viewport.h / 2,
                    }
                  : { left: 0, right: 0, top: 0, bottom: 0 }
              }
              dragElastic={0.1}
              dragMomentum={false}
              onTap={() => setZoomed((z) => !z)}
              className={cn(
                "relative z-[1] max-h-[90vh] max-w-[90vw] overflow-hidden",
                zoomed
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-zoom-in",
              )}
            >
              {/* La foto stessa: srcFull contiene la variante 2000px
                  pre-costruita lato sorgente (Sanity urlFor o Cloudinary
                  transform). fit=max preserva aspect ratio originale. */}
              <Image
                src={selected.srcFull}
                alt={selected.alt ?? albumTitle}
                width={selected.width}
                height={selected.height}
                priority
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="pointer-events-none block max-h-[90vh] w-auto select-none [-webkit-user-drag:none]"
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
            </motion.div>

            {/* Hint zoom + tasto a11y in basso a sinistra. Cliccabile
                anche col cursore mouse (zoom toggle alternativo) e
                attivabile da tastiera per a11y. */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              aria-label={zoomed ? "Riduci zoom" : "Aumenta zoom"}
              className="focus-visible:outline-brand-gold font-mono pointer-events-auto absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] tracking-wider uppercase text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 md:bottom-6 md:left-6 md:text-xs"
            >
              {zoomed ? (
                <>
                  <ZoomOut size={12} aria-hidden /> Click per ridurre
                </>
              ) : (
                <>
                  <ZoomIn size={12} aria-hidden /> Click per zoom
                </>
              )}
            </button>

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
