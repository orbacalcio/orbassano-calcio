import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { MazzolaSection } from "@/components/societa/MazzolaSection";
import { PalmaresList } from "@/components/societa/PalmaresList";
import { Timeline } from "@/components/societa/Timeline";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { fetchTimelineEvents } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Storia",
  description:
    "Dal 1930 ad oggi: la storia di ASD Orbassano Calcio in fondazione, promozioni, semifinali playoff Serie D, fusioni e rinascite.",
};

const WIKIPEDIA_URL = "https://it.wikipedia.org/wiki/Orbassano_Calcio";

export default async function StoriaPage() {
  const events = await fetchTimelineEvents();

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
              Storia · 1930 → oggi
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Quasi un secolo di rossoblù
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Fondato come Gruppo Sportivo Orbassano nel 1930, il club ha
              attraversato oltre 90 anni di calcio piemontese tra fasti,
              fusioni, ricomincia e rinascite. Nove partecipazioni alla
              Serie D, due semifinali di play-off promozione tra i
              professionisti negli anni 2000, e un legame profondo con la
              grande Torino calcistica: lo stadio Valentino Mazzola ha
              ospitato gli allenamenti di Torino e Juventus.
            </p>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Negli anni &rsquo;80 l&apos;Orbassano sfior&ograve; due volte la Serie C2 e
              gioc&ograve; amichevoli prestigiose contro la Juventus di
              Trapattoni, Paolo Rossi, Bettega, Tardelli e Causio. Negli
              anni 2000 &mdash; dopo la fusione con Venaria &mdash; vinse l&apos;Eccellenza
              2002-03 e arriv&ograve; alle semifinali playoff Serie D nel
              2005-06 e 2006-07. Nel <strong className="text-ink-hi">2022</strong>,
              dopo le difficolt&agrave; degli anni 2010, una nuova cordata ha
              rifondato l&apos;A.S.D. Orbassano Calcio riavvicinandosi alla
              denominazione storica.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-16 lg:py-24" size="wide">
        <RevealOnScroll>
          <div className="flex flex-col gap-3">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Cronistoria
            </span>
            <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
              Gli eventi che hanno fatto la storia del club
            </h2>
            <p className="text-ink-mid max-w-2xl text-sm leading-relaxed">
              Filtra la timeline per tipologia: trofei vinti, promozioni
              raggiunte, fusioni, rifondazioni ed eventi storici.
            </p>
          </div>
          <div className="mt-12">
            <Timeline events={events} />
          </div>
        </RevealOnScroll>
      </Container>

      <MazzolaSection />

      <Container className="py-16 lg:py-24" size="wide">
        <RevealOnScroll>
          <PalmaresList />
        </RevealOnScroll>
      </Container>

      <Container className="border-border/40 border-t py-12 lg:py-16" size="wide">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
              Fonte storica
            </span>
            <p className="text-ink-mid max-w-xl text-sm leading-relaxed">
              Per approfondire la cronistoria completa, le note di stagione
              e le fonti d&apos;archivio (La Stampa), consulta la pagina
              dedicata su Wikipedia, mantenuta dal social media manager
              del club.
            </p>
          </div>
          <a
            href={WIKIPEDIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Leggi su Wikipedia
            <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      </Container>
    </>
  );
}
