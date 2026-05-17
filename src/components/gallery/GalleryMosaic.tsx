"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, Images } from "lucide-react";
import { loadMoreGalleries } from "@/app/(site)/gallery/actions";
import { GALLERY_PAGE_SIZE } from "@/app/(site)/gallery/config";
import { urlFor } from "@/sanity/image";
import type { GalleryCard } from "@/sanity/fetchers";
import { cn } from "@/lib/cn";

/**
 * Index gallerie pattern juventus.com: mosaic grid 4 colonne con
 * card miste. Le card grandi (2×2) sono CMS-driven: l'admin marca
 * un album come `isFeatured: true` in Studio per renderlo big.
 * Vantaggi vs regola posizionale (ogni N): prevedibile, intenzionale,
 * funziona bene con qualsiasi numero di album (anche pochi).
 *
 * Stato server-side: la pagina passa il batch iniziale (20). Questo
 * componente client gestisce:
 * - paginazione progressiva (offset incrementale)
 * - chiamata Server Action `loadMoreGalleries` al click "Carica altre"
 * - nasconde il pulsante quando tutti i record sono caricati
 *
 * Server Action vs API route: Server Action ci da' type-safety end-to-end
 * (TypeScript condiviso), revalidate trigger naturale, niente endpoint
 * da gestire. Trade-off: leggermente piu' verboso (useTransition per
 * pending state) ma piu' robusto.
 */
type Props = {
  initialItems: GalleryCard[];
  totalCount: number;
};

export function GalleryMosaic({ initialItems, totalCount }: Props) {
  const [items, setItems] = useState<GalleryCard[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const hasMore = items.length < totalCount;

  const onLoadMore = () => {
    startTransition(async () => {
      const result = await loadMoreGalleries(items.length);
      if (result.items.length > 0) {
        setItems((prev) => [...prev, ...result.items]);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="border-light-border bg-light-bg-1 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
        <Images size={28} className="text-light-ink-low" aria-hidden />
        <p className="text-light-ink-mid text-sm">
          Nessuna galleria pubblicata. Le foto degli ultimi eventi e
          delle partite arriveranno qui appena la redazione le
          caricherà.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-3 lg:auto-rows-[220px] lg:grid-cols-4">
        {items.map((item, index) => {
          // Big card CMS-driven: campo `isFeatured` su gallery in Sanity.
          // Default false → tutte le card uguali. L'admin attiva il
          // toggle per gli album da mettere in evidenza.
          const big = item.isFeatured === true;
          return (
            <GalleryCardTile
              key={item._id}
              gallery={item}
              big={big}
              priority={index < 4}
            />
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isPending}
            className="border-brand-gold text-light-ink-hi hover:bg-brand-gold hover:text-surface-0 focus-visible:outline-brand-gold inline-flex items-center gap-3 rounded-full border-2 px-8 py-3 text-sm font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {isPending
              ? "Carico…"
              : `Altre ${Math.min(GALLERY_PAGE_SIZE, totalCount - items.length)} gallerie`}
            {!isPending && <ArrowRight size={16} aria-hidden />}
          </button>
        </div>
      )}
    </>
  );
}

function GalleryCardTile({
  gallery,
  big,
  priority,
}: {
  gallery: GalleryCard;
  big: boolean;
  priority: boolean;
}) {
  const cover = gallery.coverImage
    ? urlFor(gallery.coverImage).width(big ? 1200 : 600).height(big ? 800 : 400).fit("crop").url()
    : null;
  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-xl bg-surface-1",
        big && "sm:col-span-2 sm:row-span-2",
      )}
    >
      <Link
        href={`/gallery/${gallery.slug}`}
        className="focus-visible:outline-brand-gold relative block h-full w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
      >
        {cover ? (
          <Image
            src={cover}
            alt={gallery.coverAlt ?? gallery.title}
            fill
            sizes={
              big
                ? "(min-width: 1024px) 50vw, (min-width: 640px) 67vw, 100vw"
                : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="bg-surface-2 absolute inset-0" aria-hidden />
        )}

        {/* Overlay gradient bottom: aumenta leggibilita' di badge + meta */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        {/* Badge numero foto, bottom-right */}
        <span
          className="font-mono bg-black/60 absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-white backdrop-blur-sm"
          aria-label={`${gallery.imagesCount} foto`}
        >
          <Images size={12} aria-hidden />
          {gallery.imagesCount}
        </span>

        {/* Titolo bottom-left. Data/ora rimosse su richiesta utente:
            sono rumore visivo e gia' presenti nella pagina detail. */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 px-4 pb-4">
          <h3
            className={cn(
              "font-display text-white leading-tight font-extrabold tracking-[0.005em] uppercase",
              big ? "text-2xl lg:text-3xl" : "text-base lg:text-lg",
            )}
          >
            {gallery.title}
          </h3>
        </div>
      </Link>
    </li>
  );
}
