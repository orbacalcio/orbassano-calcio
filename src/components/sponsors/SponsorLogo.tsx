import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Renderer atomico del logo sponsor — strict mode.
 *
 * Decisione di brand (vedi commit feat(sponsors): SponsorLogo strict):
 * niente filtro CSS automatico per derivare il monochrome dal logo a
 * colori. `brightness(0) invert(1)` rende male su loghi complessi
 * (gradient, multi-color, dettagli sottili come la banda gialla del
 * Reale Mutua) e l'admin del club preferisce gestire le versioni
 * monocromatiche manualmente con Photoshop, caso per caso.
 *
 * Comportamento:
 *
 * - variant="mono"  → usa sponsor.logoMonochrome se presente.
 *                     Se assente → fallback testuale `name` in Big
 *                     Shoulders Display 600, tracking-[0.15em],
 *                     uppercase, color text-ink-hi (#f5f7fa, "bianco
 *                     navy" del brand: la linea guida del progetto
 *                     evita il bianco puro).
 *
 * - variant="color" → usa sponsor.logo se presente.
 *                     Se assente → stesso fallback testuale; il color
 *                     di default text-ink-hi e' overridabile via
 *                     `className` quando il contesto e' chiaro/neutro.
 *
 * Mai usare sponsor.logo con filter CSS in variant="mono".
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
};

export function SponsorLogo({
  sponsor,
  variant,
  width = 100,
  height = 20,
  className,
}: Props) {
  const src =
    variant === "mono" ? (sponsor.logoMonochrome ?? null) : sponsor.logo;

  // Asset assente per la variant richiesta → fallback testuale.
  // `inline-flex items-center` garantisce che il testo resti centrato
  // verticalmente quando il consumer impone un'altezza fissa (es. h-5
  // in topbar, h-12 in footer-bar).
  if (!src) {
    return (
      <span
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
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
