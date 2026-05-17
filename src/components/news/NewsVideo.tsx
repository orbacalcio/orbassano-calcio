/**
 * Embed video singolo per la pagina dettaglio news.
 *
 * Riconosce automaticamente URL YouTube (watch/short/youtu.be) e Vimeo,
 * estrae l'ID e produce l'URL embed corretto. Iframe responsive 16:9
 * (padding-bottom hack), lazy-load nativo, autoplay disattivato.
 *
 * Se l'URL non e' riconosciuto come provider supportato, il componente
 * ritorna null (graceful fail): meglio non mostrare nulla che mostrare
 * un iframe rotto o un link nudo che spezza il flow editoriale.
 *
 * Provider supportati:
 * - YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
 *   youtube.com/embed/ID
 * - Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
 */
type Provider = "youtube" | "vimeo";

type ParsedVideo = {
  provider: Provider;
  embedUrl: string;
};

function parseVideoUrl(rawUrl: string): ParsedVideo | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  // YouTube — copre watch, short link, shorts, gia'-embed
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = parsed.searchParams.get("v");
    if (v) return { provider: "youtube", embedUrl: youtubeEmbed(v) };
    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
    if (shortsMatch?.[1]) {
      return { provider: "youtube", embedUrl: youtubeEmbed(shortsMatch[1]) };
    }
    const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)/);
    if (embedMatch?.[1]) {
      return { provider: "youtube", embedUrl: youtubeEmbed(embedMatch[1]) };
    }
    return null;
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (id) return { provider: "youtube", embedUrl: youtubeEmbed(id) };
    return null;
  }

  // Vimeo — short link vimeo.com/ID o player embed gia' pronto
  if (host === "vimeo.com") {
    const id = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (id && /^\d+$/.test(id)) {
      return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` };
    }
    return null;
  }
  if (host === "player.vimeo.com") {
    const match = parsed.pathname.match(/^\/video\/(\d+)/);
    if (match?.[1]) {
      return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    }
    return null;
  }

  return null;
}

function youtubeEmbed(id: string): string {
  // rel=0: niente video correlati di altri canali alla fine (evita link
  // a sport irrilevanti). modestbranding=1: meno branding YT, look piu'
  // pulito coerente col sito.
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

export function NewsVideo({ url, title }: { url: string; title: string }) {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;
  const label = parsed.provider === "youtube" ? "YouTube" : "Vimeo";
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={parsed.embedUrl}
        title={`${title} — video ${label}`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
