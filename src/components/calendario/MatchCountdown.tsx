"use client";

import { useEffect, useState } from "react";
import { getRomeDateParts } from "@/lib/date";

const ITALIAN_DAYS = [
  "domenica",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
];

const ITALIAN_MONTHS = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

function formatItalianDateTime(iso: string): string {
  const d = getRomeDateParts(iso);
  const day = ITALIAN_DAYS[d.weekday] ?? "";
  const dd = d.day;
  const month = ITALIAN_MONTHS[d.month] ?? "";
  const hh = String(d.hour).padStart(2, "0");
  const mm = String(d.minute).padStart(2, "0");
  return `${day}, ${dd} ${month} · ${hh}:${mm}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Countdown digitale al kickoff della prossima partita. Tick ogni
 * secondo, formato "Ng HH:MM:SS" quando manca piu' di un giorno,
 * "HH:MM:SS" sotto.
 *
 * Client component (useState + setInterval). Hydration-safe: il
 * primo render usa la differenza al momento del mount, non un
 * fallback statico, evitando flash di "00:00:00" in SSR.
 *
 * Quando il countdown raggiunge 0 (match iniziato) mostra "Calcio
 * d'inizio!" — non swappa a "LIVE" perche' i dati live non sono
 * ancora integrati (vedi roadmap M7).
 */
export function MatchCountdown({ targetISO }: { targetISO: string }) {
  // now=null = pre-mount (SSR + primissimo render). Niente flag
  // "mounted" separato: il null e' gia' il segnale di non-pronti.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Primo tick via requestAnimationFrame per evitare il pattern
    // setState-sincrono-in-effect (React 19 lint rule). RAF schedula
    // il setNow al prossimo frame, fuori dal corpo dell'effect.
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const rafId = requestAnimationFrame(() => {
      setNow(Date.now());
      intervalId = setInterval(() => setNow(Date.now()), 1000);
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const mounted = now !== null;
  const target = new Date(targetISO).getTime();
  const diff = mounted ? Math.max(0, target - now) : 0;
  const isLive = mounted && diff === 0;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const clock =
    days > 0
      ? `${days}g ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
      <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
        Calcio d&apos;inizio tra
      </span>
      {/* tabular-nums per non vedere i digit "ballare" mentre il
          contatore aggiorna ogni secondo. */}
      <span
        className="font-mono text-ink-hi text-3xl font-bold tabular-nums tracking-tight md:text-4xl"
        aria-live="polite"
        // suppressHydrationWarning: dopo mount il countdown
        // diverge subito dal valore SSR (Date.now() lato server vs
        // client = sempre diversi). Lo suppress evita warning React.
        suppressHydrationWarning
      >
        {mounted ? (isLive ? "Calcio d'inizio!" : clock) : "—"}
      </span>
      <span className="text-ink-mid font-mono mt-1 text-[11px] tracking-[0.1em] uppercase">
        {formatItalianDateTime(targetISO)}
      </span>
    </div>
  );
}
