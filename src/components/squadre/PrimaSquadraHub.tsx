import Image from "next/image";
import Link from "next/link";

/**
 * Hub della Prima Squadra: 4 box full-bleed (pattern juventus.com) con
 * foto di sfondo gestite da Studio (Impostazioni globali → "Pagina Prima
 * Squadra"), eyebrow + titolo grande in overlay e bottone "Scopri di
 * più". Sostituisce la vecchia pagina rosa come landing della voce
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

  // Griglia full-bleed 2×2 (1 colonna su mobile). Spazio (navy) tra le
  // righe via gap-y; nessuna linea rossa orizzontale. La linea rossa
  // verticale (3px) tra le due colonne è un bordo destro sui box di
  // sinistra (solo da sm+).
  return (
    <div className="bg-light-bg-0 grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:gap-y-24">
      {boxes.map((box, i) => (
        <HubCard key={box.title} box={box} leftColumn={i % 2 === 0} />
      ))}
    </div>
  );
}

function HubCard({ box, leftColumn }: { box: Box; leftColumn: boolean }) {
  const inner = (
    <>
      {box.image ? (
        <Image
          src={box.image}
          alt=""
          fill
          aria-hidden
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      ) : (
        <div
          aria-hidden
          className="from-surface-2 via-surface-1 to-brand-blue/40 absolute inset-0 bg-gradient-to-br"
        />
      )}
      {/* Layer navy in "multiply": uniforma foto con colori diversi
          tirandole verso il navy del brand (effetto duotone). Schiarisce
          un po' all'hover per dare focus al box puntato. */}
      <div
        aria-hidden
        className="bg-brand-blue absolute inset-0 opacity-55 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40"
      />
      {/* Leggero scurimento uniforme + gradiente dal basso per la
          leggibilità di eyebrow + titolo. */}
      <div aria-hidden className="bg-surface-0/20 absolute inset-0" />
      <div
        aria-hidden
        className="from-surface-0/90 via-surface-0/20 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      {/* Eyebrow + titolo: centrati verticalmente nel box, più grandi.
          Titolo con max-width in ch → va a capo quando lungo
          (es. "Calendario e risultati"). */}
      <div className="relative flex h-full w-full flex-col items-start justify-center px-6 sm:px-8 lg:px-12">
        <span className="text-brand-red font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base lg:text-lg">
          Prima Squadra
        </span>
        <h2 className="font-display text-ink-hi mt-3 max-w-[14ch] text-5xl leading-[0.95] font-extrabold tracking-[0.005em] text-balance uppercase sm:text-6xl lg:text-7xl">
          {box.title}
        </h2>
      </div>
      {/* Bottone: ancorato in fondo al box (invariato). */}
      <div className="absolute inset-x-0 bottom-10 px-6 sm:px-8 lg:bottom-14 lg:px-12">
        <span className="bg-brand-white text-surface-0 font-display group-hover:bg-brand-gold inline-flex w-fit items-center rounded-full px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-300 md:text-sm">
          Scopri di più
        </span>
      </div>
    </>
  );

  // Box alti che riempiono la pagina: ~metà viewport ciascuno (2 righe).
  // I box di sinistra portano il divisorio verticale rosso 3px (solo sm+).
  const className = `group focus-visible:outline-brand-gold relative isolate flex min-h-[58vh] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 lg:min-h-[60vh]${
    leftColumn ? " sm:border-r-[3px] sm:border-brand-red" : ""
  }`;

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
