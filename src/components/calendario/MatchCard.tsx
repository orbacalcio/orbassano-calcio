import {
  Ban,
  CalendarClock,
  ExternalLink,
  FileText,
  Info,
  Play,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { MatchSummary } from "@/sanity/fetchers";
import { TeamLogo } from "./TeamLogo";

/**
 * Card singola partita per la pagina /squadre/[slug]/calendario.
 *
 * 5 varianti di status (scheduled/live/finished/postponed/cancelled) +
 * 2 layout (default = desktop con grid orizzontale, compact = MatchStrip
 * homepage con layout verticale).
 *
 * Card cliccabile (variant=default + status=finished + report link
 * disponibile): tutta l'area diventa <a> verso reportLink (override
 * specifico) o competition.defaultReportLink (fallback). Quando la card
 * e' <a>, i logo squadre rendono come <span> non interattivi (niente
 * nesting <a> illegale).
 */
type Variant = "default" | "compact";

const ITALIAN_MONTHS_SHORT = [
  "GEN",
  "FEB",
  "MAR",
  "APR",
  "MAG",
  "GIU",
  "LUG",
  "AGO",
  "SET",
  "OTT",
  "NOV",
  "DIC",
];

function formatDay(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, "0");
}

function formatMonthShort(iso: string): string {
  return ITALIAN_MONTHS_SHORT[new Date(iso).getMonth()] ?? "—";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getResultTag(
  home: boolean,
  scoreHome: number | null,
  scoreAway: number | null,
): "V" | "P" | "N" | null {
  if (typeof scoreHome !== "number" || typeof scoreAway !== "number") return null;
  const ourScore = home ? scoreHome : scoreAway;
  const oppScore = home ? scoreAway : scoreHome;
  if (ourScore > oppScore) return "V";
  if (ourScore < oppScore) return "P";
  return "N";
}

function StatusBadge({ status }: { status: MatchSummary["status"] }) {
  if (status === "live") {
    return (
      <span className="bg-brand-red text-brand-white inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase">
        <span className="bg-brand-white h-1.5 w-1.5 animate-pulse rounded-full" />
        Live
      </span>
    );
  }
  if (status === "postponed") {
    return (
      <span className="border-orange-500/40 bg-orange-500/20 text-orange-300 inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase">
        Rinviata
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="border-brand-red/40 bg-brand-red/20 text-brand-red inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase">
        <Ban size={10} aria-hidden />
        Annullata
      </span>
    );
  }
  return null;
}

function ResultTag({ tag }: { tag: "V" | "P" | "N" }) {
  const map = {
    V: "border-brand-blue/40 bg-brand-blue/30 text-brand-blue",
    P: "border-brand-red/40 bg-brand-red/20 text-brand-red",
    N: "border-border/40 bg-surface-2 text-ink-mid",
  } as const;
  return (
    <span
      className={cn(
        "font-mono inline-flex h-5 min-w-5 items-center justify-center rounded-sm border px-1 text-[11px] font-bold",
        map[tag],
      )}
      aria-label={tag === "V" ? "Vittoria" : tag === "P" ? "Sconfitta" : "Pareggio"}
    >
      {tag}
    </span>
  );
}

type MatchCardProps = {
  match: MatchSummary;
  ourTeamSlug: string;
  ourTeamName: string;
  variant?: Variant;
};

export function MatchCard({
  match,
  ourTeamSlug,
  ourTeamName,
  variant = "default",
}: MatchCardProps) {
  // Cascata report link: match.reportLink (specifico) > competition.defaultReportLink (fallback)
  const reportHref = match.reportLink ?? match.competition?.defaultReportLink ?? null;

  // Card cliccabile solo per finished con report disponibile.
  // (Live/Scheduled/Postponed: niente report ancora, solo info.)
  const cardIsAnchor =
    match.status === "finished" && reportHref !== null;

  // Logo Orbassano: link interno alla scheda squadra, sempre se card non-anchor
  const ourLogoHref = `/squadre/${ourTeamSlug}`;

  // Logo avversario: cascata club.websiteUrl > club.tuttocampoUrl > null
  const opponentClub = match.opponent?.club ?? null;
  const opponentHref = opponentClub
    ? (opponentClub.websiteUrl ?? opponentClub.tuttocampoUrl ?? null)
    : null;

  // Nome avversario fallback
  const opponentName = match.isOpponentTbd
    ? "Da definire"
    : (opponentClub?.shortName ?? opponentClub?.name ?? "Avversario");
  const opponentLogo = match.isOpponentTbd ? null : (opponentClub?.logo ?? null);

  // Score blocco centrale
  const hasScore =
    match.status === "finished" &&
    typeof match.scoreHome === "number" &&
    typeof match.scoreAway === "number";

  const resultTag = match.status === "finished"
    ? getResultTag(match.home, match.scoreHome, match.scoreAway)
    : null;

  const competitionLabel = match.competition?.shortName ?? "";

  // ===== Compact layout (MatchStrip homepage) ===========================
  if (variant === "compact") {
    return (
      <article
        className="border-border bg-surface-2/40 hover:border-brand-gold/30 flex flex-col gap-2 rounded-lg border p-4 transition-colors"
        aria-label={`Partita ${formatDay(match.date)} ${formatMonthShort(match.date)}`}
      >
        <div className="text-ink-mid flex items-center justify-between gap-2 text-[10px] font-semibold tracking-[0.15em] uppercase">
          <span className="font-mono">
            {formatDay(match.date)} {formatMonthShort(match.date)}
            {!match.isDateTbd && ` · ${formatTime(match.date)}`}
            {match.isDateTbd && ` · TBD`}
          </span>
          <StatusBadge status={match.status} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamLogo
              src={match.home ? null : opponentLogo}
              name={match.home ? ourTeamName : opponentName}
              size={20}
              interactive={false}
              primaryColor={!match.home ? opponentClub?.primaryColor ?? null : null}
            />
            <span className="font-display text-ink-hi truncate text-sm font-bold tracking-[0.005em] uppercase">
              {match.home ? ourTeamName : opponentName}
            </span>
          </div>
          <div className="font-display text-ink-hi shrink-0 text-base font-extrabold tracking-[0.005em]">
            {hasScore ? `${match.scoreHome} - ${match.scoreAway}` : "vs"}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-display text-ink-hi truncate text-sm font-bold tracking-[0.005em] uppercase">
              {match.home ? opponentName : ourTeamName}
            </span>
            <TeamLogo
              src={match.home ? opponentLogo : null}
              name={match.home ? opponentName : ourTeamName}
              size={20}
              interactive={false}
              primaryColor={match.home ? opponentClub?.primaryColor ?? null : null}
            />
          </div>
        </div>
      </article>
    );
  }

  // ===== Default layout (pagina calendario) ============================
  const cardBase =
    "border-border bg-surface-1 group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all md:flex-row md:items-center md:gap-4 md:p-5";
  const cardInteractive =
    "hover:border-brand-gold/40 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(10,20,40,0.6)]";

  const inner = (
    <>
      {/* Box data sx */}
      <div
        className={cn(
          "border-l-2 flex shrink-0 flex-col items-center justify-center rounded-md py-2 px-3 md:w-20 md:py-3",
          match.status === "postponed" || match.status === "cancelled"
            ? "border-orange-500/60 bg-surface-2/40"
            : "border-brand-gold bg-surface-2/60",
        )}
      >
        <span
          className={cn(
            "font-display text-3xl font-extrabold leading-none",
            match.status === "postponed" || match.status === "cancelled"
              ? "text-ink-low line-through"
              : "text-ink-hi",
          )}
        >
          {formatDay(match.date)}
        </span>
        <span className="font-mono text-brand-gold text-[10px] tracking-[0.15em] uppercase">
          {formatMonthShort(match.date)}
        </span>
      </div>

      {/* Meta competition + venue */}
      <div className="flex min-w-0 flex-col gap-1 md:w-32">
        <span className="font-display text-ink-mid text-xs font-bold tracking-[0.1em] uppercase truncate">
          {competitionLabel || "—"}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              match.home
                ? "bg-brand-blue/20 text-brand-blue border border-brand-blue/40"
                : "bg-surface-2 text-ink-mid border border-border/40",
            )}
          >
            {match.home ? "Casa" : "Trasferta"}
          </span>
          <StatusBadge status={match.status} />
          {match.matchday && (
            <span className="text-ink-low font-mono text-[10px]">
              g.{match.matchday}
            </span>
          )}
        </div>
      </div>

      {/* Squadra di casa */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        {resultTag && match.home && <ResultTag tag={resultTag} />}
        <span
          className={cn(
            "font-display truncate text-base font-extrabold tracking-[0.005em] uppercase md:text-lg",
            match.home && resultTag === "P"
              ? "text-ink-mid"
              : match.home && (resultTag === "V" || resultTag === "N")
                ? "text-brand-gold"
                : "text-ink-hi",
          )}
        >
          {match.home ? ourTeamName : opponentName}
        </span>
        <TeamLogo
          src={match.home ? null : opponentLogo}
          name={match.home ? ourTeamName : opponentName}
          interactive={!cardIsAnchor}
          href={match.home ? ourLogoHref : opponentHref}
          primaryColor={!match.home ? opponentClub?.primaryColor ?? null : null}
        />
      </div>

      {/* Centro: score o orario */}
      <div className="font-display text-ink-hi flex shrink-0 items-center justify-center font-extrabold tracking-[0.005em] md:w-32 md:text-2xl">
        {hasScore ? (
          <span className="text-3xl">
            {match.scoreHome} - {match.scoreAway}
          </span>
        ) : match.status === "postponed" || match.status === "cancelled" ? (
          <span className="text-ink-low text-2xl">— — —</span>
        ) : match.isDateTbd ? (
          <span className="text-ink-mid font-mono text-sm" title="Data e ora ancora da definire">
            <CalendarClock
              size={14}
              className="-mt-0.5 mr-1 inline"
              aria-hidden
            />
            TBD
          </span>
        ) : (
          <span className="font-mono text-xl">{formatTime(match.date)}</span>
        )}
      </div>

      {/* Squadra in trasferta */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <TeamLogo
          src={match.home ? opponentLogo : null}
          name={match.home ? opponentName : ourTeamName}
          interactive={!cardIsAnchor}
          href={match.home ? opponentHref : ourLogoHref}
          primaryColor={match.home ? opponentClub?.primaryColor ?? null : null}
        />
        <span
          className={cn(
            "font-display truncate text-base font-extrabold tracking-[0.005em] uppercase md:text-lg",
            !match.home && resultTag === "P"
              ? "text-ink-mid"
              : !match.home && (resultTag === "V" || resultTag === "N")
                ? "text-brand-gold"
                : "text-ink-hi",
          )}
        >
          {match.home ? opponentName : ourTeamName}
        </span>
        {resultTag && !match.home && <ResultTag tag={resultTag} />}
      </div>

      {/* Azioni / venue extras */}
      <div className="text-ink-low flex shrink-0 items-center gap-2 md:w-24 md:justify-end">
        {match.isClosedDoors && (
          <span title="Match a porte chiuse" className="text-ink-mid">
            <Ban size={14} aria-hidden />
          </span>
        )}
        {match.highlightsUrl && (
          <a
            href={match.highlightsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Highlights su YouTube"
            className="hover:text-brand-gold transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Play size={16} />
          </a>
        )}
        {match.reportLink && cardIsAnchor === false && (
          <a
            href={match.reportLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tabellino esterno"
            className="hover:text-brand-gold transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText size={16} />
          </a>
        )}
        {cardIsAnchor && (
          <ExternalLink
            size={14}
            className="text-ink-mid"
            aria-hidden
          />
        )}
      </div>
    </>
  );

  const ariaLabel = `${match.home ? ourTeamName : opponentName} vs ${match.home ? opponentName : ourTeamName}, ${formatDay(match.date)} ${formatMonthShort(match.date)}`;

  if (cardIsAnchor && reportHref) {
    return (
      <a
        href={reportHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${ariaLabel} — apri tabellino`}
        className={cn(cardBase, cardInteractive)}
      >
        {inner}
      </a>
    );
  }

  return (
    <article
      aria-label={ariaLabel}
      className={cn(cardBase, "border-l-2", { [cardInteractive]: false })}
    >
      {inner}
      {match.notes && (
        <p
          className="text-ink-mid border-border/40 mt-2 w-full border-t pt-2 text-xs italic md:absolute md:bottom-1 md:left-5 md:mt-0 md:max-w-[60%] md:border-0 md:pt-0"
          role="note"
        >
          <Info size={12} aria-hidden className="mr-1 inline -mt-0.5" />
          {match.notes}
        </p>
      )}
    </article>
  );
}
