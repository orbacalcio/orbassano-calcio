import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Images as ImagesIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import {
  fetchAllGallerySlugs,
  fetchGalleryBySlug,
} from "@/sanity/fetchers";
import { urlFor } from "@/sanity/image";

/**
 * /gallery/[slug] — viewer di un singolo album.
 *
 * Pattern: hero compatto (titolo + data + count) + griglia foto
 * masonry (CSS columns, layout naturale che rispetta gli aspect
 * ratio originali delle foto). Niente lightbox custom in M5 (click
 * sull'immagine apre quella in formato Sanity originale in new tab);
 * lightbox a swipe arriva in M6/M7 quando avremo molte foto da
 * navigare.
 *
 * `generateStaticParams` prerendera tutti gli album al build per
 * massima velocita' (sono pochi e cambiano raramente). Nuovi album
 * passano dal webhook revalidate tag "gallery".
 */
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchAllGallerySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await fetchGalleryBySlug(slug);
  if (!gallery) return {};
  return {
    title: gallery.title,
    description:
      gallery.coverAlt ??
      `Galleria fotografica dell'A.S.D. Orbassano Calcio: ${gallery.title}.`,
    openGraph: gallery.coverImage
      ? {
          images: [
            {
              url: urlFor(gallery.coverImage).width(1200).height(630).fit("crop").url(),
              alt: gallery.coverAlt ?? gallery.title,
            },
          ],
        }
      : undefined,
  };
}

function formatUploadedAt(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function GalleryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const gallery = await fetchGalleryBySlug(slug);
  if (!gallery) notFound();

  // Ordinamento cronologico crescente per data di scatto:
  // 1) EXIF DateTimeOriginal (presente solo se il file ha metadata
  //    e Sanity li ha estratti — vale per gli asset caricati DOPO
  //    il fix schema metadata['exif']).
  // 2) Fallback: data di caricamento asset (_createdAt) per i file
  //    privi di EXIF (screenshot, foto editate, vecchi asset).
  // Ordinamento qui in app (post-fetch) invece che in GROQ per evitare
  // edge case in cui la pipe | order(...) restituisce null se uno dei
  // dereference fallisce su asset legacy.
  const sortedImages = [...(gallery.images ?? [])].sort((a, b) => {
    const aKey = a.exifDateTime ?? a.assetCreatedAt ?? "";
    const bKey = b.exifDateTime ?? b.assetCreatedAt ?? "";
    return aKey.localeCompare(bKey);
  });
  const photoCount = sortedImages.length;

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-12 lg:py-16" size="wide">
          <Link
            href="/gallery"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={16} aria-hidden />
            Tutte le gallerie
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Gallery
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              {gallery.title}
            </h1>
            <div className="text-ink-mid flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} aria-hidden />
                {formatUploadedAt(gallery.uploadedAt)}
              </span>
              <span aria-hidden className="bg-border h-4 w-px" />
              <span className="inline-flex items-center gap-2">
                <ImagesIcon size={14} aria-hidden />
                {photoCount} {photoCount === 1 ? "foto" : "foto"}
              </span>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {photoCount === 0 ? (
          <p className="text-ink-mid text-sm">
            Questa galleria è vuota: le foto saranno caricate a breve.
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
            {sortedImages.map((img) => {
              // Larghezza Sanity 1200 per il file scaricato, ma aspect
              // ratio del DOM placeholder usa width/height nativi della
              // foto: il browser riserva lo spazio corretto PRIMA che
              // l'immagine carichi (zero layout shift) e rispetta i
              // rapporti originali (16:9, 4:5, 1:1, portrait, ecc).
              const src = urlFor(img).width(1200).fit("max").url();
              const w = img.width ?? 1200;
              const h = img.height ?? 800;
              return (
                <figure
                  key={img._key}
                  className="overflow-hidden rounded-xl bg-surface-1"
                >
                  <a
                    href={urlFor(img).width(2000).fit("max").url()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Apri ${img.alt ?? "immagine"} in formato originale`}
                    className="block"
                  >
                    <Image
                      src={src}
                      alt={img.alt ?? gallery.title}
                      width={w}
                      height={h}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      placeholder={img.lqip ? "blur" : "empty"}
                      blurDataURL={img.lqip ?? undefined}
                      className="h-auto w-full"
                    />
                  </a>
                  {img.caption && (
                    <figcaption className="text-ink-mid bg-surface-1 px-3 py-2 text-xs">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
