import { FileDown, Users } from "lucide-react";
import type { Trasparenza5x1000Year } from "@/sanity/fetchers";
import { DestinazioneList } from "./DestinazioneList";

/**
 * Card per un singolo anno fiscale 5×1000. Mostra:
 * - Anno (in grande)
 * - Importo ricevuto + numero firme (badge top-right)
 * - Breakdown destinazione voci (DestinazioneList)
 * - Documentazione scaricabile (PDF/JPG/PNG asset URLs)
 * - Note pubbliche (eventuali)
 */
const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const num = new Intl.NumberFormat("it-IT");

export function Year5x1000Card({ data }: { data: Trasparenza5x1000Year }) {
  const docs = (data.documentazione ?? []).filter(
    (d): d is { url: string } => typeof d.url === "string" && d.url.length > 0,
  );

  return (
    <article className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-ink-low text-[11px] tracking-[0.15em] uppercase">
            Anno fiscale
          </span>
          <span className="font-display text-ink-hi text-5xl leading-none font-extrabold tracking-[0.005em] lg:text-6xl">
            {data.anno}
          </span>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {typeof data.importoRicevuto === "number" && (
            <span className="font-display text-brand-gold text-2xl font-extrabold tracking-[0.005em] lg:text-3xl">
              {euro.format(data.importoRicevuto)}
            </span>
          )}
          {typeof data.numeroFirme === "number" && (
            <span className="text-ink-mid inline-flex items-center gap-2 text-sm">
              <Users size={14} aria-hidden />
              {num.format(data.numeroFirme)} firme
            </span>
          )}
        </div>
      </header>

      {data.destinazione && data.destinazione.length > 0 && (
        <div className="mt-6">
          <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
            Destinazione delle somme
          </span>
          <DestinazioneList items={data.destinazione} />
        </div>
      )}

      {data.note && (
        <p className="text-ink-mid mt-6 text-sm leading-relaxed italic">
          {data.note}
        </p>
      )}

      {docs.length > 0 && (
        <div className="mt-6">
          <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
            Documentazione
          </span>
          <ul className="mt-3 flex flex-wrap gap-2">
            {docs.map((d, i) => (
              <li key={`${d.url}-${i}`}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border bg-surface-2 hover:border-brand-gold hover:text-brand-gold text-ink-mid inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                >
                  <FileDown size={14} aria-hidden />
                  Documento {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
