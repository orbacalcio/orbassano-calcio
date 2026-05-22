import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { FEATURES } from "@/lib/features";
import { fetchRiferimentiOperativi } from "@/sanity/fetchers";
import {
  CanaliBlock,
  CosaSuccedeDopoBlock,
  DirittiBlock,
  EmergenzaDisclaimer,
} from "./components/SegnalazioniInfo";
import { WhistleblowingForm } from "./components/WhistleblowingForm";

export const metadata: Metadata = {
  alternates: { canonical: "/societa/segnalazioni" },
  title: "Segnalazioni",
  description:
    "Canale ufficiale per segnalare violazioni del Codice Etico di A.S.D. Orbassano Calcio. Riservatezza garantita, nessuna ritorsione.",
  robots: FEATURES.governanceSection
    ? undefined
    : { index: false, follow: false },
};

export default async function SegnalazioniPage() {
  if (!FEATURES.governanceSection) notFound();

  const riferimenti = await fetchRiferimentiOperativi();

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="pitch" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Codice Etico — Canale segnalazioni
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Segnala una violazione
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Se sospetti che una persona del club abbia violato il Codice
              Etico, puoi farlo presente attraverso questo canale ufficiale.
              La tua identit&agrave; resta riservata e sei tutelato da
              qualsiasi ritorsione (artt. 11.6-11.8).
            </p>
          </div>
        </Container>
      </header>

      {/* DIRITTI + CANALI */}
      <Container className="py-16 lg:py-20" size="wide">
        <RevealOnScroll>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DirittiBlock />
            <CanaliBlock
              emailSegnalazioni={riferimenti?.emailSegnalazioni ?? null}
              sedeLegale={riferimenti?.sedeLegale ?? null}
            />
          </div>
        </RevealOnScroll>
      </Container>

      {/* FORM ONLINE */}
      <div className="border-border/50 border-t">
        <Container className="py-16 lg:py-20" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Modulo online
              </span>
              <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                Compila la tua segnalazione
              </h2>
              <p className="text-ink-mid max-w-2xl text-sm leading-relaxed">
                Quattro passaggi guidati. Puoi firmare oppure restare
                anonimo. La descrizione dei fatti deve avere almeno 50
                caratteri per consentire al Direttivo di avviare
                un&apos;istruttoria utile.
              </p>
            </div>

            <div className="mt-10 max-w-3xl">
              <WhistleblowingForm />
            </div>
          </RevealOnScroll>
        </Container>
      </div>

      {/* COSA SUCCEDE DOPO */}
      <div className="border-border/50 border-t">
        <Container className="py-16 lg:py-20" size="wide">
          <RevealOnScroll>
            <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
              <CosaSuccedeDopoBlock />
              <EmergenzaDisclaimer />
            </div>
          </RevealOnScroll>
        </Container>
      </div>
    </>
  );
}
