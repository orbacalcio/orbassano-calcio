import type { ReactNode } from "react";

/**
 * Motivo SVG decorativo per gli header di pagina. Line-art in
 * `currentColor`, posizionato in assoluto sulla destra dell'header e
 * clippato dall'`overflow-hidden` del contenitore. `aria-hidden`:
 * puramente decorativo.
 *
 * Una variante per tipo di contenuto (richiesta utente 2026-05-22):
 * - storia       → trofeo (palmarès / cronistoria)
 * - biglietteria → biglietto con strappo
 * - summer-camp  → sole (camp estivo)
 * - news         → giornale
 * - squadre      → maglia da gioco
 * - gallery      → cornici foto
 * - pitch        → marcature del campo (default per tutte le altre H1)
 *
 * Il posizionamento/opacità è incapsulato qui: nelle pagine basta
 * `<HeaderMotif variant="..." />` subito dopo il blob radiale dell'header.
 */
export type HeaderMotifVariant =
  | "pitch"
  | "storia"
  | "biglietteria"
  | "summer-camp"
  | "news"
  | "squadre"
  | "gallery";

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

const MOTIFS: Record<HeaderMotifVariant, ReactNode> = {
  pitch: (
    <>
      <circle cx="120" cy="120" r="46" {...STROKE} />
      <circle cx="120" cy="120" r="3.5" fill="currentColor" />
    </>
  ),
  storia: (
    <g {...STROKE}>
      <path d="M86 66 H154 V82 C154 116 120 126 120 126 C120 126 86 116 86 82 Z" />
      <path d="M86 74 C66 74 66 102 92 104" />
      <path d="M154 74 C174 74 174 102 128 104" />
      <path d="M120 126 V144" />
      <path d="M110 144 H130 L138 160 H102 Z" />
    </g>
  ),
  biglietteria: (
    <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round" fill="none">
      <path d="M70 86 H170 a8 8 0 0 1 8 8 V104 a12 12 0 0 0 0 24 V146 a8 8 0 0 1 -8 8 H70 a8 8 0 0 1 -8 -8 V128 a12 12 0 0 0 0 -24 V94 a8 8 0 0 1 8 -8 Z" />
      <line x1="120" y1="96" x2="120" y2="144" strokeDasharray="6 7" />
    </g>
  ),
  "summer-camp": (
    <g {...STROKE}>
      <circle cx="120" cy="120" r="34" />
      <line x1="120" y1="64" x2="120" y2="78" />
      <line x1="120" y1="162" x2="120" y2="176" />
      <line x1="64" y1="120" x2="78" y2="120" />
      <line x1="162" y1="120" x2="176" y2="120" />
      <line x1="80" y1="80" x2="90" y2="90" />
      <line x1="150" y1="150" x2="160" y2="160" />
      <line x1="160" y1="80" x2="150" y2="90" />
      <line x1="90" y1="150" x2="80" y2="160" />
    </g>
  ),
  news: (
    <g {...STROKE}>
      <rect x="64" y="72" width="112" height="96" rx="6" />
      <rect x="76" y="86" width="42" height="28" rx="3" />
      <line x1="128" y1="90" x2="164" y2="90" />
      <line x1="128" y1="101" x2="164" y2="101" />
      <line x1="128" y1="112" x2="158" y2="112" />
      <line x1="76" y1="128" x2="164" y2="128" />
      <line x1="76" y1="139" x2="164" y2="139" />
      <line x1="76" y1="150" x2="140" y2="150" />
    </g>
  ),
  squadre: (
    <g {...STROKE}>
      <path d="M98 64 L74 74 L60 98 L78 112 L90 106 V172 a4 4 0 0 0 4 4 H146 a4 4 0 0 0 4 -4 V106 L162 112 L180 98 L166 74 L142 64 a22 14 0 0 1 -44 0 Z" />
      <line x1="111" y1="108" x2="111" y2="172" />
      <line x1="129" y1="108" x2="129" y2="172" />
    </g>
  ),
  gallery: (
    <g {...STROKE}>
      <rect x="84" y="72" width="96" height="76" rx="6" />
      <rect x="60" y="92" width="96" height="76" rx="6" />
      <circle cx="82" cy="114" r="8" />
      <path d="M62 166 L92 134 L112 152 L128 138 L154 166" />
    </g>
  ),
};

export function HeaderMotif({
  variant = "pitch",
}: {
  variant?: HeaderMotifVariant;
}) {
  // Il "campo" è grande e sborda parecchio a destra: ne resta visibile
  // solo un lembo (cerchio di centrocampo + area), come texture di
  // sfondo. Le icone-contenuto invece restano quasi interamente
  // visibili (sbordano appena).
  const position =
    variant === "pitch"
      ? "h-[170%] translate-x-[22%]"
      : "h-[130%] translate-x-[8%]";
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 240"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={`text-brand-gold pointer-events-none absolute top-1/2 right-0 hidden w-auto -translate-y-1/2 opacity-[0.07] sm:block ${position}`}
    >
      {MOTIFS[variant]}
    </svg>
  );
}
