import Image from "next/image";

/**
 * Fallback "wow" per l'hero di una squadra quando non c'e' heroImage
 * caricata su Sanity (default state, da popolare in Studio).
 *
 * Stratificazione visiva (dal basso verso l'alto):
 *  1. Sfondo navy bg-surface-0 (base)
 *  2. Strisce verticali rossoblu' jersey-pattern, opacity bassa
 *     (riprende il Manifesto home senza esserne una copia: qui sono
 *     piu' sottili e statiche, no animazione su hover)
 *  3. Watermark del nome squadra in oro/15% — gigante, font display
 *     900, uppercase, allineato in basso (sarà parzialmente coperto
 *     dal testo del header sopra di lui)
 *  4. Stemma club centrato, opacity bassa (~22%) — l'identita' visiva
 *     del club anche quando manca la foto della squadra
 *  5. Gradient bottom-to-top per leggibilita' del testo h1+eyebrow
 *     del header che vive sopra (gestito da page.tsx)
 *
 * Quando si carica una heroImage in Studio, questo fallback viene
 * sostituito dalla foto reale + overlay multiply navy (vedi
 * page.tsx).
 */
export function TeamHeroFallback({ teamName }: { teamName: string }) {
  return (
    <>
      {/* Base navy: garantisce contrasto col testo bianco del header */}
      <div aria-hidden className="bg-surface-0 absolute inset-0" />

      {/* Strisce verticali jersey rossoblu' (pattern Orbassano).
          repeating-linear-gradient con strisce di ~32px alternanti
          tra brand-red e brand-blue, applicato a low opacity per
          non sovrastare. Pattern statico, niente animazioni: il
          "wow" sta nella stratificazione, non nel movimento. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.14] mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, #e91f22 0, #e91f22 32px, #213f8c 32px, #213f8c 64px)",
        }}
      />

      {/* Watermark nome squadra: display 900 oro/13% in basso a sx,
          taglia il viewport per dare scala epica (clamp 4-12rem). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end overflow-hidden px-4 pb-8 md:px-12 md:pb-12"
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
