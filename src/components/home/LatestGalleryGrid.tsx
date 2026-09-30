"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

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
 * Griglia bento 5 foto: desktop 4×2 con la prima foto 2×2, mobile la
 * prima a tutta larghezza + 2×2 sotto.
 *
 * Il sorteggio avviene dopo il mount (requestAnimationFrame, stesso
 * pattern di MatchCountdown): l'HTML server e il primo render client
 * coincidono (tile vuote), niente hydration mismatch. Le tile hanno
 * dimensioni fisse, quindi l'arrivo delle foto non sposta il layout.
 */
export function LatestGalleryGrid({
  title,
  slug,
  photos,
}: {
  title: string;
  slug: string;
  photos: LatestPhoto[];
}) {
  const [picked, setPicked] = useState<LatestPhoto[] | null>(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setPicked(pickRandom(photos, PICK_COUNT));
    });
    return () => cancelAnimationFrame(rafId);
  }, [photos]);

  const href = `/gallery/${slug}`;
  const slots = Math.min(PICK_COUNT, photos.length);

  return (
    <div className="py-16 lg:py-20">
      <Container size="wide">
        <Section eyebrow="Ultimo album" title={title}>
          <div className="grid grid-cols-2 gap-3 lg:aspect-[2/1] lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
            {Array.from({ length: slots }, (_, i) => {
              const photo = picked?.[i];
              return (
                <Link
                  key={photo?.key ?? `slot-${i}`}
                  href={href}
                  aria-label={`Apri l'album ${title}`}
                  className={cn(
                    "group bg-surface-2 focus-visible:outline-brand-gold relative block overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4",
                    i === 0
                      ? "col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto"
                      : "aspect-square lg:aspect-auto",
                  )}
                >
                  {photo && (
                    <Image
                      src={photo.src}
                      alt={photo.alt ?? `${title} — foto ${i + 1}`}
                      fill
                      sizes={
                        i === 0
                          ? "(min-width: 1024px) 50vw, 100vw"
                          : "(min-width: 1024px) 25vw, 50vw"
                      }
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Link
              href={href}
              className="focus-visible:outline-brand-gold inline-flex flex-col items-stretch gap-2.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span aria-hidden className="bg-ink-mid/40 block h-px" />
              <span className="font-display text-ink-hi flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase">
                <span>Guarda tutte le {photos.length} foto</span>
                <ArrowRight size={14} aria-hidden />
              </span>
              <span aria-hidden className="bg-ink-mid/40 block h-px" />
            </Link>
          </div>
        </Section>
      </Container>
    </div>
  );
}
