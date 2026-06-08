import Image from "next/image";

/**
 * Fallback "wow" per l'hero di una squadra quando non c'e' heroImage
 * caricata su Sanity (default state, da popolare in Studio).
 *
 * Stratificazione visiva (dal basso verso l'alto):
 *  1. Sfondo navy bg-surface-0 (base)
 *  2. Pitch lines SVG (campo da calcio top-down): contorno, centro,
 *     circle, due aree di rigore + porte + arche. Stroke bianco
 *     low opacity, tono editoriale tattico
 *  3. Watermark del nome squadra in oro/13% — gigante, font display
 *     900, uppercase, allineato in basso-sx
 *  4. Stemma club centrato, opacity bassa (~22%) — identita' visiva
 *     del club anche senza foto
 *  5. Gradient bottom-to-top per leggibilita' del testo h1+eyebrow
 *     del header (gestito da page.tsx)
 *
 * Quando si carica una heroImage in Studio, il fallback viene
 * sostituito dalla foto reale + overlay multiply navy.
 */
export function TeamHeroFallback({ teamName }: { teamName: string }) {
  return (
    <>
      {/* Base navy: garantisce contrasto col testo bianco del header */}
      <div aria-hidden className="bg-surface-0 absolute inset-0" />

      {/* Pitch lines: SVG inline (viewBox 1200x800, proporzioni
          campo reale ~ 105x68m). Stroke bianco low-opacity, fill
          trasparente. preserveAspectRatio xMidYMid slice = riempie
          il contenitore mantenendo proporzioni (taglio invece di
          deformazione). Stroke 1.5px su viewBox 1200 = ~1.5px
          renderizzati anche su mobile (leggermente piu' sottili su
          desktop per via dello scaling). */}
      <svg
        aria-hidden
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        // hidden md:block (>=768px): mobile = pulito col solo stemma,
        // tablet/desktop = pitch lines decorativo. Decisione 2026-06-06:
        // su mobile l'hero e' alto/stretto, le pitch lines si comprimono
        // male e affollano lo spazio col watermark + h1.
        className="text-ink-hi/20 absolute inset-0 hidden h-full w-full md:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {/* Contorno campo */}
        <rect x="40" y="40" width="1120" height="720" />
        {/* Linea di metà campo */}
        <line x1="600" y1="40" x2="600" y2="760" />
        {/* Cerchio di centrocampo + dischetto */}
        <circle cx="600" cy="400" r="90" />
        <circle cx="600" cy="400" r="3" fill="currentColor" />
        {/* Area di rigore sinistra + porta + dischetto */}
        <rect x="40" y="240" width="180" height="320" />
        <rect x="40" y="320" width="60" height="160" />
        <circle cx="160" cy="400" r="3" fill="currentColor" />
        <path d="M 220 340 A 90 90 0 0 1 220 460" />
        {/* Area di rigore destra + porta + dischetto */}
        <rect x="980" y="240" width="180" height="320" />
        <rect x="1100" y="320" width="60" height="160" />
        <circle cx="1040" cy="400" r="3" fill="currentColor" />
        <path d="M 980 340 A 90 90 0 0 0 980 460" />
        {/* Quattro corner arc */}
        <path d="M 40 50 A 10 10 0 0 0 50 40" />
        <path d="M 40 750 A 10 10 0 0 1 50 760" />
        <path d="M 1160 50 A 10 10 0 0 1 1150 40" />
        <path d="M 1160 750 A 10 10 0 0 0 1150 760" />
      </svg>

      {/* Watermark nome squadra: display 900 oro/13% in basso a sx,
          taglia il viewport per dare scala epica (clamp 4-12rem).
          hidden md:flex (>=768px): su mobile lasciamo solo lo stemma
          centrato (decisione 2026-06-06, idem pitch lines). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end overflow-hidden px-4 pb-8 md:flex md:px-12 md:pb-12"
      >
        <span
          className="font-display text-brand-gold/[0.13] leading-[0.85] font-black tracking-[0.005em] uppercase"
          style={{ fontSize: "clamp(4rem, 18vw, 14rem)" }}
        >
          {teamName}
        </span>
      </div>

      {/* Stemma club centrato, glow oro tenue dietro per
          "elevarlo" dal background a strisce. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          <div
            aria-hidden
            className="bg-brand-gold/10 absolute inset-0 -m-12 rounded-full blur-3xl"
          />
          <Image
            src="/Logo_Orbassano_2K.png"
            alt=""
            width={520}
            height={520}
            priority
            className="relative h-auto w-[clamp(180px,32vw,420px)] opacity-[0.22] mix-blend-screen"
          />
        </div>
      </div>

      {/* Gradient bottom→top per leggibilita' del testo h1+eyebrow
          renderizzati sopra (header page). */}
      <div
        aria-hidden
        className="from-surface-0/95 via-surface-0/40 absolute inset-0 bg-gradient-to-t to-transparent"
      />
    </>
  );
}
