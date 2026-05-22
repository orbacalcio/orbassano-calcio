import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Hub della Prima Squadra: 4 box con foto di sfondo (gestite da Studio →
 * Impostazioni globali → "Pagina Prima Squadra"), titolo in overlay e
 * CTA. Sostituisce la vecchia pagina rosa come landing della voce
 * Squadre → Prima Squadra (la rosa vive ora su /prima-squadra/rosa).
 *
 * Link:
 *  - La Rosa → /squadre/prima-squadra/rosa
 *  - Le ultime news → /news filtrata per categoria Prima Squadra
 *  - Calendario e risultati → /squadre/prima-squadra/calendario
 *  - Classifica → link esterno editabile da Studio (fallback al calendario)
 */
export type PrimaSquadraHubData = {
  rosaImage: string | null;
  newsImage: string | null;
  calendarioImage: string | null;
  classificaImage: string | null;
  classificaUrl: string | null;
};

type Box = {
  title: string;
  href: string;
  image: string | null;
  external: boolean;
};

export function PrimaSquadraHub({
  rosaImage,
  newsImage,
  calendarioImage,
  classificaImage,
  classificaUrl,
}: PrimaSquadraHubData) {
  const boxes: Box[] = [
    {
      title: "La Rosa",
      href: "/squadre/prima-squadra/rosa",
      image: rosaImage,
      external: false,
    },
    {
      title: "Le ultime news",
      href: "/news?categoria=Prima%20Squadra",
      image: newsImage,
      external: false,
    },
    {
      title: "Calendario e risultati",
      href: "/squadre/prima-squadra/calendario",
      image: calendarioImage,
      external: false,
    },
    {
      title: "Classifica",
      // Se il link esterno non è impostato, il box rimanda al calendario
      // (dove vivono i link a classifica/statistiche del campionato).
      href: classificaUrl || "/squadre/prima-squadra/calendario",
      image: classificaImage,
      external: !!classificaUrl,
    },
  ];

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Prima Squadra
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Prima Squadra
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Tutto sul rossoblù che scende in campo: la rosa, le ultime
              notizie, il calendario con i risultati e la classifica del
              campionato.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {boxes.map((box) => (
            <HubCard key={box.title} box={box} />
          ))}
        </div>
      </Container>
    </>
  );
}

function HubCard({ box }: { box: Box }) {
  const inner = (
    <>
      {box.image ? (
        <Image
          src={box.image}
          alt=""
          fill
          aria-hidden
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      ) : (
        <div
          aria-hidden
          className="from-surface-2 via-surface-1 to-brand-blue/40 absolute inset-0 bg-gradient-to-br"
        />
      )}
      {/* Gradiente per leggibilità del testo in basso. */}
      <div
        aria-hidden
        className="from-surface-0/90 via-surface-0/30 absolute inset-0 bg-gradient-to-t to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 lg:p-8">
        <h2 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl lg:text-4xl">
          {box.title}
        </h2>
        <ArrowUpRight
          size={28}
          className="text-brand-gold mb-1 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          aria-hidden
        />
      </div>
    </>
  );

  const className =
    "group focus-visible:outline-brand-gold relative flex aspect-[16/10] overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 sm:aspect-[4/3] lg:aspect-[16/9]";

  if (box.external) {
    return (
      <a
        href={box.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={box.href} className={className}>
      {inner}
    </Link>
  );
}
