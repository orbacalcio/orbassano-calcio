import { ExternalLink, MapPin } from "lucide-react";

/**
 * Card "Sede" con nome impianto, indirizzo completo e link "Apri in
 * Google Maps". Pattern visivo coerente con /societa/impianti.
 */
export function InfoVenueBlock({
  name,
  address,
  mapsUrl,
}: {
  name: string;
  address: string | null;
  mapsUrl: string | null;
}) {
  return (
    <article
      aria-labelledby="venue-title"
      className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-8"
    >
      <div className="flex items-start gap-3">
        <MapPin
          size={28}
          className="text-brand-gold mt-1 shrink-0"
          aria-hidden
        />
        <div className="flex flex-col gap-1">
          <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
            Sede
          </span>
          <h2
            id="venue-title"
            className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
          >
            {name}
          </h2>
        </div>
      </div>
      {address && (
        <p className="text-ink-mid text-sm leading-relaxed md:text-base">
          {address}
        </p>
      )}
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-blue btn-wow-sweep btn-sweep-gold text-brand-white font-display hover:text-surface-0 focus-visible:text-surface-0 focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 md:text-sm"
        >
          Apri in Google Maps
          <ExternalLink size={14} aria-hidden />
        </a>
      )}
    </article>
  );
}
