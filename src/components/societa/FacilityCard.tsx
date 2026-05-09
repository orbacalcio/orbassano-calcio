import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import type { Facility } from "@/sanity/fetchers";

/**
 * Card per un singolo impianto sportivo. Layout editoriale:
 * - immagine principale 16:9 (prima della gallery; fallback gradient se assente)
 * - corpo: nome + indirizzo + caratteristiche (lista) + descrizione PortableText
 * - footer: link Google Maps come CTA outline
 *
 * Le immagini extra della gallery vengono mostrate sotto sotto la card
 * principale come strip 4-up (rendering condizionale).
 */
type Props = {
  facility: Facility;
  index: number;
};

export function FacilityCard({ facility, index }: Props) {
  const main = facility.gallery?.[0];
  const extra = facility.gallery?.slice(1) ?? [];

  return (
    <article className="border-border bg-surface-1 flex flex-col overflow-hidden rounded-3xl border">
      <div className="relative aspect-[16/9] overflow-hidden">
        {main?.url ? (
          <Image
            src={main.url}
            alt={main.alt ?? `Impianto ${facility.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            placeholder={main.lqip ? "blur" : "empty"}
            blurDataURL={main.lqip ?? undefined}
          />
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 flex items-end bg-gradient-to-br p-6"
          >
            <span className="font-display text-surface-3/60 text-7xl leading-[0.85] font-black tracking-[0.005em] uppercase lg:text-8xl">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="from-surface-0/85 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>

      <div className="flex flex-col gap-5 p-8">
        <div className="flex flex-col gap-2">
          <span className="text-brand-gold font-mono text-[11px] tracking-[0.15em] uppercase">
            Impianto {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase sm:text-3xl">
            {facility.name}
          </h2>
          {facility.address && (
            <span className="text-ink-mid flex items-start gap-2 text-sm">
              <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
              {facility.address}
            </span>
          )}
        </div>

        {facility.fields && facility.fields.length > 0 && (
          <ul className="border-border/50 flex flex-col gap-2 border-t pt-4">
            {facility.fields.map((line, i) => (
              <li
                key={`${facility._id}-field-${i}`}
                className="text-ink-mid flex items-start gap-2 text-sm"
              >
                <span
                  aria-hidden
                  className="bg-brand-gold mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                />
                {line}
              </li>
            ))}
          </ul>
        )}

        {facility.description && (
          <PortableTextBody value={facility.description} />
        )}

        {facility.mapsUrl && (
          <a
            href={facility.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <MapPin size={14} aria-hidden />
            Apri su Google Maps
            <ExternalLink size={12} aria-hidden />
          </a>
        )}
      </div>

      {extra.length > 0 && (
        <div className="border-border/40 grid grid-cols-2 gap-px border-t bg-border sm:grid-cols-4">
          {extra.map((img, i) =>
            img.url ? (
              <div
                key={`${facility._id}-extra-${i}`}
                className="bg-surface-1 relative aspect-square"
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? facility.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  placeholder={img.lqip ? "blur" : "empty"}
                  blurDataURL={img.lqip ?? undefined}
                />
              </div>
            ) : null,
          )}
        </div>
      )}
    </article>
  );
}
