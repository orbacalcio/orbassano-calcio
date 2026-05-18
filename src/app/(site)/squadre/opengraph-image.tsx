import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Le squadre di ASD Orbassano Calcio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * OG image dedicata per /squadre (audit fix #3): preview social
 * specifica con eyebrow "Squadre attive" + title "Le squadre" al
 * posto del fallback homepage. Le pagine /squadre/[slug] (singola
 * squadra) hanno OG image custom dal team.heroImage in metadata.
 */
export default async function Image() {
  return renderOgImage({
    eyebrow: "Squadre attive · Stagione 2026/27",
    title: "Le squadre",
    subtitle: "Prima Squadra · Juniores · Settore Giovanile",
  });
}
