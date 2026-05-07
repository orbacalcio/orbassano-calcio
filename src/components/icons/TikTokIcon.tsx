import type { SVGProps } from "react";

/**
 * Icona TikTok (lucide-react non la espone). Tracciato semplificato in
 * stile lineare, coerente col resto del set lucide. Usata nella sidebar
 * destra desktop e nel drawer mobile.
 */
export function TikTokIcon({
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
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
