import type { Metadata } from "next";
import {
  Building2,
  Landmark,
  MapPin,
  Ticket,
} from "lucide-react";
import { StoryNumbers } from "@/components/home/StoryNumbers";
import { SocietaHubCard } from "@/components/societa/SocietaHubCard";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Società",
  description:
    "ASD Orbassano Calcio dal 1930: storia, organigramma, impianti sportivi e informazioni di biglietteria.",
};

const HUB_CARDS = [
  {
    number: "01",
    title: "Storia",
    description:
      "Dal 1930 ai nostri giorni: 95 anni di rossoblù raccontati attraverso fondazione, promozioni, fusioni e rifondazioni.",
    href: "/societa/storia",
    icon: Landmark,
  },
  {
    number: "02",
    title: "Organigramma",
    description:
      "Presidente, vice, direttore generale, tesoriere e consiglio. Le persone che guidano oggi il club.",
    href: "/societa/organigramma",
    icon: Building2,
  },
  {
    number: "03",
    title: "Impianti",
    description:
      "Centro Sportivo Aldo Porta: la sede ufficiale dove si allena e gioca la famiglia rossoblù.",
    href: "/societa/impianti",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Biglietteria",
    description:
      "Come accedere alle partite casalinghe, condizioni di ingresso e contatti per gruppi e abbonamenti stagionali.",
    href: "/societa/biglietteria",
    icon: Ticket,
  },
];

export default function SocietaPage() {
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

      <Container className="py-16 lg:py-20" size="wide">
        <RevealOnScroll>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HUB_CARDS.map((card) => (
              <SocietaHubCard key={card.number} {...card} />
            ))}
          </div>
        </RevealOnScroll>
      </Container>

      <RevealOnScroll>
        <StoryNumbers />
      </RevealOnScroll>
    </>
  );
}
