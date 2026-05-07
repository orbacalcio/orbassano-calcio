import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

/**
 * 3 card numerate (01/02/03) per le aree calcistiche del club.
 * Hover: la freccia si rivela e l'etichetta numerica diventa oro.
 */
const teams = [
  {
    number: "01",
    title: "Prima Squadra",
    description:
      "Prima Categoria Piemonte VdA. Lo staff tecnico, la rosa e il sogno di riportare Orbassano in alto.",
    href: "/squadre/prima-squadra",
  },
  {
    number: "02",
    title: "Settore Giovanile",
    description:
      "Quattro categorie, dall'Under 14 all'Under 17. Mister, dirigenti, accompagnatori. Da qui passa il futuro del club.",
    href: "/squadre/settore-giovanile",
  },
  {
    number: "03",
    title: "Scuola Calcio",
    description:
      "Dai 5 anni in su, gestita da Sporting Orbassano. Piccoli Amici, Primi Calci, Pulcini, Esordienti. La famiglia che si allarga.",
    href: "/squadre/scuola-calcio",
  },
] as const;

export function TeamsCards() {
  return (
    <Container className="py-20" size="wide">
      <Section
        eyebrow="Le squadre"
        title="Tre realtà, una sola identità"
        subtitle="Dalla Prima Squadra ai Piccoli Amici, passando per il Settore Giovanile: il rossoblù è uguale per tutti."
      >
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {teams.map((t) => (
            <Link
              key={t.number}
              href={t.href}
              className="group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col gap-6 overflow-hidden rounded-2xl border p-8 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 lg:p-10"
            >
              <span className="font-display text-surface-3 group-hover:text-brand-gold/60 text-7xl leading-none font-black transition-colors lg:text-8xl">
                {t.number}
              </span>
              <h3 className="font-display text-ink-hi text-3xl font-extrabold tracking-[0.01em] uppercase lg:text-4xl">
                {t.title}
              </h3>
              <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
                {t.description}
              </p>
              <div className="text-brand-gold mt-auto inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                Esplora
                <ArrowUpRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </Container>
  );
}
