"use server";

import { fetchGalleries, type GalleryCard } from "@/sanity/fetchers";
import { GALLERY_PAGE_SIZE } from "./config";

/**
 * Server Action: ritorna il prossimo batch di gallerie a partire da
 * `offset`. Usata dal componente client GalleryMosaic al click di
 * "Carica altre 20".
 *
 * Cache: il fetcher sottostante usa il tag `gallery` (Next 16 cache),
 * stesso tag invalidato dal webhook /api/revalidate quando l'admin
 * pubblica/modifica un album. Nessuna lettura "fresh per ogni click":
 * se durante la navigazione l'admin ha aggiunto un album, il nuovo
 * batch lo includera' al primo revalidate.
 */
export async function loadMoreGalleries(
  offset: number,
): Promise<{ items: GalleryCard[] }> {
  if (!Number.isInteger(offset) || offset < 0) {
    return { items: [] };
  }
  const items = await fetchGalleries(offset, GALLERY_PAGE_SIZE);
  return { items };
}
