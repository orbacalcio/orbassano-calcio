import { Tag } from "lucide-react";
import type { DiscountRow } from "@/sanity/fetchers";

/**
 * Lista degli sconti famiglie / early-bird applicabili all'iscrizione
 * Scuola Calcio. Card a 3 colonne (responsive), pattern visivo coerente con
 * Toro Camp informazioni-i-camp.
 */
export function DiscountsBlock({ discounts }: { discounts: DiscountRow[] }) {
  if (discounts.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {discounts.map((d) => (
        <li
          key={`${d.label}-${d.value}`}
          className="border-border bg-surface-1 flex flex-col gap-3 rounded-2xl border p-6"
        >
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-brand-gold shrink-0" aria-hidden />
            <span className="text-brand-gold font-mono text-[10px] tracking-[0.18em] uppercase">
              {d.label}
            </span>
          </div>
          <span className="font-display text-ink-hi text-4xl leading-none font-black tracking-[0.005em] md:text-5xl">
            {d.value}
          </span>
          {d.condition && (
            <p className="text-ink-mid text-sm leading-relaxed">
              {d.condition}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
