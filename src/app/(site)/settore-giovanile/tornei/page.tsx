import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Trophy } from "lucide-react";
import {
  YouthEventGroup,
  type EventRow,
} from "@/components/settore-giovanile/YouthEventGroup";
import { Container } from "@/components/ui/Container";
import { fetchTournaments } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Tornei Settore Giovanile",
  description:
    "Calendario dei Tornei del Settore Giovanile ASD Orbassano Calcio per ogni categoria. Manifestazioni organizzate o ospitate dal club.",
};

const CATEGORY_ORDER = [
  "Juniores Under 19",
  "Allievi Under 17",
  "Allievi Under 16",
  "Giovanissimi Under 15",
  "Giovanissimi Under 14",
] as const;

export default async function TorneiPage() {
  const events = await fetchTournaments();

  const byCategory = new Map<string, EventRow[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const ev of events) {
    const row: EventRow = {
      id: ev._id,
      title: ev.title,
      date: ev.date,
      endDate: ev.endDate,
      venue: ev.venue,
      notes:
        [ev.notes, ev.participatingTeams]
          .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
          .join("\n\n") || null,
      tags: [ev.format, ev.prize],
      cta: ev.registrationUrl
        ? {
            label: "Info e iscrizioni",
            href: ev.registrationUrl,
            icon: "external",
          }
        : null,
    };
    const list = byCategory.get(ev.category);
    if (list) list.push(row);
    else byCategory.set(ev.category, [row]);
  }

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <Link
            href="/squadre"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-wide transition-colors"
          >
            <ArrowLeft size={12} aria-hidden />
            Torna alle squadre
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <GraduationCap size={16} aria-hidden />
              Settore Giovanile
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Tornei
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Manifestazioni organizzate dall&apos;Orbassano Calcio o
              ospitate al Centro Sportivo Aldo Porta. Memorial, tornei
              di fine stagione, triangolari amichevoli: qui sotto le
              date per ogni categoria del Settore Giovanile.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {events.length === 0 ? (
          <div className="border-border/40 bg-surface-1/40 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <Trophy size={48} className="text-ink-low" aria-hidden />
            <h2 className="font-display text-ink-hi text-2xl font-bold tracking-[0.005em] uppercase">
              Calendario in arrivo
            </h2>
            <p className="text-ink-mid max-w-md text-sm leading-relaxed">
              I tornei della stagione saranno pubblicati appena
              confermati dalla Segreteria.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORY_ORDER.map((cat) => {
              const rows = byCategory.get(cat) ?? [];
              return (
                <YouthEventGroup
                  key={cat}
                  category={cat}
                  rows={rows}
                  emptyLabel="Nessun torneo programmato per questa categoria."
                />
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
