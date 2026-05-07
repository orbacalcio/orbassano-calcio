import type { SVGProps } from "react";

/**
 * Icona Threads — variante semplificata "chiocciola @".
 *
 * Lo SVG ufficiale Meta (path multiplo, occhio + spirale) era troppo
 * dettagliato a 16-20px e illeggibile. Stile juventus.com: glifi
 * minimali e immediatamente riconoscibili. Qui usiamo una @ classica
 * (cerchio con punto interno + coda parziale) che e' lo glifo che
 * l'utente associa istintivamente a Threads.
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
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
      <path d="M15.5 12v2.2c0 1.5 1 2.3 2.2 2.3 1.7 0 3.3-1.4 3.3-4.5" />
    </svg>
  );
}
