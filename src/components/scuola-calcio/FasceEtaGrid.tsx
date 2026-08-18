import Image from "next/image";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import type { ScuolaCalcioFascia } from "@/sanity/fetchers";

/**
 * Grid card delle annate attive della Scuola Calcio (es. "Esordienti
 * 2015", "Esordienti 2014"). Ogni card mostra: foto rappresentativa,
 * formato di gioco + anno di corso, nome dell'annata e focus tecnico
 * (PortableText).
 *
 * Layout responsive: 1 col mobile, 2 col tablet, 3 col desktop.
 */
export function FasceEtaGrid({ fasce }: { fasce: ScuolaCalcioFascia[] }) {
  if (fasce.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {fasce.map((fascia) => (
        <article
          key={fascia.label}
          className="border-border bg-surface-1 flex flex-col overflow-hidden rounded-2xl border"
        >
          {fascia.image ? (
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={fascia.image}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                placeholder={fascia.imageLqip ? "blur" : "empty"}
                blurDataURL={fascia.imageLqip ?? undefined}
              />
              <div
                aria-hidden
                className="from-surface-0/70 absolute inset-0 bg-gradient-to-t to-transparent"
              />
            </div>
          ) : (
            <div
              aria-hidden
              className="from-surface-2 via-surface-1 to-brand-blue/20 relative aspect-[4/3] bg-gradient-to-br"
            />
          )}
          <div className="flex flex-col gap-3 p-6">
            <div className="flex flex-col gap-1">
              <span className="text-brand-gold font-mono text-xs tracking-[0.15em] uppercase">
                {fascia.ageRange}
              </span>
              <h3 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase">
                {fascia.label}
              </h3>
            </div>
            {fascia.focus && fascia.focus.length > 0 && (
              <PortableTextBody
                value={fascia.focus}
                variant="dark"
                className="text-sm leading-relaxed"
              />
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
