"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";

export type LatestPhoto = {
  key: string;
  src: string;
  alt: string | null;
};

const PICK_COUNT = 5;

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
 * Striscia di 5 foto uguali in orizzontale, senza testi ne' link
 * (richiesta utente 2026-09-30).
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
      <Container size="wide">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4">
          {Array.from({ length: PICK_COUNT }, (_, i) => {
            const photo = picked?.[i];
            return (
              <div
                key={photo?.key ?? `slot-${i}`}
                className="bg-surface-2 relative aspect-square overflow-hidden rounded-sm"
              >
                {photo && (
                  <Image
                    src={photo.src}
                    alt={photo.alt ?? `${title} — foto ${i + 1}`}
                    fill
                    sizes="(min-width: 1536px) 300px, 20vw"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
