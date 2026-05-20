/**
 * Helper di formattazione data in italiano. Centralizzato per
 * evitare lo spread di `toLocaleDateString` con opzioni
 * leggermente diverse in mezza app.
 *
 * Fuso orario: tutte le date dei contenuti sono salvate in UTC (ISO
 * con `Z`). I server component girano su Vercel in UTC: senza forzare
 * il fuso, un match delle 15:00 italiane verrebbe mostrato come
 * "13:00". Per questo ogni formattazione passa SEMPRE `timeZone:
 * APP_TIME_ZONE` (o usa getRomeDateParts), così l'output e' identico
 * lato server (UTC) e lato client (browser dell'utente).
 */

export const APP_TIME_ZONE = "Europe/Rome";

export function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

export function formatItalianShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

export function getYearFromIso(iso: string): number {
  return getRomeDateParts(iso).year;
}

/**
 * Componenti calendario (giorno, mese 0-based, anno, giorno della
 * settimana 0=Dom..6=Sab, ora, minuti) di un istante ISO calcolati
 * **nel fuso orario italiano**, indipendentemente dal fuso del runtime.
 *
 * I getter nativi (getDate/getDay/getMonth/getHours...) usano il fuso
 * del runtime (UTC su Vercel) → orari e, a cavallo di mezzanotte,
 * anche giorni sbagliati. Qui usiamo Intl con timeZone esplicito.
 * Gli indici rispettano la convenzione dei getter nativi, così gli
 * array ITALIAN_DAYS/ITALIAN_MONTHS gia' presenti nei componenti
 * restano indicizzabili senza modifiche.
 */
export type RomeDateParts = {
  /** giorno del mese 1..31 (come Date#getDate) */
  day: number;
  /** mese 0..11 (come Date#getMonth) */
  month: number;
  year: number;
  /** giorno settimana 0=Dom..6=Sab (come Date#getDay) */
  weekday: number;
  /** ora 0..23 */
  hour: number;
  /** minuti 0..59 */
  minute: number;
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Formatter riusato (costoso da costruire): istanziato una volta.
const romePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function getRomeDateParts(iso: string): RomeDateParts {
  const date = new Date(iso);
  // Data non valida: evita il throw di Intl.formatToParts e ritorna
  // parti NaN (i consumer rendono "—" via lookup array undefined).
  if (Number.isNaN(date.getTime())) {
    return { day: NaN, month: NaN, year: NaN, weekday: NaN, hour: NaN, minute: NaN };
  }
  const parts = romePartsFormatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: Number(get("day")),
    month: Number(get("month")) - 1,
    year: Number(get("year")),
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
    // Alcuni runtime con hour12:false rendono "24" a mezzanotte.
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}
