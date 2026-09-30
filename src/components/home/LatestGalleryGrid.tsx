"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type LatestPhoto = {
  key: string;
  src: string;
  alt: string | null;
};

// Foto visibili per breakpoint: 3 su mobile, 5 da md, 8 da xl. Se ne
// sorteggiano sempre 8 e le eccedenti sono nascoste via CSS, cosi' il
// numero si adatta al ridimensionamento della finestra senza JS.
const PICK_COUNT = 8;

function visibilityClass(index: number): string {
  if (index >= 5) return "hidden xl:block";
  if (index >= 3) return "hidden md:block";
  return "block";
}

/** Fisher-Yates parziale: `count` elementi distinti a caso. */
function pickRandom<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j] as T, pool[i] as T];
  }
  return pool.slice(0, n);
}

/**
 * Striscia a tutta larghezza di foto quadrate uguali (3/5/8 in base
 * alla larghezza), senza testi ne' link (richiesta utente 2026-09-30).
 * Flex con tile flex-1: le foto riempiono sempre tutta la riga, anche
 * se l'album ne ha meno di 8.
 *
 * Il sorteggio avviene dopo il mount (requestAnimationFrame, stesso
 * pattern di MatchCountdown): l'HTML server e il primo render client
 * coincidono (tile vuote), niente hydration mismatch. Le tile hanno
 * dimensioni fisse, quindi l'arrivo delle foto non sposta il layout.
 */
export function LatestGalleryGrid({
  title,
  photos,
}: {
  title: string;
  photos: LatestPhoto[];
}) {
  const [picked, setPicked] = useState<LatestPhoto[] | null>(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setPicked(pickRandom(photos, PICK_COUNT));
    });
    return () => cancelAnimationFrame(rafId);
  }, [photos]);

  return (
    <section aria-label={`Foto: ${title}`} className="py-10 lg:py-14">
      <div className="flex gap-1.5 sm:gap-2 lg:gap-3">
        {Array.from({ length: Math.min(PICK_COUNT, photos.length) }, (_, i) => {
          const photo = picked?.[i];
          return (
            <div
              key={photo?.key ?? `slot-${i}`}
              className={cn(
                "bg-surface-2 relative aspect-square min-w-0 flex-1 overflow-hidden",
                visibilityClass(i),
              )}
            >
              {photo && (
                <Image
                  src={photo.src}
                  alt={photo.alt ?? `${title} — foto ${i + 1}`}
                  fill
                  sizes="(min-width: 1280px) 12.5vw, (min-width: 768px) 20vw, 33vw"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
