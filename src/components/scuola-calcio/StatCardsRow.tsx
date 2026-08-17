/**
 * Riga di stat cards (es. "Età 5-13 anni", "Max 15 per gruppo",
 * "2 allenamenti settimanali"). Numerica grande oro, label sotto.
 *
 * Pattern visivo riusato dalla stat strip /calendario, semplificato
 * per stat informative della Scuola Calcio.
 */
export type StatCardItem = {
  value: string;
  label: string;
};

export function StatCardsRow({ items }: { items: StatCardItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex flex-col items-center text-center"
        >
          <span className="font-display text-brand-gold text-5xl leading-none font-black tracking-[0.005em] md:text-6xl">
            {item.value}
          </span>
          <span className="text-ink-mid font-mono mt-3 text-[10px] font-semibold tracking-[0.2em] uppercase md:text-xs">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
