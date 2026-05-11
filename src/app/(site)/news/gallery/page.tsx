import type { Metadata } from "next";
import { GalleryMosaic } from "@/components/gallery/GalleryMosaic";
import { Container } from "@/components/ui/Container";
import {
  fetchGalleries,
  fetchGalleriesTotalCount,
} from "@/sanity/fetchers";
import { GALLERY_PAGE_SIZE } from "./config";

/**
 * /news/gallery — index gallerie fotografiche del club.
 *
 * Pattern juventus.com: mosaic con cover di ogni album, alcune card
 * grandi (2×2) intervallate ogni 7. Pagina server fetch primo batch
 * (20 gallerie), il componente client GalleryMosaic gestisce
 * paginazione progressiva con Server Action.
 *
 * Ordinamento di default: pin order (manuale, opzionale) poi
 * uploadedAt desc. Modificabile dall'admin in Sanity Studio.
 *
 * Asset upload: solo dallo Studio (mai dal seed). Lesson learned dai
 * loghi sponsor cancellati 10/05/2026 — pattern createIfNotExists +
 * patch.set ovunque ci siano image asset caricati a mano.
 */
export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Foto e video dell'A.S.D. Orbassano Calcio: gallerie fotografiche delle partite, degli allenamenti e degli eventi sociali del club rossoblù.",
};

export default async function GalleryIndexPage() {
  const [initialItems, totalCount] = await Promise.all([
    fetchGalleries(0, GALLERY_PAGE_SIZE),
    fetchGalleriesTotalCount(),
  ]);

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              News · Gallery
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Foto e video
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Gli scatti del rossoblù: dietro le quinte, partite,
              allenamenti, eventi sociali e tutto quello che non si
              vede da fuori. Clicca su una galleria per aprirla.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        <GalleryMosaic
          initialItems={initialItems}
          totalCount={totalCount}
        />
      </Container>
    </>
  );
}
