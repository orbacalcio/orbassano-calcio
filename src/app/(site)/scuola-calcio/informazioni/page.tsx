import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { DiscountsBlock } from "@/components/scuola-calcio/DiscountsBlock";
import { FaqAccordion } from "@/components/scuola-calcio/FaqAccordion";
import { InfoVenueBlock } from "@/components/scuola-calcio/InfoVenueBlock";
import { PaymentTimelineBlock } from "@/components/scuola-calcio/PaymentTimelineBlock";
import {
  StatCardsRow,
  type StatCardItem,
} from "@/components/scuola-calcio/StatCardsRow";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbLd } from "@/lib/json-ld";
import {
  fetchScuolaCalcioInformazioni,
  type FaqItem,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/scuola-calcio/informazioni" },
  title: "Informazioni Scuola Calcio",
  description:
    "Tutte le info pratiche della Scuola Calcio dell'Orbassano: annate 2014 e 2015 (categoria Esordienti, calcio a 9), cosa è incluso nella quota, politica di cancellazione e contatti della segreteria. Stagione 2026/2027.",
};

// ─── Fallback editoriali brand-voice ─────────────────────────────────
const FALLBACK_HERO_PITCH =
  "Tutto quello che ti serve sapere prima di iscrivere tuo figlio alla stagione rossoblù.";
// Stagione 2026/2027: unica categoria attiva Esordienti. Il campo CMS
// `scInfoAgeRange` sovrascrive questo fallback quando popolato.
const FALLBACK_AGE_RANGE = "Annate 2014 e 2015 · categoria Esordienti";
const FALLBACK_MAX_GROUP = 15;
// Sede e prezzi NON hanno fallback (decisione utente 2026-08-17): il
// club non ha ancora deciso impianto e quote. I campi esistono su
// Studio ma sono vuoti, e le rispettive sezioni non vengono
// renderizzate finche' non li popola. Mai inventare un indirizzo o un
// importo: e' informazione che i genitori userebbero per decidere.
const FALLBACK_PHONE = "+39 327 779 3326";
const FALLBACK_EMAIL = "sgs@orbassanocalcio.com";
const FALLBACK_CANCELLATION =
  "In caso di ritiro: rimborso del 50% della quota residua se comunicato entro 30 giorni prima dell'inizio della stagione. Dopo l'inizio non sono previsti rimborsi, salvo gravi motivi medici certificati (in quel caso rimborso del 100% sulle sessioni non frequentate). Per richieste contatta la segreteria.";

const FALLBACK_INCLUDED: string[] = [
  "Tessera FIGC + assicurazione integrata",
  "Materiale tecnico (palloni, casacche, conetti)",
  "Visite mediche sportive non agonistiche organizzate dal club",
  "Accesso a tornei e amichevoli organizzati dal club",
  "Attestato di partecipazione + valutazione tecnica fine stagione",
];

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Cosa devo portare agli allenamenti?",
    answer:
      "Borraccia personale, scarpe da calcio adatte al fondo del campo e parastinchi. Il kit ufficiale rossoblù, che è a parte rispetto alla quota, viene consegnato dopo l'ordine in segreteria.",
  },
  {
    question: "Cosa succede in caso di pioggia?",
    answer:
      "Gli allenamenti proseguono normalmente. Solo in caso di temporale o allerta meteo il club comunica l'annullamento via gruppo genitori.",
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

  const heroPitch = data.scInfoHeroPitch?.trim() || FALLBACK_HERO_PITCH;
  const ageRange = data.scInfoAgeRange?.trim() || FALLBACK_AGE_RANGE;
  const maxGroup = data.scInfoMaxGroup ?? FALLBACK_MAX_GROUP;
  // Sede: renderizzata solo quando l'admin popola il nome impianto su
  // Studio. Finche' e' vuoto la card non compare (niente indirizzo
  // inventato). Vedi commento sui fallback in cima al file.
  const venueName = data.scInfoVenueName?.trim() || null;
  const venueAddress = data.scInfoVenueAddress?.trim() || null;
  const mapsUrl = data.scInfoMapsUrl?.trim() || null;
  const phone = data.scInfoContactPhone?.trim() || FALLBACK_PHONE;
  const email = data.scInfoContactEmail?.trim() || FALLBACK_EMAIL;
  const cancellation =
    data.scInfoCancellation?.trim() || FALLBACK_CANCELLATION;
  const included =
    data.included.length > 0 ? data.included : FALLBACK_INCLUDED;
  // Quote, sconti e scadenze: nessun fallback. Se il CMS e' vuoto le
  // tre sezioni spariscono invece di mostrare importi placeholder.
  const priceTable = data.priceTable;
  const discounts = data.discounts;
  const payments = data.payments;
  const faq = data.faq.length > 0 ? data.faq : FALLBACK_FAQ;

  // 3 stat: solo dati certi. La frequenza degli allenamenti e' fuori
  // finche' la programmazione settimanale non e' definita (stessa
  // ragione per cui la sezione "Settimana tipo" del programma e la
  // card Sede non vengono renderizzate).
  const stats: StatCardItem[] = [
    { value: "2015-2014", label: "Annate ammesse" },
    { value: String(maxGroup), label: "Max per gruppo" },
    { value: "9", label: "Giocatori in campo" },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Scuola Calcio", url: "/scuola-calcio" },
          {
            name: "Informazioni",
            url: "/scuola-calcio/informazioni",
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
              Scuola Calcio · Informazioni
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Tutto quello che ti serve
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              {heroPitch}
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-surface-1 border-y border-border/40">
        <Container className="py-10 lg:py-14" size="wide">
          <StatCardsRow items={stats} />
        </Container>
      </section>

      <section className="bg-surface-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                {venueName ? "Sede e cosa è incluso" : "Cosa è incluso"}
              </span>
              <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                {venueName ? "Sede unica, tutto compreso" : "Tutto compreso"}
              </h2>
              <p className="text-ink-mid max-w-2xl text-sm leading-relaxed md:text-base">
                {ageRange} · gruppi piccoli per garantire attenzione
                individuale · tessera e assicurazione FIGC comprese nel
                tesseramento. Il kit ufficiale è a parte.
              </p>
            </div>
            {/* Due colonne solo quando la sede e' pubblicata: altrimenti
                la card "Nella quota" resta sola e a piena larghezza. */}
            <div
              className={`grid grid-cols-1 gap-6 ${venueName ? "md:grid-cols-2" : ""}`}
            >
              {venueName && (
                <InfoVenueBlock
                  name={venueName}
                  address={venueAddress}
                  mapsUrl={mapsUrl}
                />
              )}
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
                    <h3
                      id="included-title"
                      className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
                    >
                      Nella quota
                    </h3>
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
          </div>
        </Container>
      </section>

      {priceTable.length > 0 && (
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
      )}

      {discounts.length > 0 && (
        <section className="bg-surface-0">
          <Container className="py-16 lg:py-20" size="wide">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-3">
                <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                  Sconti famiglie
                </span>
                <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                  Si può risparmiare
                </h2>
                <p className="text-ink-mid max-w-2xl text-sm leading-relaxed md:text-base">
                  Sconti applicabili al momento dell&apos;iscrizione.
                  Cumulabili fino a un massimo del -30%. Per dettagli contatta
                  la segreteria.
                </p>
              </div>
              <DiscountsBlock discounts={discounts} />
            </div>
          </Container>
        </section>
      )}

      {payments.length > 0 && (
        <section className="bg-light-bg-0">
          <Container className="py-16 lg:py-20" size="wide">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-3">
                <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                  Scadenze pagamento
                </span>
                <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                  Come e quando si paga
                </h2>
              </div>
              <div className="max-w-3xl">
                <PaymentTimelineBlock payments={payments} />
              </div>
            </div>
          </Container>
        </section>
      )}

      <section className="bg-surface-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="max-w-3xl flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Politica di cancellazione
              </span>
              <h2 className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-4xl">
                Se cambi idea
              </h2>
            </div>
            <article className="border-border bg-surface-1 flex items-start gap-4 rounded-2xl border p-6 md:p-8">
              <ShieldAlert
                size={28}
                className="text-brand-gold mt-1 shrink-0"
                aria-hidden
              />
              <p className="text-ink-mid text-sm leading-relaxed md:text-base">
                {cancellation}
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                FAQ
              </span>
              <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Info pratiche frequenti
              </h2>
            </div>
            <div className="bg-surface-0 rounded-2xl p-4 md:p-8 lg:p-10">
              <FaqAccordion items={faq} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface-0">
        <Container className="py-16 lg:py-24" size="wide">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            <div className="flex flex-col gap-4">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Contatti diretti
              </span>
              <h2 className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-4xl lg:text-5xl">
                Parliamone
              </h2>
              <p className="text-ink-mid text-sm leading-relaxed md:text-base">
                Hai una domanda specifica? Scrivici o chiamaci, ti rispondiamo
                entro 48 ore.
              </p>
              <ul className="flex flex-col gap-3 mt-2">
                <li className="text-ink-mid flex items-center gap-2 text-sm">
                  <Phone
                    size={16}
                    className="text-brand-gold shrink-0"
                    aria-hidden
                  />
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="hover:text-ink-hi transition-colors"
                  >
                    {phone}
                  </a>
                </li>
                <li className="text-ink-mid flex items-center gap-2 text-sm">
                  <Mail
                    size={16}
                    className="text-brand-gold shrink-0"
                    aria-hidden
                  />
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-ink-hi transition-colors"
                  >
                    {email}
                  </a>
                </li>
              </ul>
            </div>
            <div className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-10">
              <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
                Pronto?
              </span>
              <h3 className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-4xl">
                Iscrivi tuo figlio
              </h3>
              <p className="text-ink-mid text-sm leading-relaxed">
                Prova gratuita, modulo PDF, bonifico. La segreteria ti
                accompagna in ogni passaggio.
              </p>
              <Link
                href="/scuola-calcio/iscriviti"
                className="bg-brand-blue btn-wow-sweep btn-sweep-gold text-brand-white font-display hover:text-surface-0 focus-visible:text-surface-0 focus-visible:outline-brand-gold mt-2 inline-flex w-fit items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Vai all&apos;iscrizione
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
