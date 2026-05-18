import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { fetchTeamsList, type TeamSummary } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Calendari",
  description:
    "Tutti i calendari di ASD Orbassano Calcio: Prima Squadra, Juniores e Settore Giovanile (U14-U17). Scegli la squadra e accedi al calendario completo con tutte le partite di campionato e amichevoli.",
};

/**
 * Pagina hub /calendario: elenco di tutte le squadre divise per
 * categoria, ognuna con un box che porta al calendario completo
 * /squadre/[slug]/calendario.
 *
 * Pattern visivo allineato a /squadre (banda chiara, 3 sezioni
 * Prima Squadra · Juniores · Settore Giovanile) ma con card
 * dedicate al calendario (icona + nome + stagione + CTA).
 */
const SECTIONS: Array<{
  category: TeamSummary["category"];
  fallbackEyebrow: string;
  fallbackTitle: string;
  cols: string;
}> = [
  {
    category: "Prima Squadra",
    fallbackEyebrow: "01 — Calendario senior",
    fallbackTitle: "Prima Squadra",
    cols: "lg:grid-cols-3",
  },
  {
    category: "Juniores",
    fallbackEyebrow: "02 — Calendario Juniores",
    fallbackTitle: "Juniores",
    cols: "lg:grid-cols-3",
  },
  {
    category: "Settore Giovanile",
    fallbackEyebrow: "03 — Calendari Settore Giovanile",
    fallbackTitle: "Settore Giovanile",
    cols: "sm:grid-cols-2 lg:grid-cols-4",
  },
];

export default async function CalendarioPage() {
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
              Calendari
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Tutte le partite di tutte le squadre
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Scegli una squadra per accedere al calendario completo del
              campionato, alle amichevoli e ai risultati. Dalla Prima Squadra
              al Settore Giovanile, ogni gruppo ha la sua agenda
              aggiornata.
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
        <Container className="flex flex-col gap-20 py-16 lg:py-20" size="wide">
          {SECTIONS.map(({ category, fallbackEyebrow, fallbackTitle, cols }) => {
            const items = teams.filter((t) => t.category === category);
            if (items.length === 0) return null;
            return (
              <Section
                key={category}
                tone="light"
                eyebrow={fallbackEyebrow}
                title={fallbackTitle}
              >
                <div className={`mt-2 grid grid-cols-1 gap-4 ${cols}`}>
                  {items.map((t) => (
                    <CalendarioTeamCard key={t._id} team={t} />
                  ))}
                </div>
              </Section>
            );
          })}

          {teams.length === 0 && (
            <p className="text-light-ink-mid border-light-border bg-light-bg-1 rounded-2xl border border-dashed p-10 text-center text-base">
              Le squadre non sono ancora pubblicate: nessun calendario
              disponibile.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}

/**
 * Card di una squadra che porta al suo calendario. Layout identico a
 * TeamCard di /squadre ma href = /squadre/[slug]/calendario e CTA
 * "Vedi calendario →" invece di "Pagina {team}".
 */
function CalendarioTeamCard({ team }: { team: TeamSummary }) {
  const subtitle =
    team.subcategory && team.subcategory !== team.name ? team.subcategory : null;
  return (
    <Link
      href={`/squadre/${team.slug}/calendario`}
      aria-label={`Calendario ${team.name}`}
      className="group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col overflow-hidden rounded-2xl border transition-all focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {team.heroImage ? (
          <Image
            src={team.heroImage}
            alt={team.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 1024px) 100vw, 33vw"
            placeholder={team.heroImageLqip ? "blur" : "empty"}
            blurDataURL={team.heroImageLqip ?? undefined}
          />
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/40 absolute inset-0 flex items-end bg-gradient-to-br p-6"
          >
            <CalendarDays
              size={56}
              className="text-surface-3/70"
              aria-hidden
            />
          </div>
        )}
        <div
          aria-hidden
          className="from-surface-0/85 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>
      <div className="flex flex-col gap-2 p-6">
        <h3 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
          {team.name}
        </h3>
        {subtitle && <span className="text-ink-mid text-sm">{subtitle}</span>}
        <div className="text-ink-low mt-2 flex items-center justify-between text-xs">
          <span className="font-mono tracking-wide">
            {team.season ?? "—"}
          </span>
          <span className="text-brand-gold inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.1em] uppercase">
            Vedi calendario
            <ArrowUpRight size={14} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
