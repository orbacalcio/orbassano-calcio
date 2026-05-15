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
 * Sfondo cream (#F5F1E8) vintage/parchment: stesso contrasto del
 * bianco puro per far brillare il rossoblu', ma transizione meno
 * stridente col navy del resto della pagina. Richiama anche le foto
 * storiche/cimeli del club (per chi ricorda gli anni '80).
 */
export function Manifesto() {
  return (
    <section
      aria-labelledby="manifesto-title"
      className="relative overflow-hidden bg-[#F5F1E8] py-24 lg:py-32"
    >
      <Container
        size="wide"
        className="flex flex-col items-center gap-10 text-center sm:gap-12"
      >
        <h2
          id="manifesto-title"
          className="font-display leading-[0.9] font-black tracking-[0.005em] uppercase"
          style={{
            // Dimensione fluida +30% rispetto alla precedente: cresce con la
            // viewport invece di saltare a tre breakpoint discreti. A 320px
            // (iPhone SE) la clamp tiene 3rem; a 1280px (desktop tipico)
            // ~11rem; a >=1486px max 13rem (= 10rem precedente +30%).
            // Il clamp evita l'overflow orizzontale su mobile che avrebbe
            // dato il +30% statico (text-6xl -> 4.875rem = 78px troppo
            // largo per la stringa "Never give up" a 320-375px).
            fontSize: "clamp(3rem, 14vw, 13rem)",
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
          className="bg-brand-blue text-brand-white hover:bg-brand-red hover:text-brand-white focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          La nostra storia
          <ArrowRight size={14} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
