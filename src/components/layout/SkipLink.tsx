/**
 * Link nascosto in alto-sinistra che diventa visibile al focus tastiera.
 * Permette agli utenti screen-reader e keyboard-only di saltare la
 * sidebar/topbar e arrivare direttamente al contenuto principale.
 */
export function SkipLink({
  targetId = "main-content",
  label = "Salta al contenuto",
}: {
  targetId?: string;
  label?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="bg-brand-gold text-surface-0 sr-only fixed top-4 left-4 z-[100] rounded-md px-4 py-2 text-sm font-semibold uppercase outline-none focus:not-sr-only focus:ring-2 focus:ring-white"
    >
      {label}
    </a>
  );
}
