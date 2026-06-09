import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { FaqAccordion } from "@/components/academy/FaqAccordion";
import { InfoVenueBlock } from "@/components/academy/InfoVenueBlock";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbLd } from "@/lib/json-ld";
import {
  fetchScuolaCalcioInformazioni,
  type FaqItem,
  type PriceRow,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/squadre/academy/informazioni" },
  title: "Informazioni Academy",
  description:
    "Sede, prezzi e info pratiche della Academy Orbassano: Centro Sportivo Aldo Porta, quote stagione 2026/2027, cosa è incluso, FAQ logistiche e contatti.",
};

// Fallback editoriali brand-voice.
const FALLBACK_VENUE_NAME = "Centro Sportivo Aldo Porta";
const FALLBACK_VENUE_ADDRESS = "Via Ignazio Silone, 4 · 10043 Orbassano (TO)";
const FALLBACK_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Centro+Sportivo+Aldo+Porta+Orbassano";

const FALLBACK_INCLUDED: string[] = [
  "Tessera FIGC + assicurazione integrata",
  "Kit ufficiale rossoblù (maglia + pantaloncini + calzettoni)",
  "Materiale tecnico (palloni, casacche, conetti)",
  "Visite mediche sportive non agonistiche organizzate dal club",
  "Accesso a tornei e amichevoli organizzati dal club",
];

const FALLBACK_PRICE_TABLE: PriceRow[] = [
  { label: "Quota annuale", value: "Da pubblicare" },
  { label: "Quota iscrizione una tantum", value: "Da pubblicare" },
  { label: "Sconto fratelli", value: "-10% sulla seconda quota" },
  {
    label: "Rateizzazione",
    value: "2 tranche (50% iscrizione + 50% gennaio)",
  },
];

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Dove si trova il Centro Sportivo Aldo Porta?",
    answer:
      "In Via Ignazio Silone 4, a Orbassano (TO). Parcheggio gratuito davanti al campo. Servito dalle linee urbane GTT.",
  },
  {
    question: "Cosa devo portare agli allenamenti?",
    answer:
      "Borraccia personale, scarpe adatte (non tacchetti in metallo sull'erba sintetica) e parastinchi. Il kit ufficiale viene consegnato dopo l'iscrizione.",
  },
  {
    question: "Cosa succede in caso di pioggia?",
    answer:
      "Il campo è in erba sintetica drenante: gli allenamenti continuano normalmente. Solo in caso di temporale o allerta meteo il club comunica l'annullamento via gruppo genitori.",
  },
  {
    question: "Posso assistere agli allenamenti?",
    answer:
      "Sì, l'area genitori dedicata permette di assistere senza interferire. Si chiede di non entrare nello spazio di gioco e di non interpellare gli allenatori durante la seduta.",
  },
  {
    question: "Quando comincia e finisce la stagione?",
    answer:
      "Stagione tipo: prima settimana di settembre → fine maggio. Pausa estiva luglio-agosto. Eventuali camp estivi o sessioni intermedie sono annunciati separatamente.",
  },
];

export default async function ScuolaCalcioInformazioniPage() {
  const data = await fetchScuolaCalcioInformazioni();

  const venueName = data.scInfoVenueName?.trim() || FALLBACK_VENUE_NAME;
  const venueAddress =
    data.scInfoVenueAddress?.trim() || FALLBACK_VENUE_ADDRESS;
  const mapsUrl = data.scInfoMapsUrl?.trim() || FALLBACK_MAPS_URL;
  const included =
    data.included.length > 0 ? data.included : FALLBACK_INCLUDED;
  const priceTable =
    data.priceTable.length > 0 ? data.priceTable : FALLBACK_PRICE_TABLE;
  const faq = data.faq.length > 0 ? data.faq : FALLBACK_FAQ;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Squadre", url: "/squadre" },
          { name: "Academy", url: "/squadre/academy" },
          {
            name: "Informazioni",
            url: "/squadre/academy/informazioni",
          },
        ])}
      />

      <header className="bg-surface-0 relative isolate overflow-hidden">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="pitch" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Academy · Informazioni
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Sede, prezzi, info pratiche
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Tutto quello che ti serve sapere per organizzare l&apos;inizio
              della stagione del tuo bambino.
            </p>
          </div>
        </Container>
      </header>

      {/* 2 col: Sede + Cosa è incluso */}
      <section className="bg-surface-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoVenueBlock
              name={venueName}
              address={venueAddress}
              mapsUrl={mapsUrl}
            />
            <article
              aria-labelledby="included-title"
              className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-8"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={28}
                  className="text-brand-gold mt-1 shrink-0"
                  aria-hidden
                />
                <div className="flex flex-col gap-1">
                  <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
                    Cosa è incluso
                  </span>
                  <h2
                    id="included-title"
                    className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
                  >
                    Nella quota
                  </h2>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {included.map((item) => (
                  <li
                    key={item}
                    className="text-ink-mid flex items-start gap-3 text-sm leading-relaxed md:text-base"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-brand-red mt-0.5 shrink-0"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </Container>
      </section>

      {/* Tabella prezzi */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Quote e modalità
              </span>
              <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Tabella prezzi
              </h2>
            </div>
            <div className="border-light-border bg-light-bg-1 overflow-hidden rounded-2xl border">
              <dl className="divide-light-border divide-y">
                {priceTable.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-6"
                  >
                    <dt className="text-light-ink-mid font-mono text-xs tracking-[0.15em] uppercase md:text-sm">
                      {row.label}
                    </dt>
                    <dd className="text-light-ink-hi font-display text-2xl font-bold tracking-[0.005em] md:text-3xl">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-surface-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                FAQ
              </span>
              <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Info pratiche frequenti
              </h2>
            </div>
            <FaqAccordion items={faq} />
          </div>
        </Container>
      </section>
    </>
  );
}
