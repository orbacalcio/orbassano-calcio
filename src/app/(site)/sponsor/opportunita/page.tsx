import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  Handshake,
  Sparkles,
  Users,
} from "lucide-react";
import { SponsorLeadForm } from "@/components/forms/SponsorLeadForm";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/sponsor/opportunita" },
  title: "Diventa sponsor",
  description:
    "Pacchetti sponsorizzazione ASD Orbassano Calcio: Main Sponsor, Official Sponsor, Corporate Partner. Richiedi una proposta su misura per la tua azienda.",
};

type Stat = { value: string; label: string };

// Fallback usato se in Studio (Impostazioni globali → "Pagina Opportunità
// — Box numeri") non è stato inserito nulla.
const DEFAULT_NUMBERS: Stat[] = [
  { value: "+95", label: "Anni di rossoblù" },
  { value: "23", label: "Atleti prima squadra" },
  { value: "120+", label: "Giovani nel SGS" },
  { value: "9", label: "Partecipazioni Serie D" },
  { value: "10K+", label: "Reach social mensile" },
  { value: "30+", label: "Partite ufficiali/anno" },
];

async function fetchSponsorStats(): Promise<Stat[]> {
  try {
    const data = (await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    )) as { sponsorStats?: Stat[] | null } | null;
    const stats = data?.sponsorStats;
    return stats && stats.length > 0 ? stats : DEFAULT_NUMBERS;
  } catch {
    return DEFAULT_NUMBERS;
  }
}

const PACKAGES = [
  {
    icon: Crown,
    title: "Main Sponsor",
    badge: "Massima visibilità",
    body: "Logo sulla maglia da gioco, presenza in topbar del sito, banner all'impianto sportivo, contenuti social dedicati. Il pacchetto più visibile della stagione, riservato a un numero limitato di brand.",
  },
  {
    icon: Sparkles,
    title: "Official Sponsor",
    badge: "Visibilità mirata",
    body: "Logo nella sezione sponsor del sito, nei materiali ufficiali e nei comunicati stampa. Banner all'impianto sportivo Aldo Porta nei giorni di partita. Mention dedicate sui social.",
  },
  {
    icon: Handshake,
    title: "Corporate Partner",
    badge: "Convenzione benefit",
    body: "Programma convenzioni per i tesserati e le famiglie del club. Visibilità nella pagina Partner del sito, brochure scaricabile, mention nei canali ufficiali.",
  },
  {
    icon: Users,
    title: "Sponsorizzazione evento",
    badge: "Singolo evento",
    body: "Sponsorship one-shot per eventi specifici: derby, stagione SGS, tornei estivi, open day. Ideale per sperimentare la collaborazione prima di un pacchetto annuale.",
  },
];

export default async function OpportunitaPage() {
  const numbers = await fetchSponsorStats();
  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="pitch" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <Link
            href="/sponsor"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Tutti gli sponsor
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Diventa sponsor
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Una community di imprenditori dietro la maglia
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              ASD Orbassano Calcio &egrave; una <strong className="text-ink-hi">Business
              Community</strong>: imprenditori, manager e professionisti del
              territorio che fanno gioco di squadra. La sponsorizzazione
              non &egrave; solo visibilit&agrave; sulla maglia, &egrave;
              entrare in una rete di relazioni che si attiva ogni domenica
              al campo e tutti i giorni nel territorio.
            </p>
          </div>
        </Container>
      </header>

      <section
        aria-label="Numeri del club"
        className="bg-surface-1 border-border/50 border-y"
      >
        <Container className="py-12 lg:py-16" size="wide">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {numbers.map((n) => (
              <li key={n.label} className="flex flex-col gap-1">
                <span className="font-display text-brand-gold text-3xl leading-none font-black tracking-[0.005em] sm:text-4xl">
                  {n.value}
                </span>
                <span className="text-ink-mid text-xs leading-relaxed">
                  {n.label}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                Pacchetti
              </span>
              <h2 className="font-display text-light-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                Quattro modi di entrare nella famiglia rossobl&ugrave;
              </h2>
              <p className="text-light-ink-mid max-w-2xl text-sm leading-relaxed">
                Ogni pacchetto &egrave; modulabile sulla base del tuo budget e
                degli obiettivi di campagna. Compila il form sotto e ti
                prepariamo una proposta su misura.
              </p>
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
              {PACKAGES.map((p) => (
                <li
                  key={p.title}
                  className="border-border bg-surface-1 hover:border-brand-gold/30 flex flex-col gap-4 rounded-2xl border p-7 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p.icon size={28} className="text-brand-gold" aria-hidden />
                    <span className="border-border text-ink-low font-mono inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[10px] tracking-[0.15em] uppercase">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase">
                    {p.title}
                  </h3>
                  <p className="text-ink-mid text-sm leading-relaxed">{p.body}</p>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </Container>
      </section>

      <section
        aria-labelledby="form-title"
        className="bg-surface-2 relative overflow-hidden"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-brand-red/20 absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
          <div className="bg-brand-blue/40 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        </div>

        <Container className="relative grid items-start gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:py-24" size="wide">
          <div className="flex flex-col gap-5">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Inizia la conversazione
            </span>
            <h2
              id="form-title"
              className="font-display text-ink-hi text-3xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-4xl lg:text-5xl"
            >
              Raccontaci la tua azienda
            </h2>
            <p className="text-ink-mid max-w-xl text-base leading-relaxed">
              Compila il form: il direttore generale Dino Cambareri ti
              ricontatta entro 5 giorni lavorativi con una proposta tarata
              sui tuoi obiettivi. Niente listini standard, niente
              automatismi: parliamo direttamente con te.
            </p>
            {/* Stemma del club come watermark trasparente nello spazio
                vuoto a sinistra del form. Solo da lg (sotto, il form
                e' a tutta larghezza e non c'e' spazio vuoto). */}
            <div
              aria-hidden
              className="pointer-events-none mt-6 hidden justify-center lg:flex"
            >
              <Image
                src="/Logo_Orbassano_2K.png"
                alt=""
                width={520}
                height={733}
                className="h-auto w-full max-w-[300px] opacity-10"
              />
            </div>
          </div>

          <div className="border-brand-gold/30 bg-surface-1/70 rounded-3xl border p-8 backdrop-blur-sm sm:p-10">
            <SponsorLeadForm />
          </div>
        </Container>
      </section>
    </>
  );
}
