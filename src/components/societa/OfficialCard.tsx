import type { ClubOfficial } from "@/sanity/fetchers";

/**
 * Card dirigente per la pagina /societa/organigramma.
 *
 * Layout text-only: l'organigramma del club non avra' foto dei
 * dirigenti, quindi niente blocco immagine + iniziali fallback (era
 * il pattern usato durante lo shooting in attesa). Resta una card
 * editoriale pulita: barra oro verticale come accento brand,
 * eyebrow ruolo, nome in display.
 *
 * Su mobile la card e' compatta (riga sottile, niente altezza minima)
 * per ridurre il "rumore" di tante card alte impilate; da sm+ torna
 * la card editoriale piena con `sm:min-h-[200px]` per dare ritmo
 * visivo costante alla griglia 4-col.
 */
type Props = { official: ClubOfficial };

export function OfficialCard({ official }: Props) {
  const displayName = official.title
    ? `${official.title} ${official.fullName}`
    : official.fullName;

  return (
    <article className="border-border bg-surface-1 hover:border-brand-gold/30 hover:bg-surface-2 group relative flex flex-col justify-between gap-1.5 rounded-2xl border p-4 transition-colors sm:min-h-[200px] sm:gap-6 sm:p-6">
      <span
        aria-hidden
        className="bg-brand-gold absolute top-4 left-0 h-9 w-[3px] transition-all group-hover:h-12 sm:top-6 sm:h-12 sm:group-hover:h-16"
      />
      <span className="text-brand-gold font-mono pl-3 text-[10px] tracking-[0.15em] uppercase sm:text-[11px]">
        {official.role}
      </span>
      <h3 className="font-display text-ink-hi pl-3 text-base leading-tight font-bold tracking-[0.005em] sm:text-xl">
        {displayName}
      </h3>
    </article>
  );
}
