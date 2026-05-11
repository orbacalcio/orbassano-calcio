import Link from "next/link";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { MatchCard } from "@/components/calendario/MatchCard";
import { sanityClient } from "@/sanity/client";
import { nextMatchQuery, settingsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import type { MatchSummary } from "@/sanity/fetchers";
import { YouthMatchStrip } from "./YouthMatchStrip";

/**
 * Strip "info dense" sotto l'hero, due livelli:
 *
 * 1) Box Prima Squadra (prominente, padding generoso):
 *    [ Prossima partita Prima Squadra  (2/3) ][ Classifica (1/3) ]
 *    L'eyebrow della "Prossima partita" riporta anche il campionato
 *    (es. "PRIMA CATEGORIA · 2026/27"), eliminando lo slot dedicato
 *    Campionato della versione precedente.
 *
 * 2) Box Settore Giovanile + Juniores (separato verticalmente, padding
 *    ~30% piu' compatto): 5 righe — Juniores, Under 17, Under 16,
 *    Under 15, Under 14 — con la prossima partita per ognuna. Vedi
 *    YouthMatchStrip.tsx.
 *
 * Hardcoded sulla Prima Squadra nel box principale (la home rappresenta
 * la Prima Squadra). Per le altre categorie la mini-strip sotto e' il
 * "drill-down" rapido.
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
  // Priorita' link classifica:
  //   1. competition.externalRankingUrl (campo dedicato classifica)
  //   2. competition.defaultReportLink (Tuttocampo che include classifica)
  //   3. settings.sprintsportLinks.classifica (fallback storico globale)
  // Tutti modificabili dall'admin in Studio: il campo competition cambia
  // ogni stagione, il fallback settings copre il caso 'nessuna competition
  // ancora caricata'.
  const classificaUrl =
    nextMatch?.competition?.externalRankingUrl ??
    nextMatch?.competition?.defaultReportLink ??
    settings?.sprintsportLinks?.classifica ??
    null;
  const competitionLabel = [league, group ? `Girone ${group}` : null, season]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* BOX 1 — Prima Squadra (prominente) */}
      <section
        aria-label="Prossimo impegno Prima Squadra"
        className="border-border/60 border-y bg-surface-1/40"
      >
        <Container
          className="grid grid-cols-1 gap-px lg:grid-cols-3"
          size="wide"
        >
          {/* Slot prossima partita — 2/3 */}
          <div className="bg-surface-2/60 flex flex-col gap-3 p-6 md:p-8 lg:col-span-2">
            <div className="flex flex-col gap-1">
              <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
                <CalendarDays
                  size={12}
                  className="-mt-0.5 mr-1.5 inline"
                  aria-hidden
                />
                Prossima partita · {PRIMA_SQUADRA_NAME}
              </span>
              <span className="font-mono text-ink-mid text-[11px] font-semibold tracking-[0.12em] uppercase">
                {competitionLabel}
              </span>
            </div>
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
                <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
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

          {/* Slot classifica — 1/3 */}
          <div className="bg-surface-1/60 flex flex-col gap-3 p-6 md:p-8">
            <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
              <Trophy
                size={12}
                className="-mt-0.5 mr-1.5 inline"
                aria-hidden
              />
              Classifica
            </span>
            <span className="text-ink-mid text-sm leading-relaxed">
              La classifica ufficiale del girone è gestita da Sprintesport,
              il portale federale che aggrega risultati e statistiche del
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

      {/* BOX 2 — Settore Giovanile + Juniores (staccato verticalmente) */}
      <YouthMatchStrip />
    </>
  );
}
