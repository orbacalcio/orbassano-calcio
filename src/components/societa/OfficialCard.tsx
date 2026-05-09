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
 * `min-h-[200px]` per dare ritmo visivo costante alla griglia 4-col,
 * indipendentemente dalla lunghezza dei nomi.
 */
type Props = { official: ClubOfficial };

export function OfficialCard({ official }: Props) {
  const displayName = official.title
    ? `${official.title} ${official.fullName}`
    : official.fullName;

  return (
    <article className="border-border bg-surface-1 hover:border-brand-gold/30 hover:bg-surface-2 group relative flex min-h-[200px] flex-col justify-between gap-6 rounded-2xl border p-6 transition-colors">
      <span
        aria-hidden
        className="bg-brand-gold absolute top-6 left-0 h-12 w-[3px] transition-all group-hover:h-16"
      />
      <span className="text-brand-gold font-mono pl-3 text-[11px] tracking-[0.15em] uppercase">
        {official.role}
      </span>
      <h3 className="font-display text-ink-hi pl-3 text-xl leading-tight font-bold tracking-[0.005em]">
        {displayName}
      </h3>
    </article>
  );
}
