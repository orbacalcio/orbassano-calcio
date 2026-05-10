import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Renderer atomico del logo sponsor — fallback a 3 livelli per
 * variant="mono", a 2 livelli per variant="color".
 *
 * Razionale: il caricamento dei `logoMonochrome` da parte dell'admin
 * e' graduale (Photoshop manuale, caso per caso). Senza questo
 * fallback intermedio, durante la transizione la topbar mostrerebbe
 * meta' loghi e meta' fallback testuali — esteticamente disomogeneo.
 * Ammettendo il `logo` color in contesto mono, il tradeoff e':
 * "qualche logo a colori in topbar dark" >> "logo come testo Plain".
 *
 * Comportamento:
 *
 * - variant="mono"  → ordine di fallback:
 *      1. sponsor.logoMonochrome (versione bianca curata dall'admin)
 *      2. sponsor.logo (color, renderizzato com'e', NESSUN filtro CSS)
 *      3. fallback testuale `name` in Big Shoulders Display 600,
 *         tracking-[0.15em], uppercase, color text-ink-hi (~ bianco
 *         navy del brand; la linea guida del progetto evita il
 *         bianco puro).
 *
 * - variant="color" → ordine di fallback:
 *      1. sponsor.logo
 *      2. stesso fallback testuale; color overridabile via className
 *         per contesti chiari/neutri.
 *
 * Mai usare brightness/invert CSS: le versioni mono sono asset
 * editoriali, non filtri.
 *
 * Niente animazione hover sui path immagine: comportamento statico
 * e prevedibile.
 */

type SponsorLike = {
  name: string;
  logo: string | null;
  logoMonochrome?: string | null;
};

type Props = {
  sponsor: SponsorLike;
  variant: "mono" | "color";
  /** Dimensione intrinseca per next/image (no layout shift). Default 100x20 (topbar). */
  width?: number;
  height?: number;
  /** Classi sul rendering finale (immagine o span fallback). */
  className?: string;
  /** Stile inline (utile per altezze dinamiche pilotate da scroll progress). */
  style?: CSSProperties;
};

export function SponsorLogo({
  sponsor,
  variant,
  width = 100,
  height = 20,
  className,
  style,
}: Props) {
  const src = pickSrc(sponsor, variant);

  // Asset assente per entrambi i livelli → fallback testuale.
  // `inline-flex items-center` garantisce che il testo resti centrato
  // verticalmente quando il consumer impone un'altezza fissa (es. h-10
  // in topbar, h-12 in footer-bar).
  if (!src) {
    return (
      <span
        style={style}
        className={cn(
          "font-display text-ink-hi inline-flex items-center text-[11px] font-semibold tracking-[0.15em] uppercase",
          className,
        )}
      >
        {sponsor.name}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={sponsor.name}
      width={width}
      height={height}
      style={style}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

function pickSrc(
  sponsor: SponsorLike,
  variant: "mono" | "color",
): string | null {
  if (variant === "mono") {
    return sponsor.logoMonochrome ?? sponsor.logo ?? null;
  }
  return sponsor.logo ?? null;
}
