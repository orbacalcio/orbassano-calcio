import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  History,
  ListOrdered,
} from "lucide-react";
import { MatchCard } from "@/components/calendario/MatchCard";
import { MatchCountdown } from "@/components/calendario/MatchCountdown";
import { sanityClient } from "@/sanity/client";
import { lastMatchQuery, nextMatchQuery, settingsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import type { MatchSummary } from "@/sanity/fetchers";

/**
 * Strip "info dense" Prima Squadra sotto l'hero — banda navy full-wide
 * (bg-surface-1) ai limiti pagina, con grid 40/40/20 centrata in
 * Container:
 *    [ Ultimo risultato (40%) ][ Prossima partita (40%) ][ Classifica (20%) ]
 *
 * Niente link "Tutti i risultati" / "Calendario completo" in fondo agli
 * slot: subito sotto il box navy (stessa banda chiara, mt-8/10) c'e' un
 * unico CTA "Calendario e risultati" → /squadre/prima-squadra/calendario.
 * Pattern identico ad AllContentLink in NewsGrid: cerchio bordato +
 * freccia + label uppercase a destra. Tight contro il box, niente
 * sezione bianca intermedia.
 *
 * Le strip Juniores + Settore Giovanile Scolastico vivono in un blocco
 * separato piu' in basso nella home (vedi YouthMatchStrip), dopo il
 * manifesto, la sezione numeri e Vivi l'Orba.
 *
 * Hardcoded sulla Prima Squadra: la home rappresenta la Prima Squadra.
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
  // Statistiche: stessa cascata della classifica.
  //   1. competition.externalStatisticheUrl (prossima → poi ultima) per
  //      tenere il link agganciato alla stagione/girone corrente.
  //   2. settings.sprintsportLinks.statistiche (fallback singleton storico).
  const statisticheUrl =
    nextMatch?.competition?.externalStatisticheUrl ??
    lastMatch?.competition?.externalStatisticheUrl ??
    settings?.sprintsportLinks?.statistiche ??
    null;
  // Eyebrow per blocco: ogni match porta la sua competition reale
  // (stagione archiviata mostra il campionato in cui si e' giocato).
  const lastCompetitionLabel = buildCompetitionLabel(lastMatch, settings);
  const nextCompetitionLabel = buildCompetitionLabel(nextMatch, settings);
  // Countdown visibile SOLO se c'e' prossima partita inserita con data
  // ufficiale (no TBD). In tutti gli altri casi (no match, data TBD)
  // lo slot 3 viene rimosso e la grid si chiude a 3 colonne: lo slot
  // classifica/statistiche occupa il posto.
  const showCountdown = Boolean(nextMatch && !nextMatch.isDateTbd);
  const gridClass = showCountdown
    ? "grid grid-cols-1 gap-px lg:grid-cols-[2fr_2fr_1.1fr_1fr]"
    : "grid grid-cols-1 gap-px lg:grid-cols-[2fr_2fr_1fr]";

  return (
    <section
      aria-label="Ultimo e prossimo impegno Prima Squadra"
      className="bg-light-bg-0 py-10 lg:py-14"
    >
      <div className="border-border bg-surface-1 relative overflow-hidden border-y">
        <Container className="relative" size="wide">
          <div className={gridClass}>
            {/* Slot 1 — ULTIMO RISULTATO (40%) */}
            <div className="flex flex-col gap-4 p-8 md:p-11">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-brand-gold text-base font-bold tracking-[0.2em] uppercase">
                  <History
                    size={16}
                    className="-mt-0.5 mr-2 inline"
                    aria-hidden
                  />
                  Ultimo risultato
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
            </div>

            {/* Slot 2 — PROSSIMA PARTITA (40%) */}
            <div className="flex flex-col gap-4 p-8 md:p-11">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-brand-gold text-base font-bold tracking-[0.2em] uppercase">
                  <CalendarDays
                    size={16}
                    className="-mt-0.5 mr-2 inline"
                    aria-hidden
                  />
                  Prossima partita
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
            </div>

            {/* Slot 3 — COUNTDOWN al kickoff della prossima partita.
                Box dedicato stile juventus.com con orologio digitale
                grande che tickka ogni secondo (client component).
                Renderizzato SOLO se c'e' una prossima partita inserita
                con data ufficiale (no TBD): grid layout si chiude a
                3 colonne quando il countdown sparisce. */}
            {showCountdown && nextMatch && (
              <div className="border-border/40 flex flex-col items-stretch justify-center border-l border-r">
                <MatchCountdown targetISO={nextMatch.date} />
              </div>
            )}

            {/* Slot 4 — CLASSIFICA + STATISTICHE impilate, con
                attribution sprintesport in fondo. */}
            <div className="flex flex-col">
              <div className="grid flex-1 grid-rows-2 gap-px">
                <ShortcutTile
                  href={classificaUrl}
                  label="Classifica"
                  icon={ListOrdered}
                  ariaLabelOn="Apri la classifica del campionato Prima Squadra"
                  ariaLabelOff="Classifica non disponibile"
                />
                <ShortcutTile
                  href={statisticheUrl}
                  label="Statistiche"
                  icon={BarChart3}
                  ariaLabelOn="Apri le statistiche del campionato Prima Squadra"
                  ariaLabelOff="Statistiche non disponibili"
                />
              </div>
              <p className="text-ink-low px-4 pb-8 pt-3 text-center text-[10px] leading-relaxed md:pb-11">
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
            </div>
          </div>
        </Container>
      </div>
      {/* CTA "Calendario e risultati" tight contro il box navy: stesso
          pattern di AllContentLink in NewsGrid — label uppercase +
          freccia incorniciate da due righe orizzontali sottili
          (stile juventus.com), allineato a destra. Niente hover. */}
      <Container size="wide" className="mt-8 md:mt-10">
        <div className="flex justify-end">
          <Link
            href={`/squadre/${PRIMA_SQUADRA_SLUG}/calendario`}
            className="focus-visible:outline-brand-gold inline-flex flex-col items-stretch gap-2.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span
              aria-hidden
              className="bg-light-ink-mid/40 block h-px"
            />
            <span className="font-display text-light-ink-hi flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase">
              <span>Calendario e risultati</span>
              <ArrowRight size={14} aria-hidden />
            </span>
            <span
              aria-hidden
              className="bg-light-ink-mid/40 block h-px"
            />
          </Link>
        </div>
      </Container>
    </section>
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
        className="flex flex-col items-center justify-center gap-2.5 p-7 text-center opacity-60"
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
      className="group hover:bg-brand-gold/10 focus-visible:outline-brand-gold flex flex-col items-center justify-center gap-2.5 p-7 text-center transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4"
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
