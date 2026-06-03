"use client";

import { useEffect, useState } from "react";

/**
 * Countdown live al go-live del sito (06.06.2026 ore 08:00 Italia).
 * Render lato client: durante SSR/prima del mount mostra "--" per
 * evitare hydration mismatch (il valore dipende da Date.now()).
 *
 * `targetIso` deve includere il fuso esplicito (es. "+02:00") cosi'
 * il calcolo non dipende dal fuso del visitatore.
 */
export function CountdownTimer({ targetIso }: { targetIso: string }) {
  const [units, setUnits] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setUnits({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const cells: Array<{ label: string; value: number | null }> = [
    { label: "Giorni", value: units?.d ?? null },
    { label: "Ore", value: units?.h ?? null },
    { label: "Min", value: units?.m ?? null },
    { label: "Sec", value: units?.s ?? null },
  ];

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-4"
      role="timer"
      aria-live="polite"
      aria-label="Tempo mancante al lancio del sito"
    >
      {cells.map(({ label, value }) => (
        <div
          key={label}
          className="border-border bg-surface-1/70 flex flex-col items-center gap-1 rounded-xl border px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
        >
          <span className="font-display text-ink-hi text-4xl leading-none font-black tabular-nums sm:text-6xl lg:text-7xl">
            {value === null ? "--" : String(value).padStart(2, "0")}
          </span>
          <span className="text-ink-low font-mono text-[10px] font-semibold tracking-[0.2em] uppercase sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
