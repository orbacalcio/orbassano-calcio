import Link from "next/link";
import { ArrowUpRight, ChevronRight, History, ListOrdered } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TeamLogo } from "@/components/calendario/TeamLogo";
import { cn } from "@/lib/cn";
import {
  fetchLastMatchesByTeamSlugs,
  fetchNextMatchesByTeamSlugs,
  type YouthLastMatch,
  type YouthNextMatch,
} from "@/sanity/fetchers";

const OUR_LOGO_SRC = "/Logo_Orbassano_2K.png";

/**
 * Mini-strip Settore Giovanile + Juniores per la homepage, sotto il
 * box principale Prima Squadra. 5 righe (Juniores · U17 · U16 · U15 ·
 * U14) — una per categoria — ognuna con:
 *   - ULTIMA partita finished (sx), con tag risultato V/X/P
 *   - PROSSIMA partita scheduled (dx), con data/ora
 *   - Bottone Classifica esterno + chevron al calendario completo
 *
 * Squadre senza match in archivio mostrano "—" al posto del box vuoto;
 * niente intera riga viene nascosta (struttura sempre coerente).
 */
const YOUTH_TEAMS: Array<{ slug: string; label: string }> = [
  { slug: "juniores", label: "Juniores" },
  { slug: "under-17", label: "Under 17" },
  { slug: "under-16", label: "Under 16" },
  { slug: "under-15", label: "Under 15" },
  { slug: "under-14", label: "Under 14" },
];

function formatMatchDate(iso: string, isDateTbd: boolean | null): string {
  if (isDateTbd) return "TBD";
  const d = new Date(iso);
  const date = d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
  });
  const time = d.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

function formatPastDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
  });
}

function opponentLabel(match: YouthNextMatch | YouthLastMatch): string {
  if (match.isOpponentTbd) return "TBD";
  const club = match.opponent?.club;
  return club?.shortName ?? club?.name ?? "—";
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

function PastMatchCell({ match }: { match: YouthLastMatch | null }) {
  if (!match) {
    return (
      <span className="text-ink-low text-xs italic md:pr-16 md:text-sm">—</span>
    );
  }
  const club = match.opponent?.club ?? null;
  const tag = getResultTag(match.home, match.scoreHome, match.scoreAway);
  const score =
    typeof match.scoreHome === "number" &&
    typeof match.scoreAway === "number"
      ? `${match.scoreHome}-${match.scoreAway}`
      : "—";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 md:pr-16">
      <TeamLogo
        name={club?.shortName ?? club?.name ?? "?"}
        src={club?.logo ?? null}
        primaryColor={club?.primaryColor ?? null}
        size={32}
        interactive={false}
      />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-ink-hi truncate text-xs font-bold tracking-[0.02em] uppercase md:text-sm">
          {opponentLabel(match)}
        </span>
        <span className="text-ink-low font-mono text-[10px] font-bold tracking-wide uppercase md:text-[11px]">
          {formatPastDate(match.date)} · {match.home ? "CASA" : "TRASFERTA"}
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <span className="font-display text-ink-hi text-2xl font-extrabold tracking-[0.005em] md:text-3xl">
          {score}
        </span>
        {tag && (
          <span
            className={cn(
              "font-mono inline-flex h-5 min-w-5 items-center justify-center rounded-sm border px-1 text-[11px] font-bold",
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
  );
}

function FutureMatchCell({ match }: { match: YouthNextMatch | null }) {
  if (!match) {
    return (
      <span className="text-ink-low text-xs italic md:text-sm">
        Calendario in arrivo
      </span>
    );
  }
  const club = match.opponent?.club ?? null;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <TeamLogo
        name={club?.shortName ?? club?.name ?? "?"}
        src={club?.logo ?? null}
        primaryColor={club?.primaryColor ?? null}
        size={32}
        interactive={false}
      />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-ink-hi truncate text-xs font-bold tracking-[0.02em] uppercase md:text-sm">
          {opponentLabel(match)}
        </span>
        <span className="text-ink-low font-mono text-[10px] font-bold tracking-wide uppercase md:text-[11px]">
          {formatMatchDate(match.date, match.isDateTbd)} ·{" "}
          {match.home ? "CASA" : "TRASFERTA"}
        </span>
      </div>
    </div>
  );
}

export async function YouthMatchStrip() {
  const slugs = YOUTH_TEAMS.map((t) => t.slug);
  const [nextRows, lastRows] = await Promise.all([
    fetchNextMatchesByTeamSlugs(slugs),
    fetchLastMatchesByTeamSlugs(slugs),
  ]);
  const nextBySlug = new Map(nextRows.map((r) => [r.slug, r.match]));
  const lastBySlug = new Map(lastRows.map((r) => [r.slug, r.match]));

  return (
    <section
      aria-label="Settore Giovanile · ultimi risultati e prossime partite"
      className="border-border/60 mt-4 border-y bg-surface-1/25 md:mt-6"
    >
      <Container className="py-5 md:py-6" size="wide">
        <header className="mb-4 flex items-baseline justify-between gap-4">
          <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
            <History
              size={11}
              className="-mt-0.5 mr-1.5 inline"
              aria-hidden
            />
            Settore Giovanile · ultimi risultati e prossime partite
          </span>
          <Link
            href="/squadre"
            className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            Tutte le squadre
            <ArrowUpRight size={12} aria-hidden />
          </Link>
        </header>

        {/* Header colonne — visibile da md in su, su mobile lo skippiamo
            per privilegiare lo spazio verticale. */}
        <div className="text-ink-low border-border/40 mb-1 hidden grid-cols-[12rem_1fr_1fr_8rem_2rem] items-center gap-x-3 gap-y-3 border-b pb-2 font-mono text-[10px] tracking-[0.15em] uppercase md:grid">
          <span>Squadra</span>
          <span className="md:pr-16">Ultimi risultati</span>
          <span>Prossime partite</span>
          <span />
          <span />
        </div>

        <ul className="divide-border/40 flex flex-col divide-y">
          {YOUTH_TEAMS.map(({ slug, label }) => {
            const lastMatch = lastBySlug.get(slug) ?? null;
            const nextMatch = nextBySlug.get(slug) ?? null;
            // Priorita' link classifica: prima la prossima competition,
            // poi la passata (per squadre senza match futuri). Fallback
            // null → bottone nascosto.
            const classificaUrl =
              nextMatch?.competition?.externalRankingUrl ??
              nextMatch?.competition?.defaultReportLink ??
              lastMatch?.competition?.externalRankingUrl ??
              lastMatch?.competition?.defaultReportLink ??
              null;
            return (
              <li
                key={slug}
                className="grid grid-cols-[8rem_1fr] items-center gap-2 py-3 md:grid-cols-[12rem_1fr_1fr_8rem_2rem] md:gap-x-3 md:gap-y-3 md:py-4"
              >
                <Link
                  href={`/squadre/${slug}/calendario`}
                  className="group flex min-w-0 items-center gap-2.5 transition-colors"
                >
                  <TeamLogo
                    name="Orbassano Calcio"
                    src={OUR_LOGO_SRC}
                    size={32}
                    interactive={false}
                  />
                  <span className="font-display text-ink-hi group-hover:text-brand-gold truncate text-sm font-extrabold tracking-[0.04em] uppercase transition-colors md:text-base">
                    {label}
                  </span>
                </Link>
                {/* Mobile: stack verticale ultima+prossima nello stesso col.
                    Desktop md: due colonne separate. */}
                <div className="col-span-1 flex flex-col gap-2 md:contents">
                  <PastMatchCell match={lastMatch} />
                  <FutureMatchCell match={nextMatch} />
                </div>
                {classificaUrl ? (
                  <a
                    href={classificaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Classifica ${label}`}
                    className="text-ink-mid hover:text-brand-gold focus-visible:outline-brand-gold col-start-2 row-start-3 inline-flex items-center gap-1.5 justify-self-start rounded-md px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 md:col-start-auto md:row-start-auto md:gap-2 md:justify-self-auto md:text-sm"
                  >
                    <ListOrdered size={14} aria-hidden />
                    <span className="hidden md:inline">Classifica</span>
                  </a>
                ) : (
                  <span aria-hidden />
                )}
                <Link
                  href={`/squadre/${slug}/calendario`}
                  aria-label={`Calendario completo ${label}`}
                  className="text-ink-low hover:text-brand-gold focus-visible:outline-brand-gold col-start-2 row-start-3 inline-flex shrink-0 items-center justify-end transition-colors focus-visible:outline-2 md:col-start-auto md:row-start-auto"
                >
                  <ChevronRight size={16} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
