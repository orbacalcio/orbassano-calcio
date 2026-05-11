import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronRight, Trophy } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TeamLogo } from "@/components/calendario/TeamLogo";
import {
  fetchNextMatchesByTeamSlugs,
  type YouthNextMatch,
} from "@/sanity/fetchers";

/**
 * Mini-strip Settore Giovanile + Juniores per la homepage, sotto il
 * box principale Prima Squadra. 5 righe (Juniores · U17 · U16 · U15
 * · U14) — una per categoria — con la prossima partita scheduled di
 * ognuna. Click sulla riga -> calendario completo della squadra.
 *
 * Dimensionamento ~30% piu' compatto del box Prima Squadra (padding
 * md:p-5 invece di md:p-8, font ridotto): visivamente subordinato,
 * coerente con la gerarchia "Prima Squadra come team principale,
 * settore giovanile come supporto/profondita'".
 *
 * Le squadre che non hanno match scheduled in calendario mostrano
 * "Calendario in arrivo" + link al calendario vuoto. Niente squadra
 * viene mai nascosta — la riga e' sempre presente.
 */
const YOUTH_TEAMS: Array<{ slug: string; label: string }> = [
  { slug: "juniores", label: "Juniores" },
  { slug: "under-17", label: "Under 17" },
  { slug: "under-16", label: "Under 16" },
  { slug: "under-15", label: "Under 15" },
  { slug: "under-14", label: "Under 14" },
];

function formatMatchDate(iso: string, isDateTbd: boolean | null): string {
  if (isDateTbd) return "Data da definire";
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

function opponentLabel(match: YouthNextMatch): string {
  if (match.isOpponentTbd) return "Avversario da definire";
  const club = match.opponent?.club;
  return club?.shortName ?? club?.name ?? "—";
}

export async function YouthMatchStrip() {
  const rows = await fetchNextMatchesByTeamSlugs(
    YOUTH_TEAMS.map((t) => t.slug),
  );
  const byLabel = new Map(YOUTH_TEAMS.map((t) => [t.slug, t.label]));

  return (
    <section
      aria-label="Prossimi impegni Settore Giovanile"
      className="border-border/60 mt-4 border-y bg-surface-1/25 md:mt-6"
    >
      <Container className="py-5 md:py-6" size="wide">
        <header className="mb-4 flex items-baseline justify-between gap-4">
          <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
            <CalendarDays
              size={11}
              className="-mt-0.5 mr-1.5 inline"
              aria-hidden
            />
            Settore Giovanile · prossime partite
          </span>
          <Link
            href="/squadre"
            className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            Tutte le squadre
            <ArrowUpRight size={12} aria-hidden />
          </Link>
        </header>

        <ul className="divide-border/40 flex flex-col divide-y">
          {rows.map(({ slug, match }) => {
            const label = byLabel.get(slug) ?? slug;
            const club = match?.opponent?.club ?? null;
            const dateLabel = match
              ? formatMatchDate(match.date, match.isDateTbd)
              : null;
            const homeAway = match
              ? match.home
                ? "Casa"
                : "Trasferta"
              : null;
            // Priorita' link classifica: externalRankingUrl (campo
            // dedicato) batte defaultReportLink (Tuttocampo che mostra
            // anche risultati). Modificabile dall'admin su ogni
            // competition in Studio (cambia ogni stagione).
            const classificaUrl =
              match?.competition?.externalRankingUrl ??
              match?.competition?.defaultReportLink ??
              null;
            return (
              <li key={slug} className="flex items-stretch">
                {/* Click area principale -> calendario squadra */}
                <Link
                  href={`/squadre/${slug}/calendario`}
                  className="group hover:bg-surface-2/40 focus-visible:outline-brand-gold flex flex-1 items-center gap-3 py-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 md:gap-5 md:py-4"
                >
                  <span className="font-display text-ink-hi w-28 shrink-0 text-sm font-extrabold tracking-[0.04em] uppercase md:w-36 md:text-base">
                    {label}
                  </span>

                  {match ? (
                    <>
                      <TeamLogo
                        name={club?.shortName ?? club?.name ?? "?"}
                        src={club?.logo ?? null}
                        primaryColor={club?.primaryColor ?? null}
                        size={28}
                        interactive={false}
                      />
                      <span className="text-ink-hi flex-1 truncate text-sm md:text-base">
                        <span className="text-ink-low mr-1.5">vs</span>
                        <span className="font-medium">
                          {opponentLabel(match)}
                        </span>
                      </span>
                      <span className="text-ink-mid hidden font-mono text-xs sm:inline">
                        {homeAway}
                      </span>
                      <span aria-hidden className="text-ink-low hidden sm:inline">
                        ·
                      </span>
                      <span className="text-ink-mid font-mono text-xs md:text-sm">
                        {dateLabel}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-low flex-1 text-sm italic">
                      Calendario in arrivo
                    </span>
                  )}
                  <ChevronRight
                    size={16}
                    className="text-ink-low group-hover:text-brand-gold shrink-0 transition-colors"
                    aria-hidden
                  />
                </Link>

                {/* Tasto Classifica (esterno Sprintsport/Tuttocampo). Visibile
                    solo se l'admin ha popolato il campo competition.
                    externalRankingUrl (o defaultReportLink come fallback).
                    Modificabile dal CMS senza toccare il codice. */}
                {classificaUrl && (
                  <a
                    href={classificaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Classifica ${label}`}
                    className="text-ink-mid hover:text-brand-gold focus-visible:outline-brand-gold ml-1 inline-flex items-center gap-1.5 self-center rounded-md px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 md:gap-2 md:text-sm"
                  >
                    <Trophy size={14} aria-hidden />
                    <span className="hidden md:inline">Classifica</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
