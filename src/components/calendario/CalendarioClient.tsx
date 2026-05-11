"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { MatchSummary } from "@/sanity/fetchers";
import { MatchCard } from "./MatchCard";

/**
 * Client component per /squadre/[slug]/calendario.
 *
 * Tabs (Prossime / Risultati / Tutte):
 *  - URL canonico: ?tab=prossime|risultati|tutte (default "prossime")
 *  - router.replace su cambio tab (no full reload, scroll preserved)
 *  - Tab attivo: underline gold + font-bold + opacity 1
 *  - Tab inattivo: opacity 0.6 + no underline
 *
 * Raggruppamento per mese:
 *  - Header "Settembre 2026" in font-display tracking-[0.1em] uppercase
 *  - Sticky CSS `top: 0` (la barra tabs sta sopra in altro sticky parent)
 *
 * Stati vuoti contestuali:
 *  - prossime vuota + risultati popolato → "Stagione conclusa"
 *  - risultati vuota + prossime popolato → "Nessuna partita ancora giocata"
 *  - entrambe vuote → handled da parent page
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

type Tab = "prossime" | "risultati" | "tutte";

const VALID_TABS: ReadonlySet<Tab> = new Set(["prossime", "risultati", "tutte"]);

function parseTab(raw: string | null): Tab {
  if (raw && VALID_TABS.has(raw as Tab)) return raw as Tab;
  return "prossime";
}

function isPast(match: MatchSummary, now: number): boolean {
  if (match.status === "finished") return true;
  if (match.status === "cancelled") return true;
  return new Date(match.date).getTime() < now;
}

function isFuture(match: MatchSummary, now: number): boolean {
  if (match.status === "finished") return false;
  if (match.status === "cancelled") return false;
  // postponed senza data nuova → trattato come futuro (non ancora giocato)
  return new Date(match.date).getTime() >= now;
}

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
  direction: "asc" | "desc",
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
  entries.sort((a, b) =>
    direction === "asc" ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key),
  );
  return entries;
}

type Props = {
  matches: MatchSummary[];
  ourTeamSlug: string;
  ourTeamName: string;
};

export function CalendarioClient({ matches, ourTeamSlug, ourTeamName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [now] = useState<number>(() => Date.now());

  const activeTab = parseTab(searchParams.get("tab"));

  const counts = useMemo(() => {
    const prossime = matches.filter((m) => isFuture(m, now)).length;
    const risultati = matches.filter((m) => isPast(m, now)).length;
    return { prossime, risultati, tutte: matches.length };
  }, [matches, now]);

  const filtered = useMemo(() => {
    if (activeTab === "prossime") {
      return matches.filter((m) => isFuture(m, now)).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }
    if (activeTab === "risultati") {
      return matches.filter((m) => isPast(m, now)).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }
    // tutte: prossime asc, poi risultati desc — separati visivamente
    return matches;
  }, [matches, activeTab, now]);

  const grouped = useMemo(() => {
    if (activeTab === "tutte") {
      const future = matches
        .filter((m) => isFuture(m, now))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      const past = matches
        .filter((m) => isPast(m, now))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      return {
        future: groupByMonth(future, "asc"),
        past: groupByMonth(past, "desc"),
      };
    }
    return {
      future: [] as ReturnType<typeof groupByMonth>,
      past: [] as ReturnType<typeof groupByMonth>,
    };
  }, [matches, activeTab, now]);

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "prossime") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  const tabClass = (tab: Tab) =>
    activeTab === tab
      ? "font-display text-ink-hi font-bold border-b-2 border-brand-gold"
      : "font-display text-ink-mid hover:text-ink-hi font-semibold opacity-60 border-b-2 border-transparent";

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs sticky */}
      <div
        role="tablist"
        aria-label="Filtra partite"
        className="border-border/50 bg-surface-0/95 sticky top-0 z-20 flex gap-6 border-b backdrop-blur-md"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "prossime"}
          onClick={() => setTab("prossime")}
          className={`${tabClass("prossime")} pb-3 pt-2 text-sm tracking-[0.1em] uppercase transition-colors`}
        >
          Prossime{" "}
          <span className="text-ink-low font-mono text-xs">
            ({counts.prossime})
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "risultati"}
          onClick={() => setTab("risultati")}
          className={`${tabClass("risultati")} pb-3 pt-2 text-sm tracking-[0.1em] uppercase transition-colors`}
        >
          Risultati{" "}
          <span className="text-ink-low font-mono text-xs">
            ({counts.risultati})
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tutte"}
          onClick={() => setTab("tutte")}
          className={`${tabClass("tutte")} pb-3 pt-2 text-sm tracking-[0.1em] uppercase transition-colors`}
        >
          Tutte{" "}
          <span className="text-ink-low font-mono text-xs">
            ({counts.tutte})
          </span>
        </button>
      </div>

      {/* Contenuto */}
      {activeTab === "tutte" ? (
        <div className="flex flex-col gap-12">
          {grouped.future.length > 0 && (
            <section aria-label="Prossime partite">
              <h3 className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                Prossime
              </h3>
              <div className="mt-4 flex flex-col gap-8">
                {grouped.future.map((g) => (
                  <MonthGroup
                    key={`future-${g.key}`}
                    label={g.label}
                    items={g.items}
                    ourTeamSlug={ourTeamSlug}
                    ourTeamName={ourTeamName}
                  />
                ))}
              </div>
            </section>
          )}
          {grouped.past.length > 0 && (
            <section
              aria-label="Risultati passati"
              className={grouped.future.length > 0 ? "border-border/40 border-t pt-12" : ""}
            >
              <h3 className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                Risultati
              </h3>
              <div className="mt-4 flex flex-col gap-8">
                {grouped.past.map((g) => (
                  <MonthGroup
                    key={`past-${g.key}`}
                    label={g.label}
                    items={g.items}
                    ourTeamSlug={ourTeamSlug}
                    ourTeamName={ourTeamName}
                  />
                ))}
              </div>
            </section>
          )}
          {grouped.future.length === 0 && grouped.past.length === 0 && (
            <EmptyAll />
          )}
        </div>
      ) : (
        <SingleTab
          tab={activeTab}
          matches={filtered}
          counts={counts}
          ourTeamSlug={ourTeamSlug}
          ourTeamName={ourTeamName}
          onSwitchTab={setTab}
        />
      )}
    </div>
  );
}

function MonthGroup({
  label,
  items,
  ourTeamSlug,
  ourTeamName,
}: {
  label: string;
  items: MatchSummary[];
  ourTeamSlug: string;
  ourTeamName: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-display text-ink-mid sticky top-12 z-10 bg-surface-0/95 -mx-1 px-1 text-lg font-bold tracking-[0.1em] uppercase backdrop-blur-md md:text-xl">
        {label}
      </h4>
      <div className="flex flex-col gap-2">
        {items.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            ourTeamSlug={ourTeamSlug}
            ourTeamName={ourTeamName}
          />
        ))}
      </div>
    </div>
  );
}

function SingleTab({
  tab,
  matches,
  counts,
  ourTeamSlug,
  ourTeamName,
  onSwitchTab,
}: {
  tab: "prossime" | "risultati";
  matches: MatchSummary[];
  counts: { prossime: number; risultati: number; tutte: number };
  ourTeamSlug: string;
  ourTeamName: string;
  onSwitchTab: (tab: Tab) => void;
}) {
  if (matches.length === 0) {
    return (
      <EmptyContextual
        tab={tab}
        counts={counts}
        onSwitchTab={onSwitchTab}
      />
    );
  }
  const direction = tab === "prossime" ? "asc" : "desc";
  const groups = groupByMonth(matches, direction);
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <MonthGroup
          key={g.key}
          label={g.label}
          items={g.items}
          ourTeamSlug={ourTeamSlug}
          ourTeamName={ourTeamName}
        />
      ))}
    </div>
  );
}

function EmptyContextual({
  tab,
  counts,
  onSwitchTab,
}: {
  tab: "prossime" | "risultati";
  counts: { prossime: number; risultati: number; tutte: number };
  onSwitchTab: (tab: Tab) => void;
}) {
  if (tab === "prossime" && counts.risultati > 0) {
    return (
      <div className="border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center">
        <p className="text-ink-hi font-display text-xl font-bold tracking-[0.005em] uppercase">
          Stagione conclusa
        </p>
        <p className="text-ink-mid mx-auto mt-3 max-w-md text-sm leading-relaxed">
          Tutte le partite della stagione sono state giocate.
        </p>
        <button
          type="button"
          onClick={() => onSwitchTab("risultati")}
          className="text-brand-gold hover:text-brand-white mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          Vai ai risultati
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }
  if (tab === "risultati" && counts.prossime > 0) {
    return (
      <div className="border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center">
        <p className="text-ink-hi font-display text-xl font-bold tracking-[0.005em] uppercase">
          Nessuna partita ancora giocata
        </p>
        <p className="text-ink-mid mx-auto mt-3 max-w-md text-sm leading-relaxed">
          La stagione non e&apos; ancora iniziata o tutte le giornate sono
          ancora da giocare.
        </p>
        <button
          type="button"
          onClick={() => onSwitchTab("prossime")}
          className="text-brand-gold hover:text-brand-white mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          Vai al calendario
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }
  return <EmptyAll />;
}

function EmptyAll() {
  return (
    <div className="border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center">
      <p className="text-ink-hi font-display text-xl font-bold tracking-[0.005em] uppercase">
        Calendario in arrivo
      </p>
      <p className="text-ink-mid mx-auto mt-3 max-w-md text-sm leading-relaxed">
        La LND pubblica i gironi a fine agosto. Appena disponibili, troverai
        qui tutto il calendario stagionale.
      </p>
    </div>
  );
}
