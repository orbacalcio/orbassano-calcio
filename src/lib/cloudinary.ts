/**
 * Helper per costruire URL Cloudinary on-the-fly.
 *
 * Cloudinary offre URL transformer: passi width/height/format/quality
 * via path params e il CDN serve la variante richiesta (compressa,
 * convertita, ridimensionata) con caching automatico.
 *
 * Pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
 *
 * Esempio:
 *   buildCloudinaryUrl({
 *     publicId: "orbassano/match-2024/IMG_2845",
 *     width: 1200,
 *     format: "webp",
 *     quality: "auto",
 *   })
 *   → https://res.cloudinary.com/orbacalcio/image/upload/c_limit,w_1200,f_webp,q_auto/orbassano/match-2024/IMG_2845
 *
 * Niente API key/secret lato client: gli URL Cloudinary pubblici sono
 * deliverable senza autenticazione (delivery via CDN). API key serve
 * solo per upload, gestito dal plugin sanity-plugin-cloudinary.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

type Transform = {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "limit" | "fill" | "crop" | "scale" | "fit";
};

export function buildCloudinaryUrl(opts: {
  publicId: string;
  format?: string | null;
  transform?: Transform;
}): string {
  if (!CLOUD_NAME) {
    // Senza cloud_name configurato non possiamo costruire l'URL.
    // Ritorniamo stringa vuota — il rendering lato componente deve
    // gestire questo caso (fallback al campo Sanity legacy se esiste).
    return "";
  }
  const t = opts.transform ?? {};
  const transforms: string[] = [];
  // c_limit: NON ingrandisce mai le foto, ridimensiona solo se la
  // foto e' piu' grande del target. Niente upscaling pixelloso.
  transforms.push(`c_${t.crop ?? "limit"}`);
  if (t.width) transforms.push(`w_${t.width}`);
  if (t.height) transforms.push(`h_${t.height}`);
  // q_auto: Cloudinary sceglie la quality ottimale guardando il
  // contenuto della foto (paesaggio vs ritratto, livello di
  // dettaglio). Tipicamente q_auto = q_80-90 visivamente lossless.
  transforms.push(`q_${t.quality ?? "auto"}`);
  // f_auto: Cloudinary serve WebP/AVIF se il browser lo supporta,
  // JPEG/PNG di fallback. Niente da gestire lato client.
  transforms.push(`f_${t.format ?? "auto"}`);

  const transformStr = transforms.join(",");
  // Stripping del .ext nel public_id: Cloudinary lo accetta con o
  // senza estensione, ma per coerenza la togliamo (il format e'
  // determinato dalla trasformazione f_).
  const cleanId = opts.publicId.replace(/\.[^/.]+$/, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${cleanId}`;
}

/**
 * Verifica se il cloud_name e' configurato. Utile per fallback
 * graceful (non renderizzare il Cloudinary section se manca la env).
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME);
}
