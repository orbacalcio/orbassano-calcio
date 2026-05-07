import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Genera URL per asset immagine Sanity.
 * `source` accetta qualsiasi cosa il builder accetti (asset _ref,
 * oggetto immagine col campo asset, URL diretti). Il tipo viene
 * inferito automaticamente dal builder.
 */
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
