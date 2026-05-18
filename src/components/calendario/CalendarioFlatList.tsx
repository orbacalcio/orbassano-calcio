import type { MatchSummary } from "@/sanity/fetchers";
import { MatchCard } from "./MatchCard";

/**
 * Vista calendario "piatta" per Juniores + Settore Giovanile (richiesta
 * utente 2026-05-18): niente tab Prossime/Risultati/Tutte, tutte le
 * partite della stagione visibili in un'unica lista cronologica
 * ascendente, raggruppate per mese. La Prima Squadra continua a usare
 * CalendarioClient (con tab) perche' ha volumi maggiori e l'utente
 * tipico cerca "prossima partita" / "ultimo risultato" separatamente.
 *
 * Server component: nessuna logica di "now" o filtri dinamici. La
 * pagina parent passa solo lo slice di match della stagione selezionata
 * (gia' filtrata GROQ-side da fetchMatchesByTeam).
 */
const ITALIAN_MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
}

function monthLabel(iso: string): string {
  const d = new Date(iso);
  return `${ITALIAN_MONTHS[d.getMonth()] ?? "—"} ${d.getFullYear()}`;
}

function groupByMonth(
  matches: MatchSummary[],
): Array<{ key: string; label: string; items: MatchSummary[] }> {
  const map = new Map<string, MatchSummary[]>();
  for (const m of matches) {
    const k = monthKey(m.date);
    const list = map.get(k);
    if (list) list.push(m);
    else map.set(k, [m]);
  }
  const entries = Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: items[0] ? monthLabel(items[0].date) : key,
    items,
  }));
  entries.sort((a, b) => a.key.localeCompare(b.key));
  return entries;
}

type Props = {
  matches: MatchSummary[];
  ourTeamSlug: string;
  ourTeamName: string;
};

export function CalendarioFlatList({
  matches,
  ourTeamSlug,
  ourTeamName,
}: Props) {
  if (matches.length === 0) {
    return (
      <div className="border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center">
        <p className="text-ink-hi font-display text-xl font-bold tracking-[0.005em] uppercase">
          Calendario in arrivo
        </p>
        <p className="text-ink-mid mx-auto mt-3 max-w-md text-sm leading-relaxed">
          La LND pubblica i gironi a fine agosto. Appena disponibili,
          troverai qui tutto il calendario stagionale.
        </p>
      </div>
    );
  }

  // Ordina asc per data per il raggruppamento, poi mese-per-mese
  // mantiene l'asc all'interno.
  const sorted = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const groups = groupByMonth(sorted);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <div key={g.key} className="flex flex-col gap-3">
          <h4 className="font-display text-ink-mid sticky top-0 z-10 bg-surface-0/95 -mx-1 px-1 text-lg font-bold tracking-[0.1em] uppercase backdrop-blur-md md:text-xl">
            {g.label}
          </h4>
          <div className="flex flex-col gap-2">
            {g.items.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                ourTeamSlug={ourTeamSlug}
                ourTeamName={ourTeamName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
