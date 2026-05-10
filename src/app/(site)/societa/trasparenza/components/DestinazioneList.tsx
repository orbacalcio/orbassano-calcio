import type { DestinazioneVoce } from "@/sanity/fetchers";

/**
 * Lista delle voci di destinazione del 5x1000 per un dato anno.
 * Renderizza voce + importo + descrizione opzionale. Importo
 * formattato in valuta IT (€ X.XXX,XX).
 */
const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function DestinazioneList({ items }: { items: DestinazioneVoce[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="border-border/50 mt-4 flex flex-col divide-y rounded-2xl border">
      {items.map((d, i) => (
        <li
          key={`${d.voce ?? "voce"}-${i}`}
          className="flex flex-col gap-1 p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
              {d.voce ?? "—"}
            </span>
            {typeof d.importo === "number" && (
              <span className="font-mono text-brand-gold text-sm font-semibold">
                {euro.format(d.importo)}
              </span>
            )}
          </div>
          {d.descrizione && (
            <p className="text-ink-mid text-sm leading-relaxed">
              {d.descrizione}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
