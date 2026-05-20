import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCopy,
  Heart,
  HeartHandshake,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  alternates: { canonical: "/5x1000" },
  title: "5×1000",
  description:
    "Sostieni ASD Orbassano Calcio col 5×1000: una firma nella dichiarazione dei redditi che diventa nuovi materiali per il settore giovanile, manutenzione dei campi, trasferte. Codice fiscale 95634370019.",
};

const FISCAL_CODE = "95634370019";

const STEPS = [
  {
    number: "01",
    title: "Compila il modello fiscale",
    body: "Nel tuo Modello 730 / Redditi PF / CU trovi il riquadro «Sostegno del volontariato e delle altre organizzazioni non lucrative di utilità sociale, delle associazioni di promozione sociale».",
  },
  {
    number: "02",
    title: "Firma nel riquadro corretto",
    body: "Firma dove leggi «Sostegno delle associazioni sportive dilettantistiche riconosciute ai fini sportivi dal CONI».",
  },
  {
    number: "03",
    title: "Inserisci il codice fiscale",
    body: `Sotto la firma, scrivi il codice fiscale di ASD Orbassano Calcio: ${FISCAL_CODE}.`,
  },
  {
    number: "04",
    title: "Consegna la dichiarazione",
    body: "Tutto qui. Il commercialista o il CAF se ne occupa. La quota arriva direttamente al club, senza che tu paghi nulla in più.",
  },
];

const USES = [
  {
    icon: HeartHandshake,
    title: "Settore giovanile",
    body: "Materiali tecnici per oltre 120 ragazzi, divise di allenamento, palloni, attrezzatura specialistica.",
  },
  {
    icon: Sparkles,
    title: "Cura dei campi",
    body: "Manutenzione del manto erboso, sintetico e illuminazione del Centro Sportivo Aldo Porta.",
  },
  {
    icon: Wallet,
    title: "Trasferte e tornei",
    body: "Costi di trasporto e iscrizioni alle competizioni federali e ai tornei estivi del SGS.",
  },
];

export default function CinquePerMillePage() {
  return (
    <>
      <header className="bg-surface-2 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-brand-red/30 absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
          <div className="bg-brand-blue/40 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
          <div className="absolute inset-0 flex items-center justify-end opacity-[0.06]">
            <Image
              src="/Logo_Orbassano_2K.png"
              alt=""
              width={700}
              height={984}
              className="object-contain"
            />
          </div>
        </div>

        <Container className="relative grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28" size="wide">
          <div className="flex flex-col gap-6">
            <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <Heart size={16} aria-hidden />
              5&times;1000 &middot; senza costi per te
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-black tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Una firma
              <br />
              che cambia
              <br />
              <span className="text-brand-red">una stagione</span>
            </h1>
            <p className="text-ink-mid max-w-xl text-base leading-relaxed sm:text-lg">
              Donare il 5&times;1000 ad ASD Orbassano Calcio non costa nulla:
              &egrave; una quota della tua dichiarazione dei redditi che
              diversamente resterebbe allo Stato. Per noi diventa nuovi
              materiali per il settore giovanile, manutenzione dei campi,
              trasferte.
            </p>
          </div>

          <div className="border-brand-gold/30 bg-surface-1/70 flex flex-col gap-6 rounded-3xl border p-8 backdrop-blur-sm sm:p-10">
            <div className="flex flex-col gap-2">
              <span className="text-ink-mid font-display text-sm font-bold tracking-[0.2em] uppercase">
                Codice fiscale
              </span>
              <span className="text-brand-gold font-mono text-5xl font-medium tracking-[0.05em] sm:text-6xl">
                {FISCAL_CODE}
              </span>
              <span className="text-ink-mid text-sm">
                A.S.D. Orbassano Calcio
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="#come-fare"
                className="bg-brand-red btn-wow-sweep text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <ClipboardCopy size={16} aria-hidden />
                Come donare in 4 step
              </Link>
              <Link
                href="/contatti"
                className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                Contattaci
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <section id="come-fare" className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                Come fare
              </span>
              <h2 className="font-display text-light-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                Quattro passaggi, due minuti del tuo tempo
              </h2>
            </div>
            <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {STEPS.map((step) => (
                <li
                  key={step.number}
                  className="border-border bg-surface-1 flex flex-col gap-4 rounded-2xl border p-6"
                >
                  <span className="font-display text-brand-gold/40 text-5xl leading-none font-black tracking-[0.005em]">
                    {step.number}
                  </span>
                  <h3 className="font-display text-ink-hi text-lg leading-tight font-bold tracking-[0.01em] uppercase">
                    {step.title}
                  </h3>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </RevealOnScroll>
        </Container>
      </section>

      <section
        aria-labelledby="usi-title"
        className="bg-surface-1 border-border/50 border-y"
      >
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                Dove va la tua firma
              </span>
              <h2
                id="usi-title"
                className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl"
              >
                Tre aree dove il 5&times;1000 fa la differenza
              </h2>
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {USES.map((use) => (
                <li
                  key={use.title}
                  className="border-border bg-surface-2 flex flex-col gap-4 rounded-2xl border p-7"
                >
                  <use.icon
                    size={28}
                    className="text-brand-gold"
                    aria-hidden
                  />
                  <h3 className="font-display text-ink-hi text-xl leading-tight font-bold tracking-[0.01em] uppercase">
                    {use.title}
                  </h3>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    {use.body}
                  </p>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </Container>
      </section>
    </>
  );
}
