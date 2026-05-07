/**
 * Design tokens del brand ASD Orbassano Calcio.
 *
 * Valori brand (blu/rosso/oro/bianco) estratti dal file
 * `public/Logo_Orbassano_2K.png` con `scripts/extract-palette.py`.
 * Scala navy delle surface tarata sul brief (Chelsea/PSG vibe), non
 * derivata matematicamente dal blu primario per evitare il "nero puro".
 *
 * Sistema tipografico a 3 famiglie (vedi `docs/TYPOGRAPHY.md`):
 * Big Shoulders Display (display) + Inter (body) + Geist Mono (dati tecnici).
 *
 * Questi token sono replicati come CSS variables in `app/globals.css`
 * (sezione `@theme`) e consumati come classi Tailwind v4. Tienili in
 * sincrono con il CSS quando aggiorni qui.
 */
export const tokens = {
  brand: {
    blue: "#213F8C",
    red: "#E91F22",
    gold: "#DFB16C",
    white: "#FEFDFD",
  },
  surface: {
    0: "#0A1428",
    1: "#0F1D38",
    2: "#16294A",
    3: "#1F3460",
  },
  border: "#1F2F4D",
  ink: {
    hi: "#F5F7FA",
    mid: "#A8B5CC",
    low: "#6B7A99",
  },
  font: {
    display: "var(--font-display)",
    body: "var(--font-body)",
    mono: "var(--font-mono)",
  },
} as const;

export type Tokens = typeof tokens;
