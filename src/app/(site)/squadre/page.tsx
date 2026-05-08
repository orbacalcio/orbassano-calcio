import type { Metadata } from "next";
import { TeamCard } from "@/components/squadre/TeamCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { fetchTeamsList, type TeamSummary } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Squadre",
  description:
    "Le squadre di ASD Orbassano Calcio: Prima Squadra, Settore Giovanile (U17, U16, U15, U14) e Scuola Calcio.",
};

const SECTIONS: Array<{
  category: TeamSummary["category"];
  number: string;
  eyebrow: string;
  cols: string;
}> = [
  {
    category: "Prima Squadra",
    number: "01",
    eyebrow: "01 — La punta di diamante",
    cols: "lg:grid-cols-3",
  },
  {
    category: "Settore Giovanile",
    number: "02",
    eyebrow: "02 — Da qui passa il futuro",
    cols: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    category: "Scuola Calcio",
    number: "03",
    eyebrow: "03 — Si comincia da qui",
    cols: "lg:grid-cols-3",
  },
];

export default async function SquadrePage() {
  const teams = await fetchTeamsList();

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
              Le squadre
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Sei squadre, una sola maglia
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Dalla Prima Squadra ai Pulcini della Scuola Calcio, ogni rossoblù
              di Orbassano gioca con la stessa identità. Qui sotto trovi rosa,
              staff e info di ogni gruppo.
            </p>
          </div>
        </Container>
      </header>

      <Container className="flex flex-col gap-20 py-16 lg:py-20" size="wide">
        {SECTIONS.map(({ category, eyebrow, cols }) => {
          const items = teams.filter((t) => t.category === category);
          if (items.length === 0) return null;
          return (
            <Section key={category} eyebrow={eyebrow} title={category}>
              <div className={`mt-2 grid grid-cols-1 gap-4 ${cols}`}>
                {items.map((t) => (
                  <TeamCard key={t._id} team={t} />
                ))}
              </div>
            </Section>
          );
        })}

        {teams.length === 0 && (
          <p className="text-ink-mid border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center text-base">
            Le squadre non sono ancora pubblicate. Controlla che il CMS sia
            popolato e i webhook revalidate configurati.
          </p>
        )}
      </Container>
    </>
  );
}
