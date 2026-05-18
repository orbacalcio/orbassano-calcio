import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ASD Orbassano Calcio — Dal 1930 il calcio di Orbassano";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * OG image dinamica 1200x630 (standard Facebook/Twitter) per la
 * homepage. Refactor 2026-05-18: layout estratto in lib/og-image.tsx
 * per riuso su pagine sezione (audit fix #3).
 */
export default async function Image() {
  return renderOgImage({
    eyebrow: "A.S.D. · Dal 1930",
    title: "Orbassano Calcio",
    subtitle: "Il rossoblù di Orbassano",
  });
}
