import type { ClubOfficial } from "@/sanity/fetchers";

/**
 * Voce dirigente per la pagina /societa/organigramma.
 *
 * Layout text-only, SENZA box e CENTRATO (richiesta utente 2026-05-22):
 * niente riquadro, nome grande in display + ruolo eyebrow oro sotto,
 * tutto centrato su ogni breakpoint. Usata nei due livelli Presidente /
 * Consiglio Direttivo (disposte in flex-wrap centrato).
 */
type Props = { official: ClubOfficial };

export function OfficialCard({ official }: Props) {
  const displayName = official.title
    ? `${official.title} ${official.fullName}`
    : official.fullName;

  return (
    <article className="flex w-full max-w-[18rem] flex-col items-center gap-1.5 text-center sm:w-auto sm:min-w-[12rem]">
      <h3 className="font-display text-light-ink-hi text-xl leading-tight font-normal tracking-[0.01em] sm:text-2xl">
        {displayName}
      </h3>
      <span className="text-light-ink-mid font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
        {official.role}
      </span>
    </article>
  );
}
