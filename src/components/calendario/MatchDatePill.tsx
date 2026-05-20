import { cn } from "@/lib/cn";
import { getRomeDateParts } from "@/lib/date";

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

// Date#getDay() ritorna 0=Dom ... 6=Sab. Array indicizzato di
// conseguenza, 3 lettere uppercase per coerenza col formato mesi.
const ITALIAN_DAYS_SHORT = [
  "DOM",
  "LUN",
  "MAR",
  "MER",
  "GIO",
  "VEN",
  "SAB",
];

function formatDay(iso: string): string {
  return String(getRomeDateParts(iso).day).padStart(2, "0");
}

function formatMonthShort(iso: string): string {
  return ITALIAN_MONTHS_SHORT[getRomeDateParts(iso).month] ?? "—";
}

function formatDayOfWeek(iso: string): string {
  return ITALIAN_DAYS_SHORT[getRomeDateParts(iso).weekday] ?? "—";
}

/**
 * Pill data verticale stile juventus.com: barra **stretta e alta** che
 * va da bordo a bordo della cella (oltre i loghi squadra sopra e
 * sotto). Giorno (grande) sopra + mese abbreviato (piccolo) sotto,
 * centrati verticalmente. Border-left oro come accent.
 *
 * Niente orario sulla pill:
 *   - Per i risultati passati il kickoff non serve (la partita e'
 *     finita; quello che conta e' il giorno).
 *   - Per le prossime partite l'orario sta nel countdown laterale
 *     (vedi MatchCountdown.tsx) o sotto lo scoreboard youth ("ore HH:MM").
 *
 * Variante TBD per match con data ancora da definire (federazione
 * non ha pubblicato il girone).
 *
 * Self-stretch di default: la pill si allunga in altezza per
 * matchare il parent flex. Il consumer deve solo metterla come
 * primo figlio di una flex row; non serve `items-stretch` esplicito.
 *
 * Niente `rounded-*`: la pill e' di solito flush ai bordi di una
 * card con overflow-hidden, quindi gli angoli vengono mascherati
 * dalla card stessa. Se serve, il consumer override via className.
 */
type MatchDatePillSize = "sm" | "md";

export function MatchDatePill({
  iso,
  isDateTbd,
  className,
  size = "sm",
}: {
  iso: string;
  isDateTbd?: boolean | null;
  className?: string;
  /**
   * "sm" (default): w-12, font giorno 2xl. Usata dalla MatchCard variant
   * compact (Prima Squadra MatchStrip homepage).
   * "md": w-20, font giorno 3xl. Usata dalla YouthMatchStrip homepage
   * per allinearsi alla grandezza del date box delle pagine calendario.
   */
  size?: MatchDatePillSize;
}) {
  const isMd = size === "md";
  const box = cn(
    "border-brand-gold bg-brand-blue flex shrink-0 flex-col items-center justify-center self-stretch border-l-2",
    isMd ? "w-16 gap-1 py-3" : "w-12 gap-0.5 py-3",
    className,
  );
  const dayClass = isMd
    ? "font-display text-ink-hi text-3xl leading-none font-extrabold"
    : "font-display text-ink-hi text-2xl leading-none font-extrabold";
  const eyebrowClass = isMd
    ? "font-mono text-ink-mid text-[10px] leading-none tracking-[0.12em]"
    : "font-mono text-ink-mid text-[9px] leading-none tracking-[0.1em]";

  if (isDateTbd) {
    return (
      <div className={box} aria-label="Data da definire">
        <span
          className={cn(
            "font-display text-ink-mid leading-none font-extrabold uppercase",
            isMd ? "text-xl" : "text-lg",
          )}
        >
          TBD
        </span>
      </div>
    );
  }
  // Layout 3-righe: giorno della settimana (top, eyebrow) + numero giorno
  // (centro, prominente) + mese abbreviato (bottom). DoW in alto offre
  // info utile a colpo d'occhio ("ah, e' un sabato pomeriggio").
  return (
    <div
      className={box}
      aria-label={`${formatDayOfWeek(iso)} ${formatDay(iso)} ${formatMonthShort(iso)}`}
    >
      <span className={eyebrowClass}>{formatDayOfWeek(iso)}</span>
      <span className={dayClass}>{formatDay(iso)}</span>
      <span className={eyebrowClass}>{formatMonthShort(iso)}</span>
    </div>
  );
}
