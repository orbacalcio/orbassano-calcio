import type { Metadata } from "next";
import { Banner5x1000 } from "@/components/home/Banner5x1000";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { MatchStrip } from "@/components/home/MatchStrip";
import { NewsGrid } from "@/components/home/NewsGrid";
import { SponsorMarquee } from "@/components/home/SponsorMarquee";
import { StoryNumbers } from "@/components/home/StoryNumbers";
import { TeamsCards } from "@/components/home/TeamsCards";
import { VivLOrba } from "@/components/home/VivLOrba";
import { YouthMatchStrip } from "@/components/home/YouthMatchStrip";
import { JsonLd } from "@/components/seo/JsonLd";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { buildSportsTeamLd } from "@/lib/json-ld";

/**
 * Homepage cinematografica (M3).
 *
 * Blocchi in scroll verticale:
 * 1. Hero full-bleed con carosello (testi per-slide + Ken Burns) — ha
 *    coreografia interna, niente RevealOnScroll esterno.
 * 2. News in evidenza (con CTA "Tutti i contenuti" tight in basso)
 * 3. MatchStrip Prima Squadra (banda navy + CTA "Calendario e risultati"
 *    tight in basso, stesso pattern delle news)
 * 4. Manifesto "Never give up since 1930"
 * 5. Storia in numeri
 * 6. Vivi l'Orba (Behold Instagram embed, fallback placeholder)
 * 7. YouthMatchStrip — Juniores + Settore Giovanile Scolastico
 * 8. Tre card 01/02/03 per le aree del club (LE SQUADRE)
 * 9. Banner 5×1000 con CF in mono
 * 10. Marquee sponsor scorrimento infinito
 * (11. Footer dark — viene da AppShell)
 *
 * Tutti i wrapper RevealOnScroll sono no-op (vedi RevealOnScroll.tsx):
 * l'animazione di slide-in `y: +32 -> 0` creava un effetto "salto verso
 * l'alto" fastidioso al primo scroll-down. Le sezioni si presentano
 * statiche; i wrapper restano per backward compat / futura riattivazione.
 */
// Title + description ereditati dal root layout (default homepage).
// Qui serve SOLO il canonical "/" esplicito, perche' il root layout
// non setta piu' alternates.canonical (vedi src/app/layout.tsx) per
// evitare che il default si propaghi a tutte le pagine figlie.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={buildSportsTeamLd({
          season: "2026/2027",
          league: "Prima Categoria Piemonte VdA",
        })}
      />
      <Hero />
      <RevealOnScroll>
        <NewsGrid />
      </RevealOnScroll>
      <MatchStrip />
      <RevealOnScroll>
        <Manifesto />
      </RevealOnScroll>
      <RevealOnScroll>
        <StoryNumbers />
      </RevealOnScroll>
      <RevealOnScroll>
        <VivLOrba />
      </RevealOnScroll>
      <RevealOnScroll>
        <YouthMatchStrip />
      </RevealOnScroll>
      <RevealOnScroll>
        <TeamsCards />
      </RevealOnScroll>
      <RevealOnScroll>
        <Banner5x1000 />
      </RevealOnScroll>
      <RevealOnScroll>
        <SponsorMarquee />
      </RevealOnScroll>
    </>
  );
}
