import type { ScuolaCalcioTimelineSlot } from "@/sanity/fetchers";

const ORDER: Record<string, number> = {
  Lunedì: 1,
  Martedì: 2,
  Mercoledì: 3,
  Giovedì: 4,
  Venerdì: 5,
  Sabato: 6,
  Domenica: 7,
};

/**
 * Timeline settimanale: per ogni giorno con almeno uno slot, mostra
 * una "colonna giorno" con la lista delle attività. Layout responsive:
 * 1 col mobile, 3 col tablet, 7 col desktop large.
 *
 * Ordina automaticamente per giorno della settimana (lunedì → domenica)
 * e per orario di inizio crescente all'interno del giorno.
 */
export function SettimanaTimeline({
  slots,
}: {
  slots: ScuolaCalcioTimelineSlot[];
}) {
  if (slots.length === 0) return null;

  // Raggruppa per giorno
  const byDay = new Map<string, ScuolaCalcioTimelineSlot[]>();
  for (const slot of slots) {
    const list = byDay.get(slot.day) ?? [];
    list.push(slot);
    byDay.set(slot.day, list);
  }

  // Ordina giorni + slot interni per orario
  const sortedDays = Array.from(byDay.entries())
    .sort(([a], [b]) => (ORDER[a] ?? 99) - (ORDER[b] ?? 99))
    .map(
      ([day, list]) =>
        [
          day,
          [...list].sort((a, b) =>
            (a.startTime ?? "").localeCompare(b.startTime ?? ""),
          ),
        ] as const,
    );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {sortedDays.map(([day, daySlots]) => (
        <div
          key={day}
          className="border-border bg-surface-1 flex flex-col gap-4 rounded-2xl border p-4"
        >
          <h3 className="text-brand-gold font-display border-border/40 border-b pb-2 text-sm font-bold tracking-[0.15em] uppercase">
            {day}
          </h3>
          <ul className="flex flex-col gap-3">
            {daySlots.map((slot, i) => (
              <li
                key={`${day}-${i}-${slot.startTime}`}
                className="flex flex-col gap-1"
              >
                <span className="text-ink-hi font-mono text-xs tracking-wide">
                  {slot.startTime ?? "—"}
                  {slot.endTime ? `–${slot.endTime}` : ""}
                </span>
                {slot.activity && (
                  <span className="text-ink-hi text-sm font-semibold leading-snug">
                    {slot.activity}
                  </span>
                )}
                {slot.ageGroup && (
                  <span className="text-ink-low text-xs leading-snug">
                    {slot.ageGroup}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
