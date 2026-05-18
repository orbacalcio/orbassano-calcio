import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Sponsor e partner di ASD Orbassano Calcio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * OG image dedicata per /sponsor (audit fix #3): preview social
 * specifica per attrarre potenziali sponsor che ricevono il link
 * via WhatsApp / email. Eyebrow + title differenziati dal fallback
 * homepage.
 */
export default async function Image() {
  return renderOgImage({
    eyebrow: "In campo con noi",
    title: "Sponsor & Partner",
    subtitle: "Le aziende che sostengono il club",
  });
}
