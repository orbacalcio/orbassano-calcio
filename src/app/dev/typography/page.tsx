import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

/**
 * Type specimen page — pagina di riferimento interno per il sistema
 * tipografico (vedi docs/TYPOGRAPHY.md §7).
 *
 * Non indicizzata, non linkata dal sito pubblico. Serve da:
 * - riferimento per nuovi componenti
 * - onboarding di nuovi developer/AI
 * - demo a sponsor o stakeholder
 */
export default function TypographyPage() {
  return (
    <div className="bg-surface-0 min-h-screen py-16">
      <Container className="flex flex-col gap-20" size="default">
        <header className="flex flex-col gap-3">
          <span className="text-brand-gold font-display text-xs font-semibold tracking-[0.3em] uppercase">
            /dev/typography · type specimen
          </span>
          <h1 className="font-display text-ink-hi text-6xl leading-[0.92] font-black tracking-[0.005em] uppercase sm:text-8xl">
            Sistema
            <br />
            tipografico
          </h1>
          <p className="text-ink-mid max-w-2xl text-base leading-relaxed">
            Tre famiglie:{" "}
            <span className="font-display font-bold uppercase">
              Big Shoulders
            </span>{" "}
            (display), <span className="font-semibold">Inter</span> (body),{" "}
            <span className="font-mono">Geist Mono</span> (dati tecnici).
          </p>
        </header>

        {/* Scala display */}
        <Section
          eyebrow="Scala display · Big Shoulders"
          title="Gerarchia titoli"
          subtitle="Pesi 400, 600, 700, 800, 900. Letter-spacing e line-height tarati per uso editoriale e cinematografico."
        >
          <div className="border-border bg-surface-1/40 flex flex-col gap-6 rounded-3xl border p-8">
            <Specimen
              eyebrow="H1 hero · 900 · LH 0.92 · LS 0.005em"
              className="font-display text-ink-hi text-8xl leading-[0.92] font-black tracking-[0.005em] uppercase"
            >
              Dal 1930
            </Specimen>
            <Specimen
              eyebrow="H1 pagina interna · 800 · LH 0.95 · LS 0.01em"
              className="font-display text-ink-hi text-6xl leading-[0.95] font-extrabold tracking-[0.01em] uppercase"
            >
              Storia del club
            </Specimen>
            <Specimen
              eyebrow="H2 sezioni · 800 · LH 1 · LS 0.01em"
              className="font-display text-ink-hi text-5xl leading-none font-extrabold tracking-[0.01em] uppercase"
            >
              Le nostre squadre
            </Specimen>
            <Specimen
              eyebrow="H3 sotto-titoli · 700 · LH 1.05 · LS 0.015em"
              className="font-display text-ink-hi text-3xl leading-[1.05] font-bold tracking-[0.015em] uppercase"
            >
              Settore Giovanile
            </Specimen>
            <Specimen
              eyebrow="H4 mini-titoli · 700 · LH 1.1 · LS 0.02em"
              className="font-display text-ink-hi text-xl leading-[1.1] font-bold tracking-[0.02em] uppercase"
            >
              Open Day
            </Specimen>
            <Specimen
              eyebrow="Eyebrow / kicker · 600 · LS 0.2em"
              className="font-display text-brand-gold text-xs font-semibold tracking-[0.2em] uppercase"
            >
              Stagione 2026/27
            </Specimen>
            <Specimen
              eyebrow="Numero maglia · 900 · LS 0"
              className="font-display text-brand-gold text-9xl leading-none font-black"
            >
              10
            </Specimen>
            <Specimen
              eyebrow="Score grande · 900"
              className="font-display text-ink-hi text-8xl leading-none font-black tabular-nums"
            >
              2 — 1
            </Specimen>
          </div>
        </Section>

        {/* Scala body */}
        <Section
          eyebrow="Scala body · Inter"
          title="Paragrafi e UI"
          subtitle="Variabile, latin + latin-ext per accenti italiani perfetti."
        >
          <div className="border-border bg-surface-1/40 grid gap-6 rounded-3xl border p-8 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                Lead 18-20px · 400
              </span>
              <p className="text-ink-hi text-xl leading-[1.6] font-normal tracking-[-0.005em]">
                Fondato nel 1930 come Gruppo Sportivo Orbassano, il club ha
                attraversato 95 anni di calcio piemontese tra fasti, fusioni e
                rinascite.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                Body 16px · 400 · LH 1.65
              </span>
              <p className="text-ink-mid text-base leading-[1.65]">
                Nove partecipazioni alla Serie D, due semifinali di playoff
                promozione tra i professionisti negli anni 2000, e una storia
                che si intreccia con quella della grande Torino calcistica:
                lo stadio Mazzola ha ospitato gli allenamenti di Torino e
                Juventus, dove si sono allenati campioni come Roberto Baggio,
                Gianluca Vialli e Alessandro Del Piero.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                Caption 14px · 400 · LS 0.005em
              </span>
              <p className="text-ink-low text-sm leading-[1.55] tracking-[0.005em]">
                Foto: archivio storico ASD Orbassano Calcio. Allenamento al
                Centro Sportivo Aldo Porta, stagione 2024/25. Fotografo: Marco
                Rossi.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                Quote 32px · 500 italic
              </span>
              <p className="text-ink-hi text-3xl leading-[1.4] font-medium italic tracking-[-0.01em]">
                «Da qui sono passati i campioni che hanno fatto la storia del
                calcio italiano.»
              </p>
            </div>
          </div>
        </Section>

        {/* Scala mono */}
        <Section
          eyebrow="Scala mono · Geist Mono"
          title="Dati tecnici"
          subtitle="Solo per CF, IBAN, P.IVA, score, matricole. Mai come decorazione."
        >
          <div className="border-border bg-surface-1/40 grid gap-6 rounded-3xl border p-8 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                Codice Fiscale (5×1000)
              </span>
              <span className="text-brand-gold font-mono text-2xl font-medium tracking-wide">
                95634370019
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                IBAN
              </span>
              <span className="text-ink-hi font-mono text-base tracking-wide">
                IT93 H085 3030 6800 0000 0002 547
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                P.IVA
              </span>
              <span className="text-ink-hi font-mono text-base">
                12100640015
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                Matricola FIGC
              </span>
              <span className="text-ink-hi font-mono text-base">710204</span>
            </div>
          </div>
        </Section>

        {/* Combinazione tipica */}
        <Section
          eyebrow="Combinazione editoriale"
          title="Eyebrow + H2 + body"
        >
          <div className="border-border bg-surface-1/40 flex flex-col gap-4 rounded-3xl border p-10">
            <span className="text-brand-gold font-display text-xs font-semibold tracking-[0.2em] uppercase">
              Settore Giovanile
            </span>
            <h2 className="font-display text-ink-hi text-5xl leading-none font-extrabold tracking-[0.01em] uppercase">
              Da qui passano i futuri Baggio
            </h2>
            <p className="text-ink-mid max-w-3xl text-lg leading-[1.65]">
              Quattro categorie, oltre 120 ragazzi, una Scuola Calcio aperta
              dai 5 anni. Lo Sporting Orbassano gestisce il Centro Sportivo
              di via Gozzano dove la passione si trasforma in metodo.
            </p>
          </div>
        </Section>
      </Container>
    </div>
  );
}

function Specimen({
  eyebrow,
  className,
  children,
}: {
  eyebrow: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
        {eyebrow}
      </span>
      <div className={className}>{children}</div>
    </div>
  );
}
