import { Banner5x1000 } from "@/components/home/Banner5x1000";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { MatchStrip } from "@/components/home/MatchStrip";
import { NewsGrid } from "@/components/home/NewsGrid";
import { SponsorMarquee } from "@/components/home/SponsorMarquee";
import { StoryNumbers } from "@/components/home/StoryNumbers";
import { TeamsCards } from "@/components/home/TeamsCards";
import { VivLOrba } from "@/components/home/VivLOrba";
import { JsonLd } from "@/components/seo/JsonLd";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { buildSportsTeamLd } from "@/lib/json-ld";

/**
 * Homepage cinematografica (M3).
 *
 * Otto blocchi in scroll verticale:
 * 1. Hero full-bleed con carosello (testi per-slide + Ken Burns) — ha
 *    coreografia interna, niente RevealOnScroll esterno.
 * 2. Match strip info dense
 * 3. News in evidenza 2x2
 * 4. Tre card 01/02/03 per le aree del club
 * 5. Storia in numeri (StoryNumbers ha gia' i suoi counter animati,
 *    ma va comunque sotto un RevealOnScroll per il fade del wrapper)
 * 6. Vivi l'Orba (Behold Instagram embed, fallback placeholder)
 * 7. Banner 5×1000 con CF in mono
 * 8. Marquee sponsor scorrimento infinito
 * (9. Footer dark — viene da AppShell)
 *
 * Ogni blocco sotto l'hero e' wrappato in <RevealOnScroll> per il
 * fade + translateY al primo ingresso nel viewport: la pagina
 * "respira" mentre l'utente scrolla, niente blocchi che appaiono di
 * netto.
 */
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
        <MatchStrip />
      </RevealOnScroll>
      <RevealOnScroll>
        <NewsGrid />
      </RevealOnScroll>
      <RevealOnScroll>
        <TeamsCards />
      </RevealOnScroll>
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
        <Banner5x1000 />
      </RevealOnScroll>
      <RevealOnScroll>
        <SponsorMarquee />
      </RevealOnScroll>
    </>
  );
}
