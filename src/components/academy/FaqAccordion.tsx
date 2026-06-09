import type { FaqItem } from "@/sanity/fetchers";

/**
 * Accordion FAQ usando elementi nativi <details>/<summary>: zero JS,
 * accessibile out of the box (keyboard + screen reader nativi),
 * SEO-friendly (Google indicizza i <details> espansi nei rich results).
 *
 * Styling: brand-aligned (separatore navy, summary uppercase mono,
 * freccia che ruota all'apertura). Niente library esterne.
 */
export function FaqAccordion({ items, id }: { items: FaqItem[]; id?: string }) {
  if (items.length === 0) return null;
  return (
    <section
      id={id}
      aria-label="Domande frequenti"
      className="border-border/40 flex flex-col divide-y divide-border/40 border-y"
    >
      {items.map((item, i) => (
        <details
          key={`${i}-${item.question.slice(0, 32)}`}
          className="group bg-surface-0/0 hover:bg-surface-1/40 transition-colors"
        >
          <summary className="flex cursor-pointer items-start justify-between gap-4 px-2 py-5 md:px-4 md:py-6 [&::-webkit-details-marker]:hidden">
            <span className="text-ink-hi font-display text-base leading-snug font-bold tracking-[0.005em] md:text-lg">
              {item.question}
            </span>
            <span
              aria-hidden
              className="text-brand-gold mt-1 shrink-0 transition-transform duration-300 group-open:rotate-45 text-2xl leading-none font-light"
            >
              +
            </span>
          </summary>
          <div className="px-2 pt-1 pb-6 md:px-4 md:pb-7">
            <p className="text-ink-mid max-w-3xl text-sm leading-relaxed md:text-base">
              {item.answer}
            </p>
          </div>
        </details>
      ))}
    </section>
  );
}
