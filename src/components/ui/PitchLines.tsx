/**
 * Marcature di un campo da calcio stilizzate (linea mediana, cerchio di
 * centrocampo + dischetto, area di rigore + arco) usate come decorazione
 * di sfondo negli header di pagina.
 *
 * - `aria-hidden`: puramente decorativo, ignorato dagli screen reader.
 * - Usa `currentColor`: imposta il colore con una utility `text-*` e
 *   l'opacità con `opacity-*` sul wrapper/elemento.
 * - Pensato per essere posizionato in assoluto e "sbordare" oltre il
 *   bordo dell'header (clippato da `overflow-hidden` del contenitore).
 */
type Props = { className?: string };

export function PitchLines({ className }: Props) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 240"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Linea mediana */}
        <line x1="120" y1="4" x2="120" y2="236" />
        {/* Cerchio di centrocampo */}
        <circle cx="120" cy="120" r="46" />
        {/* Area di rigore (lato destro) */}
        <path d="M240 68 H182 V172 H240" />
        {/* Arco dell'area */}
        <path d="M182 96 a40 40 0 0 1 0 48" />
      </g>
      {/* Dischetto di centrocampo + dischetto del rigore */}
      <circle cx="120" cy="120" r="3.5" fill="currentColor" />
      <circle cx="198" cy="120" r="3" fill="currentColor" />
    </svg>
  );
}
