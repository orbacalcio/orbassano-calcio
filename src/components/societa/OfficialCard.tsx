import type { ClubOfficial } from "@/sanity/fetchers";

/**
 * Voce dirigente per la pagina /societa/organigramma.
 *
 * Layout text-only, SENZA box (richiesta utente 2026-05-22): niente
 * riquadro navy, solo una barra oro verticale come accento brand,
 * eyebrow ruolo (mono gold) e nome grande in display su sfondo chiaro
 * (la sezione organigramma e' light-bg). Piu' editoriale ed elegante
 * delle vecchie card. Disposte in griglia unica ordinata per `order`.
 */
type Props = { official: ClubOfficial };

export function OfficialCard({ official }: Props) {
  const displayName = official.title
    ? `${official.title} ${official.fullName}`
    : official.fullName;

  return (
    <article className="border-brand-gold/70 flex flex-col gap-1.5 border-l-2 py-1 pl-5">
      <span className="text-brand-gold font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
        {official.role}
      </span>
      <h3 className="font-display text-light-ink-hi text-2xl leading-[1.05] font-extrabold tracking-[0.005em] uppercase sm:text-3xl">
        {displayName}
      </h3>
    </article>
  );
}
