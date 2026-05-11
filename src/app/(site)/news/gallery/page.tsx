import type { Metadata } from "next";
import { VivLOrba } from "@/components/home/VivLOrba";
import { Container } from "@/components/ui/Container";

/**
 * Pagina /news/gallery — feed Instagram + (future) album foto/video
 * delle partite. Per ora ospita il widget "Vivi l'Orba" gia' presente
 * in homepage: la stessa fonte (Behold + IG @asdorbassanocalcio) ma
 * a tutta pagina, senza limite di altezza.
 *
 * TODO M6/M7: aggiungere album CMS "matchGallery" (foto+video per
 * partita) e cards per partita oltre al feed IG live.
 */
export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Foto e video dell'A.S.D. Orbassano Calcio: feed Instagram ufficiale, scatti dalle partite e dietro le quinte del club rossoblù.",
};

export default function GalleryPage() {
  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              News · Gallery
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Foto e video
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Gli scatti del rossoblù: dietro le quinte, partite,
              allenamenti e momenti che fanno il club. Tutto quello che
              vediamo sui nostri canali, in un unico posto.
            </p>
          </div>
        </Container>
      </header>

      <VivLOrba />
    </>
  );
}
