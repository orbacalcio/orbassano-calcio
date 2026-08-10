import type { MatchCompetitionCategory } from "@/sanity/fetchers";

/**
 * Icona accanto al nome della competizione nelle MatchCard, per
 * distinguere a colpo d'occhio le gare quando in elenco convivono piu'
 * competizioni (tipico della Prima Squadra: Prima Categoria + Coppa
 * Piemonte mescolate in ordine cronologico).
 *
 * - scudetto -> campionato e playoff
 * - coppa    -> coppe e tornei
 * - amichevoli: nessuna icona (non sono competizioni ufficiali)
 *
 * SVG inline e non icone lucide: servono forme riconoscibili anche a
 * 13px, dove gli stroke sottili di lucide sbiadiscono. Le sagome sono
 * quindi piene, con i soli manici della coppa a stroke.
 *
 * Usa `currentColor`: il colore si imposta dal chiamante con le utility
 * di testo (nelle MatchCard e' brand-gold).
 */
type Props = {
  category: MatchCompetitionCategory | null | undefined;
  /** Lato in px del box quadrato. Default 13, allineato al testo xs. */
  size?: number;
  className?: string;
};

export function CompetitionIcon({ category, size = 13, className }: Props) {
  if (!category || category === "friendly") return null;

  const isCup = category === "cup" || category === "tournament";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable="false"
    >
      {isCup ? (
        <>
          {/* Coppa: vasca + stelo + base, manici a stroke.
              Curve cubiche invece di archi: resa piu' prevedibile alle
              dimensioni ridotte. */}
          <path d="M7.5 3h9v5.5c0 2.5-2 4.5-4.5 4.5c-2.5 0-4.5-2-4.5-4.5V3z" />
          <path d="M11 13.2h2v5.4h-2z" />
          <path d="M7.8 18.6h8.4V21H7.8z" />
          <path
            d="M7.5 4.7C5.7 4.7 4.4 5.7 4.4 7c0 1.3 1.3 2.3 3.1 2.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16.5 4.7c1.8 0 3.1 1 3.1 2.3 0 1.3-1.3 2.3-3.1 2.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : (
        /* Scudetto: bordo superiore dritto, fianchi che convergono in
           punta verso il basso (sagoma crest classica) */
        <path d="M4 3h16v8c0 4.9-3.3 8.6-8 10.8C7.3 19.6 4 15.9 4 11V3z" />
      )}
    </svg>
  );
}
