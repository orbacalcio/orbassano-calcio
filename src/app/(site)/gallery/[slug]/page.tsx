import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Images as ImagesIcon } from "lucide-react";
import {
  GalleryViewer,
  type UnifiedPhoto,
} from "@/components/gallery/GalleryViewer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { buildBreadcrumbLd } from "@/lib/json-ld";
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
    alternates: { canonical: `/gallery/${slug}` },
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

  // Fonde le due sorgenti (Sanity legacy + Cloudinary nuova) in un
  // singolo array UnifiedPhoto. Il viewer client non distingue tra
  // i due tipi: usa src/srcFull/width/height uniformi.
  //
  // Sanity: filtro defensive di asset:null (placeholder vuoti in CMS),
  // poi map a UnifiedPhoto via urlFor.
  // Cloudinary: filtro defensive di public_id mancante, poi map via
  // buildCloudinaryUrl con transformations (w/f/q auto).
  type PhotoWithSortKey = UnifiedPhoto & { sortKey: string };

  const sanityPhotos: PhotoWithSortKey[] = (gallery.images ?? [])
    .filter((img) => img.asset != null)
    .map((img) => ({
      key: img._key,
      src: urlFor(img).width(1200).fit("max").url(),
      srcFull: urlFor(img).width(2000).fit("max").url(),
      width: img.width ?? 1200,
      height: img.height ?? 800,
      alt: img.alt,
      caption: img.caption,
      lqip: img.lqip,
      source: "sanity" as const,
      sortKey: img.exifDateTime ?? img.assetCreatedAt ?? "",
    }));

  const cloudinaryPhotos: PhotoWithSortKey[] = (gallery.cloudinaryImages ?? [])
    .filter((img) => img.public_id != null)
    .map((img) => {
      const alt = img.context?.custom?.alt ?? null;
      const caption = img.context?.custom?.caption ?? null;
      const src = buildCloudinaryUrl({
        publicId: img.public_id,
        format: img.format,
        transform: { width: 1200, crop: "limit" },
      });
      const srcFull = buildCloudinaryUrl({
        publicId: img.public_id,
        format: img.format,
        transform: { width: 2000, crop: "limit" },
      });
      return {
        key: img._key,
        src,
        srcFull,
        width: img.width ?? 1200,
        height: img.height ?? 800,
        alt,
        caption,
        lqip: null, // Cloudinary non fornisce LQIP base64 di default
        source: "cloudinary" as const,
        sortKey: img.createdAt ?? "",
      };
    });

  // Concatena Sanity + Cloudinary, ordina cronologicamente crescente
  // (data scatto EXIF se disponibile, altrimenti data upload), poi
  // elimina il campo sortKey con cast.
  const merged: PhotoWithSortKey[] = [...sanityPhotos, ...cloudinaryPhotos];
  merged.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const sortedPhotos: UnifiedPhoto[] = merged.map(
    ({ sortKey: _sortKey, ...rest }) => rest,
  );

  const photoCount = sortedPhotos.length;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" },
          { name: gallery.title, url: `/gallery/${gallery.slug}` },
        ])}
      />
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
                {photoCount} foto
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
          <GalleryViewer photos={sortedPhotos} albumTitle={gallery.title} />
        )}
      </Container>
    </>
  );
}
