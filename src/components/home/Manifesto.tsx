import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Sezione manifesto: testo gigante con strisce verticali rossoblu' che
 * richiamano la maglia da gioco del 1930. Stesso pattern juventus.com
 * (impatto editoriale, sfondo chiaro, scan-effect) ma riadattato col
 * cromatismo del club: vertical stripes red+blue invece di linee
 * orizzontali nere.
 *
 * Tecnica:
 * - `repeating-linear-gradient(to right, ...)` come background del <h2>
 *   alterna brand-red e brand-blue a strisce di 22px (totale 44px =
 *   ~3 strisce per larghezza-glifo a text-[10rem], proporzioni jersey)
 * - `background-clip: text` + `WebkitTextFillColor: transparent`
 *   ritaglia il pattern dentro le glifi
 * - Niente skew: con strisce verticali le strisce stesse danno
 *   impatto, lo skew le inclinerebbe rendendole confuse
 *
 * Sfondo brand-white per massimizzare il contrasto con red/blue (il
 * rossoblu' nasce per maglia bianca/chiara, non navy).
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
          className="font-display text-6xl leading-[0.9] font-black tracking-[0.005em] uppercase sm:text-8xl lg:text-[10rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, #e91f22 0, #e91f22 22px, #213f8c 22px, #213f8c 44px)",
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
