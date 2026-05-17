import type { NewsVideoAsset } from "@/sanity/fetchers";

/**
 * Player video per la pagina dettaglio news. Riceve un asset
 * Cloudinary (uploadato dallo Studio via plugin sanity-plugin-cloudinary)
 * e lo serve via <video> HTML5 nativo.
 *
 * Razionale:
 * - Storage Cloudinary (25 GB free) invece di Sanity (5 GB) per i
 *   video, che pesano molto. Stessi pattern delle foto gallery.
 * - Player nativo HTML5: controls, fullscreen, picture-in-picture
 *   gratis dal browser. Niente librerie esterne.
 * - Poster auto-generato da Cloudinary (frame al secondo 0 in JPG):
 *   evita flash nero prima del play, e tiene il LCP basso (l'utente
 *   vede subito un frame al posto del rettangolo vuoto).
 * - preload="metadata": carica solo i metadata video (dimensioni,
 *   durata) senza scaricare il payload. L'utente paga la banda solo
 *   quando preme play.
 * - playsInline: su iOS evita il fullscreen automatico al play
 *   (UX nativa app-like).
 *
 * Se l'asset non ha secure_url valido (es. upload non completato,
 * record corrotto), il componente ritorna null (graceful fail).
 */

function deriveCloudinaryPoster(secureUrl: string): string | null {
  // Pattern Cloudinary: /{cloud}/video/upload/{transforms?}/{public_id}.{ext}
  // → poster jpg: aggiungiamo so_0,f_jpg subito dopo /video/upload/ e
  // sostituiamo l'estensione video con .jpg
  if (!secureUrl.includes("/video/upload/")) return null;
  return secureUrl
    .replace("/video/upload/", "/video/upload/so_0,f_jpg/")
    .replace(/\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i, ".jpg$2");
}

function mimeFromFormat(format: string | null | undefined): string {
  if (!format) return "video/mp4";
  const lower = format.toLowerCase();
  if (lower === "mov") return "video/quicktime";
  if (lower === "webm") return "video/webm";
  if (lower === "m4v") return "video/mp4";
  return `video/${lower}`;
}

export function NewsVideo({
  video,
  title,
}: {
  video: NewsVideoAsset;
  title: string;
}) {
  if (!video.secure_url) return null;
  const poster = deriveCloudinaryPoster(video.secure_url);
  const mime = mimeFromFormat(video.format);
  // Aspect ratio dal video se Cloudinary ce l'ha, altrimenti 16:9.
  const aspectStyle =
    video.width && video.height
      ? { aspectRatio: `${video.width} / ${video.height}` }
      : undefined;
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-black"
      style={aspectStyle ?? { aspectRatio: "16 / 9" }}
    >
      <video
        controls
        preload="metadata"
        playsInline
        poster={poster ?? undefined}
        aria-label={`${title} — video`}
        className="absolute inset-0 h-full w-full"
      >
        <source src={video.secure_url} type={mime} />
      </video>
    </div>
  );
}
