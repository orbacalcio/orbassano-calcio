import Image from "next/image";
import { tokens } from "@/lib/design-tokens";

/**
 * Homepage placeholder M0 — scaffolding visivo del brand.
 *
 * Verra' interamente sostituita in M3 con hero cinematografico, match
 * strip, news, marquee "Da qui sono passati" e sponsor row. Per ora
 * questo schermo serve un solo scopo: dimostrare che palette e font
 * sono caricati correttamente e che ogni inquadratura del sito e'
 * riconoscibilmente blu navy + rossoblu.
 */

const brandSwatches = [
  { name: "Brand Blue", hex: tokens.brand.blue, note: "logo · primario" },
  { name: "Brand Red", hex: tokens.brand.red, note: "CTA · live · vittoria" },
  { name: "Brand Gold", hex: tokens.brand.gold, note: "celebrazioni · 95 anni" },
  { name: "Brand White", hex: tokens.brand.white, note: "stemma · wordmark" },
] as const;

const surfaceSwatches = [
  { name: "Surface 0", hex: tokens.surface[0], note: "sfondo principale" },
  { name: "Surface 1", hex: tokens.surface[1], note: "sezioni · card" },
  { name: "Surface 2", hex: tokens.surface[2], note: "hero overlay" },
  { name: "Surface 3", hex: tokens.surface[3], note: "hover · attivo" },
] as const;

const inkSwatches = [
  { name: "Ink Hi", hex: tokens.ink.hi, note: "titoli · body" },
  { name: "Ink Mid", hex: tokens.ink.mid, note: "secondario" },
  { name: "Ink Low", hex: tokens.ink.low, note: "hint · label" },
] as const;

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      {/* Bagliore di brand sullo sfondo per dare profondita' senza essere */}
      {/* gradient-y o glow neon. Resta dentro la famiglia navy+rosso. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="bg-brand-blue/25 absolute -top-32 -left-32 h-[36rem] w-[36rem] rounded-full blur-[120px]" />
        <div className="bg-brand-red/15 absolute -right-40 top-40 h-[28rem] w-[28rem] rounded-full blur-[140px]" />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 sm:py-28 lg:px-10">
        {/* Header con logo + meta milestone */}
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-surface-1 ring-border flex h-16 w-16 items-center justify-center rounded-2xl ring-1">
              <Image
                src="/Logo_Orbassano_2K.png"
                alt="Stemma ASD Orbassano Calcio"
                width={56}
                height={56}
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-ink-low font-mono text-xs tracking-widest uppercase">
                A.S.D. Orbassano Calcio · dal 1930
              </span>
              <span className="text-ink-hi text-base font-medium">
                orbassanocalcio.com
              </span>
            </div>
          </div>

          <div className="border-border bg-surface-1/60 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur">
            <span className="bg-brand-red relative flex h-2 w-2 rounded-full">
              <span className="bg-brand-red absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            </span>
            <span className="text-ink-mid font-mono text-xs tracking-widest uppercase">
              Milestone 0 · scaffolding
            </span>
          </div>
        </header>

        {/* Hero: Bebas Neue gigante */}
        <div className="flex flex-col gap-8">
          <h1 className="font-display text-ink-hi text-6xl leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
            Dal 1930
            <br />
            il calcio di
            <br />
            <span className="text-brand-gold">Orbassano</span>
          </h1>
          <p className="text-ink-mid max-w-2xl text-lg leading-relaxed sm:text-xl">
            Stiamo ricostruendo il sito ufficiale del club. Questa schermata e'
            il primo controllo visivo del nuovo design system: palette estratta
            dallo stemma, tipografia editoriale, dark navy identitario. Da qui
            si parte.
          </p>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="bg-brand-red/15 text-brand-red border-brand-red/30 rounded-full border px-3 py-1 tracking-widest uppercase">
              Rossoblu
            </span>
            <span className="bg-brand-gold/15 text-brand-gold border-brand-gold/40 rounded-full border px-3 py-1 tracking-widest uppercase">
              95 anni
            </span>
            <span className="bg-surface-2 text-ink-mid border-border rounded-full border px-3 py-1 tracking-widest uppercase">
              Promozione PIE/VdA · Girone B · 2025/26
            </span>
          </div>
        </div>

        {/* Tipografia in azione */}
        <div className="border-border bg-surface-1/40 grid gap-8 rounded-3xl border p-8 sm:grid-cols-2 sm:p-10">
          <div className="flex flex-col gap-3">
            <span className="text-ink-low font-mono text-xs tracking-widest uppercase">
              Display · Bebas Neue
            </span>
            <span className="font-display text-ink-hi text-7xl leading-none">
              ORBA
            </span>
            <span className="text-ink-mid text-sm">
              Per H1, hero, numeri di maglia, score, statistiche.
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-ink-low font-mono text-xs tracking-widest uppercase">
              Body · Inter
            </span>
            <span className="text-ink-hi text-3xl font-semibold">
              Ogni partita una storia.
            </span>
            <span className="text-ink-mid text-sm leading-relaxed">
              Per navigation, body, label, form. Pesi 400, 500, 600, 700.
              Accenti italiani gestiti correttamente: societa, perche, e/e.
            </span>
          </div>
        </div>

        {/* Palette brand */}
        <Section
          title="Palette Brand"
          subtitle="Estratta direttamente dal logo ufficiale via scripts/extract-palette.py"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {brandSwatches.map((s) => (
              <Swatch key={s.hex} name={s.name} hex={s.hex} note={s.note} />
            ))}
          </div>
        </Section>

        {/* Scala navy */}
        <Section
          title="Scala Navy"
          subtitle="Sfondi e superfici. Mai nero puro: identita' blu sempre riconoscibile."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {surfaceSwatches.map((s) => (
              <Swatch key={s.hex} name={s.name} hex={s.hex} note={s.note} />
            ))}
          </div>
        </Section>

        {/* Inchiostro */}
        <Section
          title="Inchiostro"
          subtitle="Testo virato leggermente blu. Mai bianco puro."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {inkSwatches.map((s) => (
              <Swatch key={s.hex} name={s.name} hex={s.hex} note={s.note} />
            ))}
          </div>
        </Section>

        {/* Footer M0 */}
        <footer className="border-border text-ink-low flex flex-col gap-2 border-t pt-8 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>
            M0 · scaffolding completato · Next.js 16 · Tailwind v4 · React 19
          </span>
          <span className="text-ink-mid">
            Prossima milestone: M1 — Sanity setup
          </span>
        </footer>
      </section>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-ink-hi text-3xl tracking-wide">
          {title}
        </h2>
        <p className="text-ink-mid text-sm">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  hex,
  note,
}: {
  name: string;
  hex: string;
  note: string;
}) {
  return (
    <div className="border-border bg-surface-1 flex flex-col overflow-hidden rounded-2xl border">
      <div className="h-24 w-full" style={{ backgroundColor: hex }} />
      <div className="flex flex-col gap-1 p-4">
        <span className="text-ink-hi text-sm font-semibold">{name}</span>
        <span className="text-ink-low font-mono text-xs">{hex}</span>
        <span className="text-ink-mid text-xs">{note}</span>
      </div>
    </div>
  );
}
