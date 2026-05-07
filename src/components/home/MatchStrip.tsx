import { ArrowUpRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { nextMatchQuery, settingsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";

/**
 * Strip "info dense" sotto l'hero, stile Juventus:
 * [ULTIMO RISULTATO]  [PROSSIMA PARTITA + countdown]  [CLASSIFICA]
 *
 * In M3 mostriamo SOLO la prossima partita reale (se Sanity la espone)
 * + i link sprintesport per classifica/calendario. L'ultimo risultato
 * arrivera' quando avremo il workflow completo "match finished".
 */
type NextMatch = {
  _id: string;
  date: string;
  opponent: string;
  home: boolean;
  venue: string | null;
  opponentLogo: string | null;
};

type Settings = {
  currentLeague: string | null;
  currentGroup: string | null;
  sprintsportLinks: {
    classifica?: string | null;
    calendario?: string | null;
    statistiche?: string | null;
  } | null;
};

async function fetchData() {
  try {
    const [nextMatch, settings] = await Promise.all([
      sanityClient.fetch(nextMatchQuery, {}, { next: { tags: ["match"] } }),
      sanityClient.fetch(
        settingsQuery,
        {},
        { next: { tags: ["settings"] } },
      ),
    ]);
    return {
      nextMatch: (nextMatch ?? null) as NextMatch | null,
      settings: (settings ?? null) as Settings | null,
    };
  } catch {
    return { nextMatch: null, settings: null };
  }
}

function formatDate(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  const day = d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = d.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time };
}

export async function MatchStrip() {
  const { nextMatch, settings } = await fetchData();
  const league = settings?.currentLeague ?? "Prima Categoria Piemonte VdA";
  const group = settings?.currentGroup ?? "";
  const season = "2026/27";
  const classificaUrl = settings?.sprintsportLinks?.classifica;
  const subtitleParts = [group ? `Girone ${group}` : null, season].filter(
    Boolean,
  );

  return (
    <section
      aria-label="Prossimo impegno"
      className="border-border/60 border-y bg-surface-1/40"
    >
      <Container className="grid grid-cols-1 gap-px md:grid-cols-3" size="wide">
        {/* Slot 1 — categoria + girone */}
        <div className="bg-surface-1/60 flex flex-col gap-2 p-6 md:p-8">
          <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
            Campionato
          </span>
          <span className="font-display text-ink-hi text-2xl font-extrabold tracking-[0.01em] uppercase">
            {league}
          </span>
          <span className="text-ink-mid text-sm">
            {subtitleParts.join(" · ")}
          </span>
        </div>

        {/* Slot 2 — prossima partita */}
        <div className="bg-surface-2/60 flex flex-col gap-3 p-6 md:p-8">
          <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
            <CalendarDays size={12} className="-mt-0.5 mr-1.5 inline" aria-hidden />
            Prossima partita
          </span>
          {nextMatch ? (
            <>
              <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
                {nextMatch.home ? "Orbassano" : nextMatch.opponent}
                <span className="text-ink-low mx-2">vs</span>
                {nextMatch.home ? nextMatch.opponent : "Orbassano"}
              </span>
              <div className="text-ink-mid flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="font-mono">
                  {formatDate(nextMatch.date).day} · {formatDate(nextMatch.date).time}
                </span>
                {nextMatch.venue && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden />
                    {nextMatch.venue}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="font-display text-ink-hi text-xl leading-tight font-bold tracking-[0.01em] uppercase">
                Calendario in arrivo
              </span>
              <span className="text-ink-mid text-sm">
                Le prossime giornate saranno pubblicate appena la federazione
                comunica gli accoppiamenti del girone.
              </span>
            </>
          )}
        </div>

        {/* Slot 3 — classifica esterna */}
        <div className="bg-surface-1/60 flex flex-col gap-3 p-6 md:p-8">
          <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
            <Trophy size={12} className="-mt-0.5 mr-1.5 inline" aria-hidden />
            Classifica
          </span>
          <span className="text-ink-mid text-sm leading-relaxed">
            La classifica ufficiale del girone è gestita da Sprintesport, il
            portale federale che aggrega risultati e statistiche di tutto il
            campionato regionale.
          </span>
          {classificaUrl && (
            <a
              href={classificaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 self-start text-sm font-semibold transition-colors"
            >
              Apri classifica
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
