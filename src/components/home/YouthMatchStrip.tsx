import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  ExternalLink,
  ListOrdered,
} from "lucide-react";
import { MatchDatePill } from "@/components/calendario/MatchDatePill";
import { TeamLogo } from "@/components/calendario/TeamLogo";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { APP_TIME_ZONE } from "@/lib/date";
import {
  fetchLastMatchesByTeamSlugs,
  fetchNextMatchesByTeamSlugs,
  type YouthLastMatch,
  type YouthNextMatch,
} from "@/sanity/fetchers";

const OUR_LOGO_SRC = "/Logo_Orbassano_2K.png";
const OUR_LOGO_NAME = "Orbassano Calcio";

/**
 * Mini-strip "altre squadre" per la homepage, sotto il box principale
 * Prima Squadra. Composta da DUE strip distinte:
 *
 * 1) JUNIORES (Under 19) — strip dedicata di 1 sola riga. La Juniores
 *    e' una squadra a se' nella tassonomia FIGC, NON appartiene al
 *    Settore Giovanile Scolastico.
 * 2) SETTORE GIOVANILE SCOLASTICO — fino a 4 righe (U17 · U16 · U15 · U14).
 *
 * Scoreboard format (allineato a Prima Squadra MatchCard):
 *   [HOME logo] · score · [AWAY logo]
 * Solo loghi, niente nomi squadra dentro la cella (sarebbero ridondanti:
 * la mini-label "Squadra" a sinistra del row identifica gia' la nostra
 * categoria, e l'avversario si riconosce dal logo). Lo score e' raw
 * scoreHome-scoreAway dal DB: con HOME a sinistra e AWAY a destra la
 * lettura e' inequivocabile, niente bisogno di "score in nostra
 * prospettiva" che confondeva quando non si sapeva chi era home/away.
 *
 * Filtro "no rumore vuoto":
 *   - Per ogni blocco mostriamo SOLO le righe delle squadre che hanno
 *     almeno una partita (passata o futura).
 *   - Se l'intero blocco e' vuoto → singola frase "Calendario in
 *     arrivo per tutte le categorie." al posto della tabella.
 *   - Se alcune categorie hanno partite e altre no → mostriamo le
 *     righe popolate + nota "Calendario in arrivo per le altre
 *     categorie." in coda.
 */
type TeamRow = { slug: string; label: string };

const JUNIORES_TEAMS: TeamRow[] = [
  { slug: "juniores", label: "Juniores" },
];

const SCOLASTICO_TEAMS: TeamRow[] = [
  { slug: "allievi-under-17", label: "Under 17" },
  { slug: "allievi-under-16", label: "Under 16" },
  { slug: "giovanissimi-under-15", label: "Under 15" },
  { slug: "giovanissimi-under-14", label: "Under 14" },
];

const ALL_TEAMS: TeamRow[] = [...JUNIORES_TEAMS, ...SCOLASTICO_TEAMS];

function formatTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  });
}

type ResultTag = "V" | "X" | "P";

function getResultTag(
  home: boolean,
  scoreHome: number | null,
  scoreAway: number | null,
): ResultTag | null {
  if (typeof scoreHome !== "number" || typeof scoreAway !== "number")
    return null;
  const ourScore = home ? scoreHome : scoreAway;
  const oppScore = home ? scoreAway : scoreHome;
  if (ourScore > oppScore) return "V";
  if (ourScore < oppScore) return "P";
  return "X";
}

const RESULT_TAG_CLASS: Record<ResultTag, string> = {
  V: "border-brand-gold/40 bg-brand-gold/20 text-brand-gold",
  X: "border-border/40 bg-surface-2 text-ink-mid",
  P: "border-brand-red/40 bg-brand-red/20 text-brand-red",
};


/**
 * Calcola HOME e AWAY logos per una partita. Solo loghi (no nomi
 * squadra dentro la cella).
 */
type LogoSide = {
  logoSrc: string | null;
  logoName: string;
  color: string | null;
};

function buildScoreboardLogos(
  match: YouthLastMatch | YouthNextMatch,
): { homeLogo: LogoSide; awayLogo: LogoSide } {
  const opp = match.opponent?.club ?? null;
  const oppName = match.isOpponentTbd
    ? "TBD"
    : opp?.shortName ?? opp?.name ?? "—";
  const ourLogo: LogoSide = {
    logoSrc: OUR_LOGO_SRC,
    // team.displayName (proiettato da nextMatchesByTeamSlugsQuery /
    // lastMatchesByTeamSlugsQuery come ourTeamDisplayName) con fallback
    // a "Orbassano Calcio" (richiesta utente 2026-05-18).
    logoName: match.ourTeamDisplayName || OUR_LOGO_NAME,
    color: null,
  };
  const oppLogo: LogoSide = {
    logoSrc: opp?.logo ?? null,
    logoName: oppName,
    color: opp?.primaryColor ?? null,
  };
  return match.home
    ? { homeLogo: ourLogo, awayLogo: oppLogo }
    : { homeLogo: oppLogo, awayLogo: ourLogo };
}

function PastMatchCell({ match }: { match: YouthLastMatch | null }) {
  if (!match) {
    return (
      <span className="text-ink-low text-sm italic md:text-base">
        Nessun risultato
      </span>
    );
  }
  const { homeLogo, awayLogo } = buildScoreboardLogos(match);
  const tag = getResultTag(match.home, match.scoreHome, match.scoreAway);
  // Cascata tabellino esterno (Sprintsport / Tuttocampo): prima il link
  // specifico del match, poi il fallback di competition. Identico a
  // MatchCard.tsx → Prima Squadra (cosi' anche le youth row mostrano
  // il "TABELLINO" sotto lo score quando disponibile).
  const tabellinoHref =
    match.reportLink ?? match.competition?.defaultReportLink ?? null;
  // Score raw scoreHome-scoreAway dal DB: HOME a sinistra (logo home),
  // AWAY a destra (logo away). Lettura inequivocabile.
  const hasScore =
    typeof match.scoreHome === "number" &&
    typeof match.scoreAway === "number";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
      <MatchDatePill iso={match.date} size="md" />
      <div className="flex min-w-0 flex-1 items-center">
        {/* Scoreboard row centrata. Tabellino vive DENTRO la col del score
            (flex-col items-center) — cosi' resta sempre allineato sotto
            ai numeri "1 - 3" indipendentemente dalla posizione del tag
            V/X/P, che invece flotta a destra come pillola fuori-flusso
            (absolute) per non spostare il baricentro orizzontale. */}
        <div className="relative flex w-full items-center justify-center gap-4 md:gap-6">
          <TeamLogo
            name={homeLogo.logoName}
            src={homeLogo.logoSrc}
            primaryColor={homeLogo.color}
            size={40}
            interactive={false}
          />
          <div className="flex shrink-0 flex-col items-center gap-1">
            <span
              className={cn(
                "font-display text-2xl font-extrabold tracking-[0.005em] md:text-3xl",
                hasScore ? "text-brand-red" : "text-ink-hi",
              )}
            >
              {hasScore ? (
                <span className="inline-flex items-center gap-6">
                  <span>{match.scoreHome}</span>
                  <span>{match.scoreAway}</span>
                </span>
              ) : (
                "—"
              )}
            </span>
            {tabellinoHref && (
              <a
                href={tabellinoHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apri tabellino esterno"
                className="text-brand-gold hover:text-brand-white inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase transition-colors"
              >
                Tabellino
                <ExternalLink size={11} aria-hidden />
              </a>
            )}
          </div>
          <TeamLogo
            name={awayLogo.logoName}
            src={awayLogo.logoSrc}
            primaryColor={awayLogo.color}
            size={40}
            interactive={false}
          />
          {tag && (
            <span
              className={cn(
                "font-mono absolute right-0 top-1/2 inline-flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-sm border px-1.5 text-xs font-bold",
                RESULT_TAG_CLASS[tag],
              )}
              aria-label={
                tag === "V" ? "Vittoria" : tag === "P" ? "Sconfitta" : "Pareggio"
              }
            >
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FutureMatchCell({ match }: { match: YouthNextMatch | null }) {
  if (!match) {
    return (
      <span className="text-ink-mid text-sm italic md:text-base">
        Calendario in arrivo
      </span>
    );
  }
  const { homeLogo, awayLogo } = buildScoreboardLogos(match);
  const timeStr = match.isDateTbd ? null : formatTimeOnly(match.date);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
      <MatchDatePill iso={match.date} isDateTbd={match.isDateTbd} size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex w-full items-center justify-center gap-4 md:gap-6">
          <TeamLogo
            name={homeLogo.logoName}
            src={homeLogo.logoSrc}
            primaryColor={homeLogo.color}
            size={40}
            interactive={false}
          />
          <span className="font-display text-ink-mid shrink-0 text-sm font-bold tracking-[0.1em] uppercase md:text-base">
            vs
          </span>
          <TeamLogo
            name={awayLogo.logoName}
            src={awayLogo.logoSrc}
            primaryColor={awayLogo.color}
            size={40}
            interactive={false}
          />
        </div>
        {timeStr && (
          <span className="text-ink-mid font-mono text-center text-xs font-bold tracking-wide uppercase">
            ore {timeStr}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Singolo "blocco strip" — header gold + lista righe.
 *
 * Filtra fuori le squadre senza partite (ne' passate ne' future). Tre
 * casi:
 *   - Zero squadre con partite → singola frase "Calendario in arrivo
 *     per tutte le categorie."
 *   - Tutte le squadre con partite → tabella completa
 *   - Mix → tabella con solo le squadre popolate + nota in coda
 *     "Calendario in arrivo per le altre categorie."
 */
function StripBlock({
  title,
  ariaLabel,
  teams,
  nextBySlug,
  lastBySlug,
}: {
  title: string;
  ariaLabel: string;
  teams: TeamRow[];
  nextBySlug: Map<string, YouthNextMatch | null>;
  lastBySlug: Map<string, YouthLastMatch | null>;
}) {
  const teamsWithMatches = teams.filter(({ slug }) =>
    Boolean(lastBySlug.get(slug)) || Boolean(nextBySlug.get(slug)),
  );
  const hasHiddenTeams = teamsWithMatches.length < teams.length;

  return (
    <section aria-label={ariaLabel}>
      <header className="mb-4">
        <h3 className="font-display text-ink-hi border-brand-red border-l-[5px] pl-3.5 text-2xl leading-none font-extrabold tracking-[0.04em] uppercase md:pl-4 md:text-3xl lg:text-4xl">
          {title}
        </h3>
      </header>

      {teamsWithMatches.length === 0 ? (
        <p className="text-ink-mid font-display text-base italic md:text-lg">
          Calendario in arrivo per tutte le categorie.
        </p>
      ) : (
        <>
          {/* Header colonne — md+. Stessi token tipografici del competition
              label di Prima Squadra (font-mono text-[14px] font-semibold
              tracking-[0.12em]). 6 colonne: squadra · past · future ·
              classifica · statistiche · chevron. */}
          <div className="text-ink-mid border-border/40 mb-1.5 hidden grid-cols-[7rem_1fr_1fr_7rem_7rem_2.25rem] items-center gap-x-4 gap-y-2 border-b pb-2 font-mono text-[12px] font-semibold tracking-[0.12em] uppercase md:grid">
            <span>Squadra</span>
            <span className="text-center">Ultimi risultati</span>
            <span className="text-center">Prossime partite</span>
            <span />
            <span />
            <span />
          </div>

          <ul className="divide-border/40 flex flex-col divide-y">
            {teamsWithMatches.map(({ slug, label }) => {
              const lastMatch = lastBySlug.get(slug) ?? null;
              const nextMatch = nextBySlug.get(slug) ?? null;
              const classificaUrl =
                nextMatch?.competition?.externalRankingUrl ??
                nextMatch?.competition?.defaultReportLink ??
                lastMatch?.competition?.externalRankingUrl ??
                lastMatch?.competition?.defaultReportLink ??
                null;
              // Statistiche: stesso pattern di Prima Squadra MatchStrip.
              // Per le youth NON c'e' fallback singleton (settings.sprintsport
              // .statistiche e' Prima Squadra-specifico): se la competition
              // non ha il campo, il link non appare.
              const statisticheUrl =
                nextMatch?.competition?.externalStatisticheUrl ??
                lastMatch?.competition?.externalStatisticheUrl ??
                null;
              return (
                <li
                  key={slug}
                  className="grid grid-cols-1 items-center gap-3 py-4 md:grid-cols-[7rem_1fr_1fr_7rem_7rem_2.25rem] md:gap-x-4 md:gap-y-2 md:py-4"
                >
                  {/* Mini-label squadra: testo only, narrow (~7rem). */}
                  <Link
                    href={`/squadre/${slug}/calendario`}
                    className="group flex min-w-0 items-center transition-colors"
                  >
                    <span className="font-display text-ink-hi group-hover:text-brand-gold truncate text-base font-extrabold tracking-[0.04em] uppercase transition-colors md:text-lg">
                      {label}
                    </span>
                  </Link>
                  <div className="col-span-1 flex flex-col gap-3 md:contents">
                    <PastMatchCell match={lastMatch} />
                    <FutureMatchCell match={nextMatch} />
                  </div>
                  {/* Actions wrapper su mobile (col-span-2 flex orizzontale
                      per stare in una riga sola sotto le cells); su md+
                      md:contents disperde i 3 figli direttamente nelle
                      colonne 4/5/6 del grid 6-col. */}
                  <div className="col-span-2 flex items-center gap-3 md:contents">
                    {classificaUrl ? (
                      <a
                        href={classificaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Classifica ${label}`}
                        className="text-ink-mid hover:text-brand-gold focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 md:text-base"
                      >
                        <ListOrdered size={18} aria-hidden />
                        <span className="hidden md:inline">Classifica</span>
                      </a>
                    ) : (
                      <span aria-hidden />
                    )}
                    {statisticheUrl ? (
                      <a
                        href={statisticheUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Statistiche ${label}`}
                        className="text-ink-mid hover:text-brand-gold focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 md:text-base"
                      >
                        <BarChart3 size={18} aria-hidden />
                        <span className="hidden md:inline">Statistiche</span>
                      </a>
                    ) : (
                      <span aria-hidden />
                    )}
                    <Link
                      href={`/squadre/${slug}/calendario`}
                      aria-label={`Calendario completo ${label}`}
                      className="text-ink-low hover:text-brand-gold focus-visible:outline-brand-gold ml-auto inline-flex shrink-0 items-center justify-end transition-colors focus-visible:outline-2 md:ml-0"
                    >
                      <ChevronRight size={22} aria-hidden />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          {hasHiddenTeams && (
            <p className="text-ink-mid font-display mt-5 text-sm italic md:text-base">
              Calendario in arrivo per le altre categorie.
            </p>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Sezione standalone Juniores + Settore Giovanile Scolastico per la
 * homepage. Stesso pattern visuale di MatchStrip: banda chiara esterna
 * (bg-light-bg-0) + box navy full-wide (bg-surface-1 border-y) ai limiti
 * pagina, con Container size="wide" interno che ospita i due StripBlock
 * (Juniores e Scolastico) separati da un divisore oro.
 *
 * Sta DOPO Manifesto + StoryNumbers nella home: il "drill-down" alle
 * altre squadre vive a meta' scroll, non subito sotto la Prima Squadra.
 */
export async function YouthMatchStrip() {
  const slugs = ALL_TEAMS.map((t) => t.slug);
  const [nextRows, lastRows] = await Promise.all([
    fetchNextMatchesByTeamSlugs(slugs),
    fetchLastMatchesByTeamSlugs(slugs),
  ]);
  const nextBySlug = new Map(nextRows.map((r) => [r.slug, r.match]));
  const lastBySlug = new Map(lastRows.map((r) => [r.slug, r.match]));

  return (
    // Visibile SOLO da lg (≥1024px): la tabella a 6 colonne (Juniores +
    // Settore Giovanile) ha spazio sufficiente solo da desktop. Sotto i
    // 1024px (telefoni + tablet) la nascondiamo del tutto — i risultati
    // del vivaio restano raggiungibili dal menu Calendario — per evitare
    // il layout cramped che faceva accavallare "Calendario in arrivo",
    // loghi e punteggi (richiesta utente 2026-05-22).
    <section
      aria-label="Risultati Juniores e Settore Giovanile"
      className="bg-light-bg-0 hidden py-6 lg:block lg:py-9"
    >
      <div className="border-border bg-surface-1 relative overflow-hidden border-y">
        <Container className="relative" size="wide">
          <div className="flex flex-col gap-7 py-5 md:gap-8 md:py-7">
            {/* Eyebrow sezione: firma tipografica identica agli eyebrow
                "Ultimo risultato" / "Prossima partita" del box Prima
                Squadra per coerenza visiva tra i due box navy della home. */}
            <header>
              <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase">
                I risultati del vivaio rossoblù
              </span>
            </header>
            <StripBlock
              title="Juniores"
              ariaLabel="Juniores · ultimi risultati e prossime partite"
              teams={JUNIORES_TEAMS}
              nextBySlug={nextBySlug}
              lastBySlug={lastBySlug}
            />
            <div aria-hidden className="border-brand-gold/40 border-t" />
            <StripBlock
              title="Settore Giovanile Scolastico"
              ariaLabel="Settore Giovanile Scolastico · ultimi risultati e prossime partite"
              teams={SCOLASTICO_TEAMS}
              nextBySlug={nextBySlug}
              lastBySlug={lastBySlug}
            />
          </div>
        </Container>
      </div>
    </section>
  );
}
