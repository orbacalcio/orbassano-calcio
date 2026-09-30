import { LatestGalleryGrid, type LatestPhoto } from "@/components/home/LatestGalleryGrid";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { fetchLatestGallery } from "@/sanity/fetchers";
import { urlFor } from "@/sanity/image";

/**
 * Strip "Ultimo album" in homepage: 5 foto a caso dell'album caricato
 * piu' di recente (data/ora "uploadedAt" del CMS).
 *
 * Il server passa TUTTE le foto dell'album al client, che ne estrae 5
 * a ogni visita: la home e' in cache ISR, quindi un sorteggio lato
 * server darebbe le stesse 5 foto a tutti fino al prossimo revalidate.
 * Unifica le due sorgenti (Sanity legacy + Cloudinary) come la pagina
 * /gallery/[slug].
 */
const TILE_WIDTH = 800;

export async function LatestGallery() {
  const gallery = await fetchLatestGallery();
  if (!gallery) return null;

  const sanityPhotos: LatestPhoto[] = (gallery.images ?? [])
    .filter((img) => img.asset != null)
    .map((img) => ({
      key: img._key,
      src: urlFor(img).width(TILE_WIDTH).fit("max").url(),
      alt: img.alt,
    }));

  const cloudinaryPhotos: LatestPhoto[] = (gallery.cloudinaryImages ?? [])
    .filter((img) => img.public_id != null)
    .map((img) => ({
      key: img._key,
      src: buildCloudinaryUrl({
        publicId: img.public_id,
        format: img.format,
        transform: { width: TILE_WIDTH, crop: "limit" },
      }),
      alt: img.context?.custom?.alt ?? null,
    }))
    .filter((p) => p.src !== "");

  const photos = [...cloudinaryPhotos, ...sanityPhotos];
  // Sotto le 3 foto (minimo mobile) la striscia non ha senso.
  if (photos.length < 3) return null;

  return (
    <LatestGalleryGrid
      title={gallery.title}
      photos={photos}
    />
  );
}
