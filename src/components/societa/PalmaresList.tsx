import { Trophy } from "lucide-react";

/**
 * Palmares storico del club, hardcoded perche' i fatti sono storici e
 * non editoriali (DATA_ORBASSANO §2). I trofei vinti vivono in alto,
 * i piazzamenti notevoli in basso.
 *
 * Allineato con gli eventi storici in CMS (timeline /societa/storia)
 * — verificato il 2026-05-11. Quando arrivera' un nuovo titolo,
 * aggiornare questo array direttamente (e' un evento ogni 20+ anni,
 * non vale uno schema CMS).
 */
type PalmaresEntry = {
  competition: string;
  count?: number;
  details: string;
};

const TITLES: PalmaresEntry[] = [
  {
    competition: "Eccellenza Piemonte-VdA",
    count: 1,
    details: "2002-2003, girone B",
  },
  {
    competition: "Promozione Piemonte-VdA",
    count: 1,
    details: "1979-1980, girone B",
  },
  {
    competition: "Seconda Categoria Piemonte-VdA",
    count: 1,
    details: "2015-2016, girone G (come Aurora Sporting)",
  },
];

const PLACEMENTS: PalmaresEntry[] = [
  {
    competition: "Serie D — 2° posto Interregionale",
    details: "1982-1983, girone A",
  },
  {
    competition: "Serie D — 3° posto",
    details: "1980-1981, girone A",
  },
  {
    competition: "Serie D — semifinale playoff",
    details: "2005-2006 (vs Monopoli) · 2006-2007 (vs Casale)",
  },
  {
    competition: "Eccellenza — 2° posto",
    details: "2001-2002, girone B",
  },
  {
    competition: "Seconda Divisione — finale playoff",
    details: "1958-1959, persa ai rigori contro il Valperga",
  },
  {
    competition: "Prima Categoria — finale playoff",
    details: "2018-2019 (come Aurora Sporting Orbassano)",
  },
];

export function PalmaresList() {
  return (
    <section
      aria-labelledby="palmares-title"
      className="bg-surface-1 border-border/60 relative overflow-hidden rounded-3xl border p-8 sm:p-10 lg:p-14"
    >
      <div
        aria-hidden
        className="bg-brand-gold/15 pointer-events-none absolute -top-40 -right-32 h-80 w-80 rounded-full blur-[140px]"
      />

      <header className="relative flex flex-col gap-3">
        <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
          <Trophy size={16} aria-hidden />
          Palmarès
        </span>
        <h2
          id="palmares-title"
          className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl"
        >
          Quasi un secolo di trofei e piazzamenti
        </h2>
      </header>

      <div className="relative mt-10 grid gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="text-ink-mid font-mono text-xs tracking-[0.15em] uppercase">
            Trofei vinti
          </span>
          <ul className="flex flex-col gap-4">
            {TITLES.map((t) => (
              <li
                key={t.competition}
                className="border-border/50 flex flex-col gap-1 border-l-2 pl-4"
              >
                <div className="flex items-baseline gap-2">
                  {t.count && (
                    <span className="font-display text-brand-gold text-2xl leading-none font-black tracking-[0.005em]">
                      {t.count}×
                    </span>
                  )}
                  <span className="font-display text-ink-hi text-base leading-tight font-bold tracking-[0.005em] uppercase">
                    {t.competition}
                  </span>
                </div>
                <span className="text-ink-mid font-mono text-xs tracking-wide">
                  {t.details}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <span className="text-ink-mid font-mono text-xs tracking-[0.15em] uppercase">
            Piazzamenti notevoli
          </span>
          <ul className="flex flex-col gap-4">
            {PLACEMENTS.map((p) => (
              <li
                key={p.competition}
                className="border-border/40 flex flex-col gap-1 border-l-2 pl-4"
              >
                <span className="font-display text-ink-hi text-base leading-tight font-bold tracking-[0.005em] uppercase">
                  {p.competition}
                </span>
                <span className="text-ink-mid font-mono text-xs tracking-wide">
                  {p.details}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
