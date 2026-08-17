import Image from "next/image";
import Link from "next/link";

/**
 * Hub 4-box stile PrimaSquadraHub adattato per la Scuola Calcio.
 * 4 box full-bleed con foto di sfondo, overlay navy multiply,
 * titolo overlay e bordo verticale rossoblu' (pattern juventus.com).
 *
 * I 4 box puntano a: /squadre/scuola-calcio/iscriviti, /programma,
 * /informazioni, e un'ancora #faq in pagina (FAQ accordion sotto).
 *
 * Quando un'immagine manca, fallback con gradient navy + nome del box.
 */
export type Hub4BoxItem = {
  title: string;
  href: string;
  image: string | null;
};

export function ScuolaCalcioHub4Box({ boxes }: { boxes: Hub4BoxItem[] }) {
  return (
    <section
      aria-label="Esplora la Scuola Calcio"
      className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-2"
    >
      {boxes.map((box) => (
        <Link
          key={box.href}
          href={box.href}
          className="group bg-surface-0 focus-visible:outline-brand-gold relative isolate flex aspect-[4/3] items-end overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 sm:aspect-[5/4] md:aspect-[16/10]"
        >
          {box.image ? (
            <Image
              src={box.image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <div
              aria-hidden
              className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 bg-gradient-to-br"
            />
          )}
          {/* Overlay multiply per leggibilita' titolo + bordo verticale
              rossoblu' sul lato sinistro al hover (pattern PrimaSquadraHub). */}
          <div
            aria-hidden
            className="bg-brand-blue absolute inset-0 opacity-30 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-15"
          />
          <div
            aria-hidden
            className="from-surface-0/95 via-surface-0/40 absolute inset-0 bg-gradient-to-t to-transparent"
          />
          <div
            aria-hidden
            className="bg-brand-red absolute top-6 bottom-6 left-0 w-1 origin-top scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100"
          />
          <div className="relative z-10 flex items-center justify-between gap-4 p-6 md:p-8 lg:p-10 w-full">
            <h2 className="font-display text-ink-hi text-3xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-4xl lg:text-5xl">
              {box.title}
            </h2>
            <span
              aria-hidden
              className="text-brand-gold font-display text-xs font-bold tracking-[0.18em] uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:text-sm"
            >
              Scopri →
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
