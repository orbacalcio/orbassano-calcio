import { CalendarDays, Download, ExternalLink, MapPin } from "lucide-react";
import { isSafeUrl } from "@/lib/validation";
import { APP_TIME_ZONE, getRomeDateParts } from "@/lib/date";

/**
 * Gruppo eventi (Open Days o Tornei) di UNA categoria. La pagina
 * settore-giovanile/open-days e settore-giovanile/tornei rende uno
 * di questi gruppi per categoria, con la stessa estetica tabellare
 * vista nel vecchio sito (DATA / GIORNO / ORARIO / INDIRIZZO).
 *
 * Componente generico: la pagina passa solo l'array di righe gia'
 * normalizzate. Tutta la logica di parsing date/orario/CTA vive qui,
 * non nelle pagine.
 */
const ITALIAN_DAYS = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

export type EventRow = {
  id: string;
  /** Titolo per accessibility / preview Studio (NON renderizzato). */
  title: string;
  /** ISO datetime (start). */
  date: string;
  /** ISO datetime (end, opzionale) — tornei multi-day. */
  endDate?: string | null;
  /** Stringa orario di fine (es. "19:30"). Solo per Open Day. */
  endTime?: string | null;
  /** Indirizzo completo. */
  venue: string;
  /** Link Google Maps opzionale: se presente compare "Apri su Google Maps". */
  mapsUrl?: string | null;
  /** Note libere. Mostrate sotto la riga in italic. */
  notes?: string | null;
  /** Tag opzionali (es. "Triangolare", "Trofeo + medaglie"). */
  tags?: Array<string | null | undefined>;
  /** CTA opzionale (modulo iscrizione, bando). */
  cta?: {
    label: string;
    href: string;
    /** Icona: Download per PDF/moduli, ExternalLink per Google Form/Drive. */
    icon: "download" | "external";
  } | null;
};

export function YouthEventGroup({
  category,
  rows,
  emptyLabel = "Nessuna data pubblicata.",
}: {
  category: string;
  rows: EventRow[];
  emptyLabel?: string;
}) {
  return (
    <section
      aria-labelledby={`group-${slugify(category)}`}
      className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8"
    >
      <h2
        id={`group-${slugify(category)}`}
        className="font-display text-ink-hi mb-5 text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase lg:text-3xl"
      >
        {category}
      </h2>

      {rows.length === 0 ? (
        <p className="text-ink-mid text-sm italic">{emptyLabel}</p>
      ) : (
        <ul className="divide-border/40 flex flex-col divide-y">
          {rows.map((row) => (
            <EventRowItem key={row.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EventRowItem({ row }: { row: EventRow }) {
  const d = getRomeDateParts(row.date);
  const day = String(d.day).padStart(2, "0");
  const month = String(d.month + 1).padStart(2, "0");
  const year = d.year;
  const weekday = ITALIAN_DAYS[d.weekday] ?? "—";
  const startTime = new Date(row.date).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  });
  // Fine: priorita' a endDate (multi-day torneo), poi endTime (Open Day),
  // poi niente.
  let timeRange = startTime;
  if (row.endDate) {
    const e = getRomeDateParts(row.endDate);
    const ed = String(e.day).padStart(2, "0");
    const em = String(e.month + 1).padStart(2, "0");
    timeRange = `${startTime} → ${ed}/${em}`;
  } else if (row.endTime) {
    timeRange = `${startTime} - ${row.endTime}`;
  }
  const tags = (row.tags ?? []).filter(
    (t): t is string => typeof t === "string" && t.trim().length > 0,
  );
  const ctaSafe = row.cta && isSafeUrl(row.cta.href) ? row.cta : null;
  const mapsSafe =
    row.mapsUrl && isSafeUrl(row.mapsUrl) ? row.mapsUrl : null;
  return (
    <li className="flex flex-col gap-3 py-4 md:grid md:grid-cols-[7rem_8rem_1fr_auto] md:items-start md:gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
          Data
        </span>
        <span className="font-display text-ink-hi text-base font-bold tracking-wide">
          {day}/{month}/{year}
        </span>
        <span className="text-ink-mid text-xs">{weekday}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
          Orario
        </span>
        <span className="text-ink-hi font-mono text-sm">{timeRange}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
          Indirizzo
        </span>
        <span className="text-ink-hi inline-flex items-start gap-1.5 text-sm leading-relaxed">
          <MapPin
            size={14}
            className="text-brand-gold mt-0.5 shrink-0"
            aria-hidden
          />
          {row.venue}
        </span>
        {mapsSafe && (
          <a
            href={mapsSafe}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:text-ink-hi inline-flex w-fit items-center gap-1 text-xs font-semibold tracking-[0.02em] transition-colors"
          >
            <MapPin size={12} aria-hidden />
            Apri su Google Maps
            <ExternalLink size={11} aria-hidden />
          </a>
        )}
        {row.notes && (
          <p className="text-ink-mid text-xs italic leading-relaxed">
            {row.notes}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border-border bg-surface-2 text-ink-mid rounded-sm border px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {ctaSafe && (
        <a
          href={ctaSafe.href}
          target="_blank"
          rel="noopener noreferrer"
          className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-surface-0 focus-visible:outline-brand-gold inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {ctaSafe.icon === "download" ? (
            <Download size={12} aria-hidden />
          ) : (
            <ExternalLink size={12} aria-hidden />
          )}
          {ctaSafe.label}
        </a>
      )}

      {/* Mobile: icona calendar a fianco del weekday per uniformare
          la lettura quando la riga si squadra su mobile. */}
      <CalendarDays
        size={14}
        className="text-ink-low hidden"
        aria-hidden
      />
    </li>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
