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
      // Resta sempre `fixed` (niente sr-only/not-sr-only che resetta
      // position: static e faceva srotolare il link come barra a tutta
      // larghezza al focus). Nascosto fuori dal viewport con translate,
      // scivola dentro solo al focus tastiera.
      className="bg-brand-gold text-surface-0 focus-visible:ring-white fixed top-4 left-4 z-[100] -translate-y-[150%] rounded-md px-4 py-2 text-sm font-semibold uppercase outline-none transition-transform duration-200 focus:translate-y-0 focus-visible:ring-2"
    >
      {label}
    </a>
  );
}
