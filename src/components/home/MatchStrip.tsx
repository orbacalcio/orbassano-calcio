import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  History,
  ListOrdered,
} from "lucide-react";
import { MatchCard } from "@/components/calendario/MatchCard";
import { sanityClient } from "@/sanity/client";
import { lastMatchQuery, nextMatchQuery, settingsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import type { MatchSummary } from "@/sanity/fetchers";
import { YouthMatchStrip } from "./YouthMatchStrip";

/**
 * Strip "info dense" sotto l'hero, due livelli:
 *
 * 1) Box Prima Squadra (prominente, padding generoso) — grid 40/40/20:
 *    [ Ultimo risultato (40%) ][ Prossima partita (40%) ][ Classifica (20%) ]
 *    Classifica e' un link icon-only (Trophy) per dare aria al layout
 *    e mettere in primo piano i due match. Le label dei due match
 *    portano competition + stagione.
 *
 * 2) Box Settore Giovanile + Juniores (staccato verticalmente, padding
 *    ~30% piu' compatto): 5 righe — Juniores, Under 17, Under 16,
 *    Under 15, Under 14 — con ultima+prossima partita per ognuna. Vedi
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
    const [nextMatch, lastMatch, settings] = await Promise.all([
      sanityClient.fetch(nextMatchQuery, {}, { next: { tags: ["match"] } }),
      sanityClient.fetch(lastMatchQuery, {}, { next: { tags: ["match"] } }),
      sanityClient.fetch(
        settingsQuery,
        {},
        { next: { tags: ["settings"] } },
      ),
    ]);
    return {
      nextMatch: (nextMatch ?? null) as MatchSummary | null,
      lastMatch: (lastMatch ?? null) as MatchSummary | null,
      settings: (settings ?? null) as Settings | null,
    };
  } catch {
    return { nextMatch: null, lastMatch: null, settings: null };
  }
}

/**
 * Costruisce l'eyebrow "CATEGORIA · GIRONE X · 2026/27" per un singolo
 * match. Ogni blocco (Ultimo / Prossima) usa la propria competition:
 * un match di stagione archiviata deve mostrare il campionato in cui
 * si e' giocato, non quello corrente.
 *
 * Fallback `settings`/literal solo se TUTTO null (es. competition
 * dereference rotto): il messaggio resta leggibile anche se i dati
 * mancano.
 */
function buildCompetitionLabel(
  match: MatchSummary | null,
  settings: Settings | null,
): string {
  const league =
    match?.competition?.shortName ??
    settings?.currentLeague ??
    "Prima Categoria Piemonte VdA";
  const group = match?.competition?.group ?? settings?.currentGroup ?? "";
  const season = match?.competition?.season ?? "2026/27";
  return [league, group ? `Girone ${group}` : null, season]
    .filter(Boolean)
    .join(" · ");
}

export async function MatchStrip() {
  const { nextMatch, lastMatch, settings } = await fetchData();
  // Priorita' link classifica per la PROSSIMA partita (corrente):
  //   1. competition.externalRankingUrl (campo dedicato classifica)
  //   2. competition.defaultReportLink (Tuttocampo che include classifica)
  //   3. settings.sprintsportLinks.classifica (fallback storico globale)
  // Per coprire la fase "nessuna prossima partita pubblicata", cadiamo
  // sulla competition dell'ultimo match e poi sul fallback globale —
  // cosi' il link non sparisce mai se almeno un match esiste.
  const classificaUrl =
    nextMatch?.competition?.externalRankingUrl ??
    nextMatch?.competition?.defaultReportLink ??
    lastMatch?.competition?.externalRankingUrl ??
    lastMatch?.competition?.defaultReportLink ??
    settings?.sprintsportLinks?.classifica ??
    null;
  // Statistiche: per ora arriva solo dal singleton settings (campo
  // sprintsportLinks.statistiche). Schema CMS lato competition non ha
  // ancora un externalStatisticheUrl dedicato — se servisse per anno,
  // si aggiunge a Competition senza toccare il componente.
  const statisticheUrl = settings?.sprintsportLinks?.statistiche ?? null;
  // Eyebrow per blocco: ogni match porta la sua competition reale
  // (stagione archiviata mostra il campionato in cui si e' giocato).
  const lastCompetitionLabel = buildCompetitionLabel(lastMatch, settings);
  const nextCompetitionLabel = buildCompetitionLabel(nextMatch, settings);

  return (
    <>
      {/* BOX 1 — Prima Squadra: grid 40/40/20 (Ultimo · Prossima · Classifica) */}
      <section
        aria-label="Ultimo e prossimo impegno Prima Squadra"
        className="border-border/60 border-y bg-surface-1/40"
      >
        <Container
          className="grid grid-cols-1 gap-px lg:grid-cols-[2fr_2fr_1fr]"
          size="wide"
        >
          {/* Slot 1 — ULTIMO RISULTATO (40%) */}
          <div className="bg-surface-2/60 flex flex-col gap-4 p-8 md:p-11">
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-brand-gold text-base font-bold tracking-[0.2em] uppercase">
                <History
                  size={16}
                  className="-mt-0.5 mr-2 inline"
                  aria-hidden
                />
                Ultimo risultato · {PRIMA_SQUADRA_NAME}
              </span>
              <span className="font-mono text-ink-mid text-[14px] font-semibold tracking-[0.12em] uppercase">
                {lastCompetitionLabel}
              </span>
            </div>
            {lastMatch ? (
              <MatchCard
                match={lastMatch}
                ourTeamSlug={PRIMA_SQUADRA_SLUG}
                ourTeamName={PRIMA_SQUADRA_NAME}
                variant="compact"
              />
            ) : (
              <div className="border-border/40 bg-surface-1/40 flex flex-1 flex-col gap-2.5 rounded-lg border p-5">
                <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
                  Stagione in corso
                </span>
                <span className="text-ink-mid text-sm">
                  Nessuna partita giocata ancora: il primo risultato comparirà qui
                  appena ufficializzato dalla federazione.
                </span>
              </div>
            )}
            <Link
              href={`/squadre/${PRIMA_SQUADRA_SLUG}/calendario?tab=risultati`}
              className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 self-start text-base font-semibold transition-colors"
            >
              Tutti i risultati
              <ArrowUpRight size={18} />
            </Link>
          </div>

          {/* Slot 2 — PROSSIMA PARTITA (40%) */}
          <div className="bg-surface-2/60 flex flex-col gap-4 p-8 md:p-11">
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-brand-gold text-base font-bold tracking-[0.2em] uppercase">
                <CalendarDays
                  size={16}
                  className="-mt-0.5 mr-2 inline"
                  aria-hidden
                />
                Prossima partita · {PRIMA_SQUADRA_NAME}
              </span>
              <span className="font-mono text-ink-mid text-[14px] font-semibold tracking-[0.12em] uppercase">
                {nextCompetitionLabel}
              </span>
            </div>
            {nextMatch ? (
              <MatchCard
                match={nextMatch}
                ourTeamSlug={PRIMA_SQUADRA_SLUG}
                ourTeamName={PRIMA_SQUADRA_NAME}
                variant="compact"
              />
            ) : (
              <div className="border-border/40 bg-surface-1/40 flex flex-1 flex-col gap-2.5 rounded-lg border p-5">
                <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
                  Calendario in arrivo
                </span>
                <span className="text-ink-mid text-sm">
                  Le prossime giornate saranno pubblicate appena la federazione
                  comunica gli accoppiamenti del girone.
                </span>
              </div>
            )}
            <Link
              href={`/squadre/${PRIMA_SQUADRA_SLUG}/calendario`}
              className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 self-start text-base font-semibold transition-colors"
            >
              Calendario completo
              <ArrowUpRight size={18} />
            </Link>
          </div>

          {/* Slot 3 — CLASSIFICA + STATISTICHE (20%, split verticale con
              attribution editoriale a separare i due tile). */}
          <div className="grid grid-rows-[1fr_auto_1fr] gap-px bg-surface-1/60">
            <ShortcutTile
              href={classificaUrl}
              label="Classifica"
              icon={ListOrdered}
              ariaLabelOn="Apri la classifica del campionato Prima Squadra"
              ariaLabelOff="Classifica non disponibile"
            />
            <p className="bg-surface-1/60 text-ink-low px-4 py-3 text-center text-[10px] leading-relaxed">
              Dati forniti dalla{" "}
              <a
                href="https://www.sprintesport.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-mid hover:text-brand-gold underline-offset-2 hover:underline transition-colors"
              >
                Redazione Piemonte di sprintesport.it
              </a>
            </p>
            <ShortcutTile
              href={statisticheUrl}
              label="Statistiche"
              icon={BarChart3}
              ariaLabelOn="Apri le statistiche del campionato Prima Squadra"
              ariaLabelOff="Statistiche non disponibili"
            />
          </div>
        </Container>
      </section>

      {/* BOX 2 — Settore Giovanile + Juniores (staccato verticalmente) */}
      <YouthMatchStrip />
    </>
  );
}

/**
 * Tile cliccabile (o disabled) per le shortcut Classifica/Statistiche.
 * Icona Lucide grande + label uppercase + ArrowUpRight come hint che
 * apre in tab esterna. Fallback `<div>` con stato muted quando l'URL
 * non e' ancora configurato dall'admin.
 */
function ShortcutTile({
  href,
  label,
  icon: Icon,
  ariaLabelOn,
  ariaLabelOff,
}: {
  href: string | null;
  label: string;
  icon: typeof ListOrdered;
  ariaLabelOn: string;
  ariaLabelOff: string;
}) {
  if (!href) {
    return (
      <div
        aria-label={ariaLabelOff}
        className="bg-surface-2/30 flex flex-col items-center justify-center gap-2.5 p-7 text-center"
      >
        <Icon
          size={48}
          strokeWidth={1.5}
          className="text-ink-low opacity-50"
          aria-hidden
        />
        <span className="font-display text-ink-low text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
          {label}
        </span>
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabelOn}
      className="group bg-surface-2/60 hover:bg-brand-gold/10 focus-visible:outline-brand-gold flex flex-col items-center justify-center gap-2.5 p-7 text-center transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4"
    >
      <Icon
        size={48}
        strokeWidth={1.5}
        className="text-brand-gold group-hover:text-brand-white transition-colors"
        aria-hidden
      />
      <span className="font-display text-ink-hi group-hover:text-brand-gold text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase transition-colors">
        {label}
        <ArrowUpRight
          size={20}
          className="text-ink-mid group-hover:text-brand-gold ml-1 -mt-0.5 inline transition-colors"
          aria-hidden
        />
      </span>
    </a>
  );
}
