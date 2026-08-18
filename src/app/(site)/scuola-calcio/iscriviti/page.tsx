import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { RegistrationPaymentBlock } from "@/components/settore-giovanile/RegistrationPaymentBlock";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbLd } from "@/lib/json-ld";
import { fetchScuolaCalcioIscriviti } from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/scuola-calcio/iscriviti" },
  title: "Iscriviti alla Scuola Calcio",
  description:
    "Iscrizione alla Scuola Calcio dell'Orbassano, annate 2015 e 2014 (categoria Esordienti): prova gratuita, pratica curata dalla segreteria e pagamento con bonifico. Stagione 2026/2027.",
};

// Fallback editoriali brand-voice.
const FALLBACK_PHONE = "+39 327 779 3326";
const FALLBACK_EMAIL = "sgs@orbassanocalcio.com";
const FALLBACK_IBAN = "IBAN da pubblicare";
// Nessun fallback per la nota di pagamento (decisione utente
// 2026-08-17): rateizzazioni e sconti sono condizioni commerciali che
// il club non ha ancora fissato. Se il campo CMS e' vuoto il paragrafo
// non viene renderizzato.

// Iscrizione in 3 step (pattern Toro Camp semplificato).
const ISCRIZIONE_STEPS: Array<{
  number: string;
  title: string;
  description: string;
}> = [
  {
    number: "01",
    title: "Prova gratuita",
    description:
      "Contatta la segreteria per concordare 1-2 sedute di prova gratuita. Vieni con scarpe da ginnastica e parastinchi: ci pensiamo noi al resto.",
  },
  {
    number: "02",
    title: "Iscrizione in segreteria",
    description:
      "Nessun modulo da scaricare o stampare: è la segreteria a raccogliere i dati del bambino, i documenti e le firme dei genitori, e a curare il tesseramento FIGC.",
  },
  {
    number: "03",
    title: "Bonifico e conferma",
    description:
      "Effettua il bonifico e invia la ricevuta via email. La segreteria conferma l'iscrizione entro 48 ore.",
  },
];

export default async function ScuolaCalcioIscrivitiPage() {
  const data = await fetchScuolaCalcioIscriviti();

  const phone = data.scIscrContactPhone?.trim() || FALLBACK_PHONE;
  const email = data.scIscrContactEmail?.trim() || FALLBACK_EMAIL;
  const iban = data.scIscrIban?.trim() || FALLBACK_IBAN;
  const paymentNote = data.scIscrPaymentNote?.trim() || null;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Scuola Calcio", url: "/scuola-calcio" },
          {
            name: "Iscriviti",
            url: "/scuola-calcio/iscriviti",
          },
        ])}
      />

      {/* Hero compatta */}
      <header className="bg-surface-0 relative isolate overflow-hidden">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="pitch" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Scuola Calcio · Iscrizione 2026/2027
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Iscriviti in 3 step
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Aperte le iscrizioni per la categoria Esordienti, annate 2015 e
              2014. Prova gratuita, poi la pratica la cura direttamente la
              segreteria: nessun modulo da scaricare, nessun form online.
            </p>
          </div>
        </Container>
      </header>

      {/* Intro PT (se popolata da CMS) */}
      {data.scIscrIntro && data.scIscrIntro.length > 0 && (
        <section className="bg-light-bg-0">
          <Container className="py-12 lg:py-16" size="wide">
            <PortableTextBody
              value={data.scIscrIntro}
              variant="light"
              className="max-w-3xl"
            />
          </Container>
        </section>
      )}

      {/* Tabella quote */}
      {(data.scIscrQuotaAnnuale != null ||
        data.scIscrQuotaIscrizione != null) && (
        <section className="bg-surface-0">
          <Container className="py-16 lg:py-20" size="wide">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                  Quote stagione 2026/2027
                </span>
                <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                  Cosa è compreso
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {data.scIscrQuotaIscrizione != null && (
                  <div className="border-border bg-surface-1 flex flex-col gap-2 rounded-2xl border p-6 md:p-8">
                    <span className="text-ink-mid font-mono text-xs tracking-[0.15em] uppercase">
                      Iscrizione una tantum
                    </span>
                    <span className="font-display text-brand-gold text-5xl leading-none font-black tracking-[0.005em] md:text-6xl">
                      €{data.scIscrQuotaIscrizione}
                    </span>
                    <span className="text-ink-low text-xs">
                      Comprende tessera FIGC + assicurazione
                    </span>
                  </div>
                )}
                {data.scIscrQuotaAnnuale != null && (
                  <div className="border-brand-gold/60 bg-surface-2 flex flex-col gap-2 rounded-2xl border-2 p-6 md:p-8">
                    <span className="text-ink-mid font-mono text-xs tracking-[0.15em] uppercase">
                      Quota annuale
                    </span>
                    <span className="font-display text-brand-gold text-5xl leading-none font-black tracking-[0.005em] md:text-6xl">
                      €{data.scIscrQuotaAnnuale}
                    </span>
                    <span className="text-ink-low text-xs">
                      Materiale tecnico, allenamenti, partite
                    </span>
                  </div>
                )}
              </div>
              {paymentNote && (
                <p className="text-ink-mid max-w-3xl text-sm leading-relaxed md:text-base">
                  {paymentNote}
                </p>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* 3 step iscrizione (pattern editoriale) */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Come iscriversi
              </span>
              <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Tre passi, e si comincia
              </h2>
            </div>
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {ISCRIZIONE_STEPS.map((step) => (
                <li
                  key={step.number}
                  className="bg-light-bg-1 border-light-border relative flex flex-col gap-4 rounded-2xl border p-6 md:p-8"
                >
                  <span
                    aria-hidden
                    className="font-display text-brand-gold/40 text-7xl leading-none font-black tracking-[0.005em] md:text-8xl"
                  >
                    {step.number}
                  </span>
                  <h3 className="font-display text-light-ink-hi text-xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-light-ink-mid text-sm leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Info bonifico (riuso RegistrationPaymentBlock senza la card
          modulo: per la Scuola Calcio 2026/2027 l'iscrizione la gestisce
          la segreteria, non c'e' un PDF da scaricare). */}
      <section className="bg-surface-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Pagamento
              </span>
              <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Come si paga
              </h2>
            </div>
            <RegistrationPaymentBlock
              showModule={false}
              moduleUrl={null}
              iban={iban}
              phone={phone}
              email={email}
            />
          </div>
        </Container>
      </section>

      {/* Cosa serve checklist editoriale */}
      <section className="bg-light-bg-0">
        <Container className="py-12 lg:py-16" size="wide">
          <div className="flex flex-col gap-6 max-w-3xl">
            <h3 className="font-display text-light-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl">
              Cosa serve per l&apos;iscrizione
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                "Documento d'identità di entrambi i genitori",
                "Tessera sanitaria del bambino",
                "Certificato medico di idoneità sportiva non agonistica (in corso di validità)",
                "Ricevuta del bonifico",
                "2 foto formato tessera del bambino (per tesseramento FIGC)",
              ].map((item) => (
                <li
                  key={item}
                  className="text-light-ink-mid flex items-start gap-3 text-sm leading-relaxed md:text-base"
                >
                  <CheckCircle2
                    size={20}
                    className="text-brand-red mt-0.5 shrink-0"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
