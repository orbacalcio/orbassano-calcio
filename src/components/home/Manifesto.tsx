import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Sezione manifesto stile juventus.com "WE ARE YOUTH SINCE 1897": testo
 * gigante con effetto scan-lines orizzontali, leggera shear (skewX),
 * sfondo bianco come interrupt visivo nel flusso navy della homepage.
 *
 * Tecnica scan-lines: `repeating-linear-gradient` come background del
 * <h2>, poi `background-clip: text` + `text-transparent` per ritagliare
 * il pattern dentro le glifi. Il gradient alterna 5px di colore solido
 * + 4px di trasparenza (periodo 9px) — ad alta dimensione tipografica
 * questo crea ~17 strisce per altezza-glifi, l'effetto "speed" perfetto.
 *
 * skewX(-8deg) sul wrapper della headline aggiunge il senso di moto
 * orizzontale. Su prefers-reduced-motion il global stylesheet riporta
 * gia' transition/animation a 0; il transform statico resta visibile
 * ma e' un effetto puramente di forma, non di movimento (accettabile).
 *
 * Posizionata in homepage tra TeamsCards e StoryNumbers come pausa
 * editoriale: rompe il navy-su-navy, ricorda l'identita' del club.
 */
export function Manifesto() {
  return (
    <section
      aria-labelledby="manifesto-title"
      className="bg-brand-white relative overflow-hidden py-24 lg:py-32"
    >
      <Container
        size="wide"
        className="flex flex-col items-center gap-10 text-center sm:gap-12"
      >
        <h2
          id="manifesto-title"
          className="font-display text-surface-0 text-6xl leading-[0.9] font-black tracking-[0.005em] uppercase sm:text-8xl lg:text-[10rem]"
          style={{
            transform: "skewX(-8deg)",
            backgroundImage:
              "repeating-linear-gradient(to bottom, #0A1428 0, #0A1428 5px, transparent 5px, transparent 9px)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          Never give up
          <br />
          Since 1930
        </h2>

        <Link
          href="/societa/storia"
          className="border-surface-0 text-surface-0 hover:bg-surface-0 hover:text-brand-white focus-visible:outline-brand-red inline-flex items-center gap-2.5 rounded-full border-2 px-7 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Storia del club
          <ArrowRight size={14} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
