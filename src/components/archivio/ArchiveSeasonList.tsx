"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/ui/FilterSelect";
import type { ArchiveTeamSeasonEntry } from "@/sanity/fetchers";

/**
 * Lista archivio stagioni con filtro per stagione (richiesta utente
 * 2026-05-21, soprattutto per mobile dove le sezioni impilate
 * diventano lunghe). I chip stagione filtrano quali sezioni vedere;
 * "Tutte" mostra l'intero archivio.
 *
 * Riceve i dati gia' raggruppati e serializzati dal server (niente
 * Map: i gruppi categoria sono array ordinati lato page). Render delle
 * card identico a prima — qui cambia solo l'aggiunta del filtro.
 */
export type ArchiveSeasonGroup = {
  season: string;
  totalMatches: number;
  categories: Array<{ category: string; entries: ArchiveTeamSeasonEntry[] }>;
};

type Props = { groups: ArchiveSeasonGroup[] };

export function ArchiveSeasonList({ groups }: Props) {
  const [activeSeason, setActiveSeason] = useState<string>("all");

  const seasons = useMemo(() => groups.map((g) => g.season), [groups]);
  const visible =
    activeSeason === "all"
      ? groups
      : groups.filter((g) => g.season === activeSeason);

  return (
    <div className="flex flex-col gap-10">
      {/* Filtro stagione a tendina: utile soprattutto su mobile, ma
          attivo a tutte le risoluzioni. Default "Tutte". */}
      <FilterSelect
        id="archivio-stagione-filter"
        label="Filtra per stagione"
        value={activeSeason}
        onChange={setActiveSeason}
        options={[
          { value: "all", label: "Tutte le stagioni" },
          ...seasons.map((s) => ({ value: s, label: s })),
        ]}
      />

      <div className="flex flex-col gap-16">
        {visible.map((group) => (
          <SeasonSection key={group.season} group={group} />
        ))}
      </div>
    </div>
  );
}

function SeasonSection({ group }: { group: ArchiveSeasonGroup }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="border-border/40 flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
        <h2 className="font-display text-ink-hi text-3xl font-extrabold tracking-[0.005em] uppercase sm:text-4xl">
          {group.season}
        </h2>
        <span className="text-ink-low font-mono text-xs tracking-[0.12em] uppercase">
          {group.totalMatches}{" "}
          {group.totalMatches === 1 ? "partita disputata" : "partite disputate"}
        </span>
      </div>
      <div className="flex flex-col gap-10">
        {group.categories.map(({ category, entries }) => (
          <div key={category} className="flex flex-col gap-4">
            <h3 className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
              {category}
            </h3>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <li
                  key={`${entry.season}-${entry.teamSlug}-${entry.competitionSlug}`}
                >
                  <TeamSeasonCard entry={entry} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamSeasonCard({ entry }: { entry: ArchiveTeamSeasonEntry }) {
  const href = `/squadre/${entry.teamSlug}/calendario?season=${encodeURIComponent(entry.season)}`;
  const hasRecord = entry.wins + entry.draws + entry.losses > 0;
  return (
    <Link
      href={href}
      className="group bg-surface-1 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span
        className="text-brand-gold font-mono text-[10px] tracking-[0.15em] uppercase line-clamp-2"
        title={entry.competitionFullName}
      >
        {entry.competitionName}
      </span>
      <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase">
        {entry.teamName}
      </span>
      {hasRecord && (
        <div className="border-border/40 mt-2 flex items-stretch gap-px overflow-hidden rounded-lg border">
          <StatCell label="V" value={entry.wins} />
          <StatCell label="N" value={entry.draws} />
          <StatCell label="P" value={entry.losses} />
        </div>
      )}
      <div className="text-ink-mid border-border/40 mt-auto flex items-center justify-between border-t pt-4 text-xs">
        <span className="font-mono tracking-wide uppercase">
          {entry.matchCount}{" "}
          {entry.matchCount === 1 ? "partita" : "partite"}
        </span>
        <ArrowUpRight
          size={14}
          className="text-brand-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-2/40 flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
      <span className="font-display text-ink-hi text-lg font-extrabold leading-none tabular-nums">
        {value}
      </span>
      <span className="text-ink-mid font-mono text-[9px] tracking-[0.15em] uppercase">
        {label}
      </span>
    </div>
  );
}
