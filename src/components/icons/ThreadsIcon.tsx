import type { SVGProps } from "react";

/**
 * Icona Threads — chiocciola @ stile Feather/Lucide.
 *
 * Lo SVG ufficiale Meta (path multiplo, occhio + spirale) era troppo
 * dettagliato a 16-20px e illeggibile. Stile juventus.com: glifi
 * minimali e immediatamente riconoscibili.
 *
 * Composizione:
 * - Cerchio interno (la "a" della chiocciola)
 * - Arco esterno con coda aperta in basso-sinistra (l'envelope
 *   classico della @, NON un cerchio chiuso): e' questo dettaglio
 *   che la rende leggibile come "@" e non come "target/mirino".
 */
export function ThreadsIcon({
  size = 20,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}
