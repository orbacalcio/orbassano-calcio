import type { ReactNode } from "react";

/**
 * Articolo numerato del Codice Etico (es. "3.1", "5.6").
 * Numero in oro a sx, contenuto a dx con justify + hyphens.
 *
 * Anchor `id="art-N-N"` per linking esterno (citazioni profonde dal
 * sistema sanzionatorio, comunicazioni interne).
 */
export function Article({
  number,
  children,
  className,
}: {
  number: string;
  children: ReactNode;
  className?: string;
}) {
  const id = `art-${number.replace(/\./g, "-")}`;
  return (
    <article
      id={id}
      className={`scroll-mt-24 grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 sm:gap-x-5 ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="font-display text-brand-gold font-mono text-sm font-bold tracking-wide select-none sm:text-base"
      >
        {number}
      </span>
      <div className="text-light-ink-mid hyphens-auto text-justify text-[0.95rem] leading-relaxed [&_strong]:text-light-ink-hi [&_strong]:font-semibold">
        <span className="sr-only">Articolo {number}: </span>
        {children}
      </div>
    </article>
  );
}

/**
 * Lista puntata dentro un articolo. Convenzione del Codice: trattino
 * lungo "—" come bullet invece del punto, allineamento con corpo testo.
 */
export function ArticleList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={`mt-3 flex flex-col gap-2 ${className ?? ""}`}
    >
      {children}
    </ul>
  );
}

export function ArticleListItem({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-2.5">
      <span aria-hidden className="text-brand-gold select-none">
        —
      </span>
      <span>{children}</span>
    </li>
  );
}

/**
 * Sezione interna a un capitolo (h3). Usata dentro <Chapter> per
 * raggruppare articoli logicamente correlati (es. "Comportamento in
 * campo" dentro Cap. 5 Calciatori).
 */
export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-5 ${className ?? ""}`}>
      <h3 className="font-display text-light-ink-hi text-xl font-bold tracking-[0.005em] uppercase sm:text-2xl">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/**
 * Wrapper di un capitolo (h2 + numero). Anchor `id="cap-N"` per TOC.
 */
export function Chapter({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`cap-${parseInt(number, 10)}`}
      className="scroll-mt-24 flex flex-col gap-8 border-t border-light-border/40 pt-12 first-of-type:border-0 first-of-type:pt-0"
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-brand-gold text-xs font-bold tracking-[0.25em] uppercase">
          Capitolo {number}
        </span>
        <h2 className="font-display text-light-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </header>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}
