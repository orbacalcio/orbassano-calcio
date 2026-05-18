import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "News e comunicati — ASD Orbassano Calcio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * OG image dedicata per /news (audit fix #3): preview social specifica
 * con eyebrow "Comunicazioni" + title "News" al posto del fallback
 * homepage. Le pagine /news/[slug] hanno la loro OG image custom (cover
 * articolo), questa serve solo per /news indice.
 */
export default async function Image() {
  return renderOgImage({
    eyebrow: "Comunicazioni · Aggiornamenti",
    title: "News",
    subtitle: "Tutte le ultime dal rossoblù",
  });
}
