import type { Metadata } from "next";
import { NewsArchive } from "@/components/news/NewsArchive";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { fetchAllNews } from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/news" },
  title: "News",
  description:
    "Risultati, dietro le quinte e comunicati ufficiali di ASD Orbassano Calcio. Filtra l'archivio per categoria: Prima Squadra, Settore Giovanile, Società, Sponsor.",
};

export default async function NewsPage() {
  const news = await fetchAllNews();

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
              News
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Le ultime dal club
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Risultati, dietro le quinte, comunicati ufficiali. Tutto quello
              che esce dalla redazione di Orbassano Calcio. Filtra per
              categoria per trovare quello che cerchi.
            </p>
          </div>
        </Container>
      </header>

      {/* Archivio su banda chiara (pattern home NewsGrid): le card news
          scure restano "isole scure" su sfondo chiaro, i filtri sopra
          usano testi navy (text-light-ink-*) per leggibilita'. */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            <NewsArchive news={news} />
          </RevealOnScroll>
        </Container>
      </section>
    </>
  );
}
