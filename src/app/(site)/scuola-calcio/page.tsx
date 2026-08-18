import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaqAccordion } from "@/components/scuola-calcio/FaqAccordion";
import { ScuolaCalcioHub4Box } from "@/components/scuola-calcio/Hub4Box";
import { UspCards } from "@/components/scuola-calcio/UspCards";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbLd } from "@/lib/json-ld";
import {
  fetchScuolaCalcioHome,
  type FaqItem,
  type UspCard,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/scuola-calcio" },
  title: "Scuola Calcio",
  description:
    "La Scuola Calcio di ASD Orbassano Calcio riparte dagli Esordienti: annate 2014 e 2015, calcio a 9, tecnici qualificati FIGC e kit ufficiale incluso nella quota.",
};

// Fallback editoriali brand-voice: usati quando i campi del singleton
// `academyHome` sono ancora vuoti su Sanity. Quando l'admin popola i
// campi da Studio, i valori CMS vincono.
//
// Stagione 2026/2027: la Scuola Calcio riparte con la sola categoria
// Esordienti (annate 2014 e 2015). I testi qui sotto NON devono
// promettere fasce non attive (Piccoli Amici, Primi Calci, Pulcini):
// quando il club aprira' altre annate si aggiornano insieme alle
// fasce in /scuola-calcio/programma.
const FALLBACK_HERO_EYEBROW = "Scuola Calcio";
const FALLBACK_HERO_TITLE = "Cresciamo insieme, dal 1930";

const FALLBACK_USP: UspCard[] = [
  {
    number: "01",
    title: "Tecnici qualificati FIGC",
    description:
      "Ogni gruppo ha allenatori abilitati FIGC con esperienza nel settore giovanile e formazione continua. Il rapporto allenatore/atleti è ridotto per garantire attenzione individuale.",
  },
  {
    number: "02",
    title: "Sicurezza al primo posto",
    description:
      "Impianto omologato, assicurazione FIGC inclusa, personale qualificato per il pronto intervento. Spogliatoi e accessi dedicati alle famiglie.",
  },
  {
    number: "03",
    title: "Il gioco prima del risultato",
    description:
      "Agli Esordienti si passa al calcio a 9 e si comincia a competere davvero. Ma nelle nostre sedute vengono prima il divertimento, l'autonomia tecnica e il rispetto del compagno: nessun ragazzo resta in panchina per la classifica.",
  },
  {
    number: "04",
    title: "Kit ufficiale incluso",
    description:
      "Ogni iscritto riceve il kit ufficiale rossoblù: maglia, pantaloncini, calzettoni. Senza costi aggiuntivi. I colori del club li vivi dal primo giorno.",
  },
];

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Quali annate accogliete?",
    answer:
      "Per la stagione 2026/2027 la Scuola Calcio è attiva sulla categoria Esordienti: annate 2014 e 2015. I nati nel 2013 e prima trovano posto nelle squadre del Settore Giovanile Scolastico (Giovanissimi e Allievi).",
  },
  {
    question: "Quanti allenamenti alla settimana sono previsti?",
    answer:
      "Due sedute settimanali da 90 minuti, più la partita del fine settimana. Gli orari definitivi vengono confermati dalla segreteria a inizio stagione.",
  },
  {
    question: "I tecnici sono qualificati?",
    answer:
      "Sì, tutto lo staff è abilitato FIGC con qualifiche riconosciute (Allenatore Dilettanti / UEFA C / Allenatore Giovani). Lo staff partecipa annualmente a corsi di aggiornamento.",
  },
  {
    question: "C'è una prova gratuita?",
    answer:
      "Sì, è possibile partecipare a 1-2 sedute di prova gratuita prima di formalizzare l'iscrizione. Contatta la segreteria per concordare data e orario.",
  },
  {
    question: "Come e quando si paga l'iscrizione?",
    answer:
      "Dopo la prova si compila il modulo PDF e si effettua il bonifico della quota annuale. È possibile rateizzare in due tranche parlando con la segreteria.",
  },
  {
    question: "Il kit è davvero gratuito?",
    answer:
      "Sì, il kit base (maglia + pantaloncini + calzettoni) è incluso nella quota. Eventuali accessori extra (zaino, k-way, secondo set) sono opzionali.",
  },
  {
    question: "Cosa serve per la prima lezione?",
    answer:
      "Scarpe da ginnastica con suola adatta all'erba sintetica (non tacchetti in metallo) e parastinchi. Il kit ufficiale viene consegnato dopo l'iscrizione.",
  },
  {
    question: "Mio figlio può fare anche il portiere?",
    answer:
      "Certo. Agli Esordienti il lavoro dei portieri è differenziato, con sedute specifiche curate da un preparatore qualificato.",
  },
];

export default async function ScuolaCalcioHomePage() {
  const data = await fetchScuolaCalcioHome();

  const heroEyebrow = data.scHeroEyebrow?.trim() || FALLBACK_HERO_EYEBROW;
  const heroTitle = data.scHeroTitle?.trim() || FALLBACK_HERO_TITLE;
  const uspCards = data.uspCards.length > 0 ? data.uspCards : FALLBACK_USP;
  const faq = data.faq.length > 0 ? data.faq : FALLBACK_FAQ;

  const hubBoxes = [
    {
      title: "Iscriviti",
      href: "/scuola-calcio/iscriviti",
      image: data.hubBox1Image,
    },
    {
      title: "Programma",
      href: "/scuola-calcio/programma",
      image: data.hubBox2Image,
    },
    {
      title: "Informazioni",
      href: "/scuola-calcio/informazioni",
      image: data.hubBox3Image,
    },
    {
      title: "FAQ",
      href: "#faq",
      image: data.hubBox4Image,
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Scuola Calcio", url: "/scuola-calcio" },
        ])}
      />

      {/* Hero full-width — foto se presente, altrimenti fallback navy
          + stemma (pattern TeamHeroFallback) */}
      <header className="bg-surface-0 relative isolate overflow-hidden">
        {data.heroImage ? (
          <>
            <Image
              src={data.heroImage}
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              placeholder={data.heroImageLqip ? "blur" : "empty"}
              blurDataURL={data.heroImageLqip ?? undefined}
            />
            <div
              aria-hidden
              className="bg-brand-blue absolute inset-0 opacity-40 mix-blend-multiply"
            />
            <div
              aria-hidden
              className="from-surface-0/90 via-surface-0/20 absolute inset-0 bg-gradient-to-t to-transparent"
            />
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
            />
            <HeaderMotif variant="pitch" />
          </>
        )}
        <Container
          className="relative flex min-h-[70vh] flex-col justify-end gap-4 py-16 lg:py-24"
          size="wide"
        >
          <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            {heroEyebrow}
          </span>
          <h1 className="font-display text-ink-hi max-w-4xl text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
            {heroTitle}
          </h1>
        </Container>
      </header>

      {/* Intro PT su banda chiara (pattern juventus.com) */}
      {data.scIntroBlocks && data.scIntroBlocks.length > 0 && (
        <section className="bg-light-bg-0">
          <Container className="py-16 lg:py-24" size="wide">
            <PortableTextBody
              value={data.scIntroBlocks}
              variant="light"
              className="max-w-3xl text-lg leading-relaxed md:text-xl"
            />
          </Container>
        </section>
      )}

      {/* 4 USP cards */}
      <UspCards cards={uspCards} />

      {/* Hub 4 box: Iscriviti · Programma · Informazioni · FAQ */}
      <ScuolaCalcioHub4Box boxes={hubBoxes} />

      {/* FAQ accordion (id #faq, raggiunto dal 4° box hub) */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Domande frequenti
              </span>
              <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Le risposte ai dubbi più comuni
              </h2>
            </div>
            <div className="bg-surface-0 rounded-2xl p-4 md:p-8 lg:p-10">
              <FaqAccordion items={faq} id="faq" />
            </div>
          </div>
        </Container>
      </section>

      {/* CTA finale → iscriviti */}
      <section className="bg-surface-0">
        <Container className="py-16 lg:py-24 text-center" size="wide">
          <div className="flex flex-col items-center gap-6">
            <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Pronti a scendere in campo?
            </h2>
            <p className="text-ink-mid max-w-xl text-base leading-relaxed lg:text-lg">
              Annate 2014 e 2015: compila il modulo di iscrizione e inizia la
              stagione con i colori rossoblù.
            </p>
            <Link
              href="/scuola-calcio/iscriviti"
              className="bg-brand-blue btn-wow-sweep btn-sweep-gold text-brand-white font-display hover:text-surface-0 focus-visible:text-surface-0 focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Iscriviti adesso
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
