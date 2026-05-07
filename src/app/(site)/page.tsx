import { Banner5x1000 } from "@/components/home/Banner5x1000";
import { Hero } from "@/components/home/Hero";
import { MatchStrip } from "@/components/home/MatchStrip";
import { NewsGrid } from "@/components/home/NewsGrid";
import { SponsorMarquee } from "@/components/home/SponsorMarquee";
import { StoryNumbers } from "@/components/home/StoryNumbers";
import { TeamsCards } from "@/components/home/TeamsCards";

/**
 * Homepage cinematografica (M3).
 *
 * Otto blocchi in scroll verticale:
 * 1. Hero full-bleed con carosello (o fallback gradient brand)
 * 2. Match strip info dense
 * 3. News in evidenza 2x2
 * 4. Tre card 01/02/03 per le aree del club
 * 5. Storia in numeri (95 anni / 23 atleti / 120+ giovani / 9 Serie D)
 * 6. Banner 5×1000 con CF in mono
 * 7. Marquee sponsor scorrimento infinito
 * (8. Footer dark — viene da AppShell)
 */
export default function Home() {
  return (
    <>
      <Hero />
      <MatchStrip />
      <NewsGrid />
      <TeamsCards />
      <StoryNumbers />
      <Banner5x1000 />
      <SponsorMarquee />
    </>
  );
}
