import type { SVGProps } from "react";

/**
 * Icona Threads (Meta). Lucide non ha icona ufficiale; usiamo un
 * tracciato semplificato in stile lineare coerente col set lucide.
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
      <path d="M16.5 11.5c-2-.4-3.5-1.5-3.5-3 0-1.5 1.4-2.5 3-2.5 1.5 0 2.7.8 3.2 2" />
      <path d="M11.5 13.5c-2.4.4-4 1.6-4 3.2C7.5 18.5 9.4 19 11 19c2 0 4-1 4-4 0-3.5-2-7-7-7-3 0-5 2-5 6 0 5 4 8 9 8 4 0 7-3 7-7" />
    </svg>
  );
}
