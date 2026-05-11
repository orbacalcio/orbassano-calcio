import Link from "next/link";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { MatchCard } from "@/components/calendario/MatchCard";
import { sanityClient } from "@/sanity/client";
import { nextMatchQuery, settingsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import type { MatchSummary } from "@/sanity/fetchers";

/**
 * Strip "info dense" sotto l'hero, stile Juventus, 3 slot:
 *  [Campionato]  [Prossima partita Prima Squadra]  [Classifica esterna]
 *
 * Slot 2 usa MatchCard variant=compact per coerenza visiva con la
 * pagina /squadre/prima-squadra/calendario. Il link sotto la card
 * porta al calendario completo.
 *
 * Hardcoded sulla Prima Squadra: la home rappresenta la Prima Squadra
 * di default (vedi spec 5b). Per Juniores/SGS l'utente naviga alle
 * pagine squadra e da lì al calendario dedicato (m5c CTA + mini-strip).
 */
type Settings = {
  currentLeague: string | null;
  currentGroup: string | null;
  sprintsportLinks: {
    classifica?: string | null;
    calendario?: string | null;
    statistiche?: string | null;
  } | null;
};

const PRIMA_SQUADRA_NAME = "Prima Squadra";
const PRIMA_SQUADRA_SLUG = "prima-squadra";

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
      nextMatch: (nextMatch ?? null) as MatchSummary | null,
      settings: (settings ?? null) as Settings | null,
    };
  } catch {
    return { nextMatch: null, settings: null };
  }
}

export async function MatchStrip() {
  const { nextMatch, settings } = await fetchData();
  const league =
    nextMatch?.competition?.shortName ??
    settings?.currentLeague ??
    "Prima Categoria Piemonte VdA";
  const group = nextMatch?.competition?.group ?? settings?.currentGroup ?? "";
  const season = nextMatch?.competition?.season ?? "2026/27";
  const classificaUrl =
    nextMatch?.competition?.defaultReportLink ??
    settings?.sprintsportLinks?.classifica ??
    null;
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

        {/* Slot 2 — prossima partita (MatchCard compact) */}
        <div className="bg-surface-2/60 flex flex-col gap-3 p-6 md:p-8">
          <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
            <CalendarDays size={12} className="-mt-0.5 mr-1.5 inline" aria-hidden />
            Prossima partita
          </span>
          {nextMatch ? (
            <>
              <MatchCard
                match={nextMatch}
                ourTeamSlug={PRIMA_SQUADRA_SLUG}
                ourTeamName={PRIMA_SQUADRA_NAME}
                variant="compact"
              />
              <Link
                href={`/squadre/${PRIMA_SQUADRA_SLUG}/calendario`}
                className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 self-start text-sm font-semibold transition-colors"
              >
                Calendario completo
                <ArrowUpRight size={14} />
              </Link>
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
              <Link
                href={`/squadre/${PRIMA_SQUADRA_SLUG}/calendario`}
                className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 self-start text-sm font-semibold transition-colors"
              >
                Apri calendario
                <ArrowUpRight size={14} />
              </Link>
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
