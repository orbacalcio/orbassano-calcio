import { cn } from "@/lib/cn";

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

function formatDay(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, "0");
}

function formatMonthShort(iso: string): string {
  return ITALIAN_MONTHS_SHORT[new Date(iso).getMonth()] ?? "—";
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
export function MatchDatePill({
  iso,
  isDateTbd,
  className,
}: {
  iso: string;
  isDateTbd?: boolean | null;
  className?: string;
}) {
  const box = cn(
    "border-brand-gold bg-surface-0 flex w-12 shrink-0 flex-col items-center justify-center gap-1 self-stretch border-l-2 py-4",
    className,
  );
  if (isDateTbd) {
    return (
      <div className={box} aria-label="Data da definire">
        <span className="font-display text-ink-mid text-lg leading-none font-extrabold uppercase">
          TBD
        </span>
      </div>
    );
  }
  return (
    <div className={box} aria-label={`${formatDay(iso)} ${formatMonthShort(iso)}`}>
      <span className="font-display text-ink-hi text-2xl leading-none font-extrabold">
        {formatDay(iso)}
      </span>
      <span className="font-mono text-ink-mid text-[10px] leading-none tracking-[0.1em]">
        {formatMonthShort(iso)}
      </span>
    </div>
  );
}
