import { Wallet } from "lucide-react";
import type { PaymentRow } from "@/sanity/fetchers";

/**
 * Timeline scadenze pagamento: lista verticale con linea connettrice
 * sinistra (dot + segmento), pattern visivo step/milestone.
 */
export function PaymentTimelineBlock({
  payments,
}: {
  payments: PaymentRow[];
}) {
  if (payments.length === 0) return null;
  return (
    <ol className="border-border bg-surface-1 flex flex-col gap-0 overflow-hidden rounded-2xl border">
      {payments.map((p, i) => (
        <li
          key={`${p.milestone}-${i}`}
          className="border-border/40 flex flex-col gap-3 border-t p-6 first:border-t-0 md:flex-row md:items-start md:gap-6"
        >
          <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-start md:gap-1">
            <div
              aria-hidden
              className="bg-brand-red text-brand-white flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold"
            >
              {i + 1}
            </div>
            <Wallet
              size={18}
              className="text-brand-gold hidden shrink-0 md:block"
              aria-hidden
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-brand-gold font-mono text-[10px] tracking-[0.18em] uppercase">
              {p.milestone}
            </span>
            <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl">
              {p.amount}
            </span>
            {p.deadline && (
              <span className="text-ink-mid text-sm font-semibold">
                {p.deadline}
              </span>
            )}
            {p.note && (
              <p className="text-ink-mid mt-1 text-sm leading-relaxed">
                {p.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
