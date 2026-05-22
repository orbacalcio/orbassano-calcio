import type { Metadata } from "next";
import { StoryNumbers } from "@/components/home/StoryNumbers";
import { SocietaHubCard } from "@/components/societa/SocietaHubCard";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { Reveal, RevealStagger } from "@/components/ui/Reveal";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = {
  alternates: { canonical: "/societa" },
  title: "Società",
  description:
    "ASD Orbassano Calcio dal 1930: storia, organigramma, impianti sportivi e informazioni di biglietteria.",
};

const BASE_HUB_CARDS = [
  {
    number: "01",
    title: "Storia",
    description:
      "Dal 1930 ai nostri giorni: oltre 95 anni di rossoblù raccontati attraverso fondazione, promozioni, fusioni e rifondazioni.",
    href: "/societa/storia",
  },
  {
    number: "02",
    title: "Organigramma",
    description:
      "Presidente, vice, direttore generale, tesoriere e consiglio. Le persone che guidano oggi il club.",
    href: "/societa/organigramma",
  },
  {
    number: "03",
    title: "Impianti",
    description:
      "Centro Sportivo Aldo Porta: la sede ufficiale dove si allena e gioca la famiglia rossoblù.",
    href: "/societa/impianti",
  },
  {
    number: "04",
    title: "Biglietteria",
    description:
      "Come accedere alle partite casalinghe, condizioni di ingresso e contatti per gruppi e abbonamenti stagionali.",
    href: "/societa/biglietteria",
  },
];

// Aggiunte governance (vivibili solo a feature flag attivo).
// NB: la card "Trasparenza" (rendicontazione 5x1000) e' stata RIMOSSA su
// richiesta utente il 2026-05-11, in coerenza con la rimozione del link
// dal footer. La pagina /societa/trasparenza esiste ancora dietro flag
// governance ma non e' linkata. Reminder salvato in memoria — ricordare
// di riaggiungere quando dati 5x1000 saranno definitivi.
const GOVERNANCE_HUB_CARDS = [
  {
    number: "05",
    title: "Codice Etico",
    description:
      "Principi, valori e regole di condotta del club. Documento giuridicamente vincolante per tesserati, tecnici, sponsor e fornitori.",
    href: "/societa/codice-etico",
  },
  {
    number: "06",
    title: "Segnalazioni",
    description:
      "Canale ufficiale per segnalare violazioni del Codice Etico. Riservatezza garantita, nessuna ritorsione.",
    href: "/societa/segnalazioni",
  },
];

const HUB_CARDS = FEATURES.governanceSection
  ? [...BASE_HUB_CARDS, ...GOVERNANCE_HUB_CARDS]
  : BASE_HUB_CARDS;

export default function SocietaPage() {
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
              La Società
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Dal 1930 il calcio di Orbassano
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Una storia che attraversa quasi un secolo di calcio piemontese:
              fondazione nel 1930, nove partecipazioni in Serie D,
              semifinali playoff, fusioni, rifondazioni e una nuova cordata
              che dal 2022 ha riportato il club al suo nome storico.
            </p>
          </div>
        </Container>
      </header>

      {/* Hub card su banda chiara: card scure (SocietaHubCard) interne.
          Grid lg-3 colonne — stesso pattern di TeamsCards in homepage,
          rows da 3. Con flag governance attivo, 6 card = 2 righe piene.
          Senza flag, 4 card = 1 riga piena + 1 orfana (acceptable). */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HUB_CARDS.map((card) => (
              <SocietaHubCard key={card.number} {...card} />
            ))}
          </RevealStagger>
        </Container>
      </section>

      <Reveal>
        <StoryNumbers />
      </Reveal>
    </>
  );
}
