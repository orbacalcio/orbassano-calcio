import { Container } from "@/components/ui/Container";

/**
 * Marquee orizzontale infinito con i nomi dei campioni che si sono
 * allenati al Mazzola. Implementato in puro CSS (senza framer-motion)
 * per avere animazione fluida senza JS, e pausa via prefers-reduced-motion
 * gestita dal globals.css globale.
 */
const CHAMPIONS = [
  "Roberto Baggio",
  "Gianluca Vialli",
  "Alessandro Del Piero",
  "Fabrizio Ravanelli",
  "Angelo Peruzzi",
  "Francesco Graziani",
  "Paolo Pulici",
  "Claudio Sala",
  "Roberto Cravero",
  "Gianluigi Lentini",
];

export function ChampionsMarquee() {
  // Duplico l'array per ottenere lo scroll infinito senza salto visibile.
  const reel = [...CHAMPIONS, ...CHAMPIONS];

  return (
    <section
      aria-label="Da qui sono passati i campioni del calcio italiano"
      className="bg-surface-1 relative overflow-hidden border-y border-border/50 py-16"
    >
      {/* Bagliore radiale rosso a centro per dare profondita' al nero */}
      <div
        aria-hidden
        className="bg-brand-red/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
      />
      <Container className="relative flex flex-col items-center gap-3 text-center" size="default">
        <span className="text-brand-gold font-display text-xs font-semibold tracking-[0.3em] uppercase">
          Sul nostro stadio
        </span>
        <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
          Si sono allenati i campioni che hanno fatto la storia del calcio
          italiano
        </h2>
      </Container>

      <div className="relative mt-12 overflow-hidden">
        {/* Sfumature laterali per fade-out elegante */}
        <div
          aria-hidden
          className="from-surface-1 absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r to-transparent"
        />
        <div
          aria-hidden
          className="from-surface-1 absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l to-transparent"
        />
        <ul
          className="flex w-max items-center gap-12 motion-safe:animate-[marquee_40s_linear_infinite]"
          aria-hidden="true"
        >
          {reel.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="font-display text-ink-mid hover:text-brand-gold flex shrink-0 items-center gap-12 text-5xl leading-none font-black tracking-[0.01em] uppercase transition-colors sm:text-6xl"
            >
              <span>{name}</span>
              <span className="text-brand-gold/40 text-3xl" aria-hidden>
                ●
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lista accessibile invisibile per screen reader */}
      <ul className="sr-only">
        {CHAMPIONS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
