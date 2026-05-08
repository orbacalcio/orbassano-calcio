import { cn } from "@/lib/cn";

/**
 * Placeholder ritratto giocatore: silhouette navy come watermark
 * + iniziali oro centrali. Aspect 4:5 di default. Le foto reali
 * arrivano dallo shooting previsto settembre/ottobre 2026.
 */
type Props = {
  firstName: string;
  lastName: string;
  className?: string;
};

function getInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0).toUpperCase();
  const b = lastName.trim().charAt(0).toUpperCase();
  return `${a}${b}` || "?";
}

export function PlayerPlaceholder({ firstName, lastName, className }: Props) {
  const initials = getInitials(firstName, lastName);
  return (
    <div
      aria-label={`Foto non disponibile: ${firstName} ${lastName}`}
      role="img"
      className={cn(
        "bg-surface-1 relative isolate aspect-[4/5] overflow-hidden",
        className,
      )}
    >
      <div
        aria-hidden
        className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 bg-gradient-to-br"
      />
      <svg
        aria-hidden
        viewBox="0 0 200 250"
        preserveAspectRatio="xMidYMax meet"
        className="text-surface-3 absolute inset-x-0 bottom-0 h-3/4 w-full opacity-30"
      >
        <path
          fill="currentColor"
          d="M 28 250 Q 28 168 58 148 Q 80 142 100 142 Q 120 142 142 148 Q 172 168 172 250 Z"
        />
        <circle cx="100" cy="100" r="32" fill="currentColor" />
      </svg>
      <span className="font-display text-brand-gold absolute inset-0 flex items-center justify-center text-6xl font-black tracking-[0.04em] sm:text-7xl">
        {initials}
      </span>
      <div
        aria-hidden
        className="from-surface-0/30 absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
      />
    </div>
  );
}
