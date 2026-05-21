"use client";

import { ChevronDown, Filter } from "lucide-react";

/**
 * Filtro a tendina riusabile per tutte le pagine (richiesta utente
 * 2026-05-21: tutti i filtri del sito devono essere select native, non
 * chip/pill). Select nativa stilizzata (appearance-none + chevron),
 * larghezza piena su mobile e auto da sm+.
 *
 * `tone`: "dark" per le pagine su sfondo navy (calendario, archivio),
 * "light" per le bande chiare (archivio news).
 */
export type FilterOption = { value: string; label: string };

type Tone = "dark" | "light";

const TONES: Record<
  Tone,
  { label: string; select: string; chevron: string }
> = {
  dark: {
    label: "text-ink-mid",
    select:
      "border-border bg-surface-1 text-ink-hi hover:border-brand-gold/60",
    chevron: "text-ink-mid",
  },
  light: {
    label: "text-light-ink-mid",
    select:
      "border-light-border bg-light-bg-1 text-light-ink-hi hover:border-brand-gold/60",
    chevron: "text-light-ink-mid",
  },
};

export function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  tone = "dark",
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  tone?: Tone;
}) {
  const palette = TONES[tone];
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label
        htmlFor={id}
        className={`${palette.label} flex items-center gap-2 text-xs`}
      >
        <Filter size={14} aria-hidden />
        <span className="font-mono tracking-[0.12em] uppercase">{label}</span>
      </label>
      <div className="relative inline-flex w-full sm:w-auto">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${palette.select} focus-visible:outline-brand-gold w-full appearance-none rounded-full border py-2.5 pr-10 pl-4 font-mono text-xs tracking-[0.05em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className={`${palette.chevron} pointer-events-none absolute top-1/2 right-3 -translate-y-1/2`}
        />
      </div>
    </div>
  );
}
