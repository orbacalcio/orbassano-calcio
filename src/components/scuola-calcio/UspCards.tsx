import type { UspCard } from "@/sanity/fetchers";

/**
 * 4 card numerate con i punti di forza della Scuola Calcio.
 * Pattern visivo: numero gigante oro/40% a watermark, titolo display
 * bold uppercase, descrizione body. Hover: bordo rossoblu' sopra +
 * numero passa a oro pieno.
 *
 * I dati arrivano da settings.scUspCards (array di {number, title,
 * description}) — se vuoto/parziale la pagina non rendera' questa
 * sezione (controllo in /squadre/scuola-calcio/page.tsx).
 */
export function UspCards({ cards }: { cards: UspCard[] }) {
  return (
    <section
      aria-label="Punti di forza della Scuola Calcio"
      className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.number + card.title}
          className="bg-surface-0 group relative flex flex-col gap-4 overflow-hidden p-6 md:p-8 lg:p-10"
        >
          <div
            aria-hidden
            className="bg-brand-red absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
          />
          <span
            aria-hidden
            className="font-display text-brand-gold/30 text-7xl leading-none font-black tracking-[0.005em] transition-colors duration-300 group-hover:text-brand-gold/60 md:text-8xl"
          >
            {card.number}
          </span>
          <h3 className="font-display text-ink-hi text-xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-2xl">
            {card.title}
          </h3>
          <p className="text-ink-mid text-sm leading-relaxed md:text-base">
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}
