import type { Metadata } from "next";
import { FasceEtaGrid } from "@/components/academy/FasceEtaGrid";
import { SettimanaTimeline } from "@/components/academy/SettimanaTimeline";
import { StaffCoachCard } from "@/components/academy/StaffCoachCard";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbLd } from "@/lib/json-ld";
import {
  fetchScuolaCalcioProgramma,
  type ScuolaCalcioFascia,
  type ScuolaCalcioTimelineSlot,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/squadre/academy/programma" },
  title: "Programma tecnico Academy",
  description:
    "Timeline settimanale degli allenamenti, fasce d'età FIGC (Piccoli Amici, Primi Calci, Pulcini, Esordienti) e staff coach della Academy Orbassano. Allenatori qualificati, focus su gioco e crescita.",
};

// Fallback timeline brand-voice — settimana tipo, una volta che il
// CMS e' popolato i valori reali sovrascrivono.
const FALLBACK_TIMELINE: ScuolaCalcioTimelineSlot[] = [
  {
    day: "Martedì",
    startTime: "17:00",
    endTime: "18:00",
    activity: "Allenamento Piccoli Amici / Primi Calci",
    ageGroup: "5-9 anni",
  },
  {
    day: "Martedì",
    startTime: "18:00",
    endTime: "19:30",
    activity: "Allenamento Pulcini / Esordienti",
    ageGroup: "10-13 anni",
  },
  {
    day: "Giovedì",
    startTime: "17:00",
    endTime: "18:00",
    activity: "Allenamento Piccoli Amici / Primi Calci",
    ageGroup: "5-9 anni",
  },
  {
    day: "Giovedì",
    startTime: "18:00",
    endTime: "19:30",
    activity: "Allenamento Pulcini / Esordienti",
    ageGroup: "10-13 anni",
  },
  {
    day: "Sabato",
    startTime: "10:00",
    endTime: "11:30",
    activity: "Partite del weekend",
    ageGroup: "Tutte le fasce",
  },
];

const FALLBACK_FASCE: ScuolaCalcioFascia[] = [
  {
    label: "Piccoli Amici",
    ageRange: "5-7 anni",
    focus: null,
    image: null,
    imageLqip: null,
    order: 1,
  },
  {
    label: "Primi Calci",
    ageRange: "8-9 anni",
    focus: null,
    image: null,
    imageLqip: null,
    order: 2,
  },
  {
    label: "Pulcini",
    ageRange: "10-11 anni",
    focus: null,
    image: null,
    imageLqip: null,
    order: 3,
  },
  {
    label: "Esordienti",
    ageRange: "12-13 anni",
    focus: null,
    image: null,
    imageLqip: null,
    order: 4,
  },
];

// Descrizioni statiche per le fasce (usate se focus PT mancante).
const FASCIA_DESCRIPTIONS: Record<string, string> = {
  "Piccoli Amici":
    "Primo approccio al calcio attraverso il gioco. Coordinazione motoria, equilibrio, ambidestrismo. Niente classifiche: tutti giocano, tutti crescono.",
  "Primi Calci":
    "Iniziano i fondamentali: conduzione, passaggio, controllo. Calcio a 5 nel torneo. La crescita personale prima dei risultati.",
  Pulcini:
    "Calcio a 7. Si affinano i fondamentali, si introducono i principi del gioco di squadra. Differenziazione ruoli campo/portiere.",
  Esordienti:
    "Calcio a 9. Tattica di base, gestione del gioco, ruoli definiti. Transizione verso il calcio agonistico del Settore Giovanile.",
};

export default async function ScuolaCalcioProgrammaPage() {
  const data = await fetchScuolaCalcioProgramma();

  const timeline = data.timeline.length > 0 ? data.timeline : FALLBACK_TIMELINE;
  const fasce = data.fasce.length > 0 ? data.fasce : FALLBACK_FASCE;
  const staff = data.staff;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Squadre", url: "/squadre" },
          { name: "Academy", url: "/squadre/academy" },
          {
            name: "Programma",
            url: "/squadre/academy/programma",
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
              Academy · Programma tecnico
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Come si allena chi cresce con noi
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Una settimana strutturata per fascia d&apos;età, con sedute
              tecniche, gioco e partite. Tutti i tecnici sono abilitati FIGC.
            </p>
          </div>
        </Container>
      </header>

      {/* Timeline settimana */}
      <section className="bg-surface-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Settimana tipo
              </span>
              <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Orari allenamenti
              </h2>
              <p className="text-ink-mid max-w-2xl text-sm leading-relaxed md:text-base">
                Gli orari possono variare in base ai gruppi e alla
                disponibilità del campo. La segreteria conferma la
                programmazione definitiva a inizio stagione.
              </p>
            </div>
            <SettimanaTimeline slots={timeline} />
          </div>
        </Container>
      </section>

      {/* Fasce età con focus tecnico */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Fasce d&apos;età FIGC
              </span>
              <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Focus tecnico per ogni età
              </h2>
              <p className="text-light-ink-mid max-w-2xl text-sm leading-relaxed md:text-base">
                Ogni fascia ha obiettivi specifici, allineati al metodo del
                Settore Giovanile Scolastico FIGC. Si passa dal gioco puro
                ai fondamentali, fino alla tattica di base.
              </p>
            </div>
            <FasceEtaGrid
              fasce={fasce.map((f) => ({
                ...f,
                // Se il CMS non ha popolato il focus PT, usa la
                // descrizione statica nostra come testo semplice.
                focus:
                  f.focus && f.focus.length > 0
                    ? f.focus
                    : FASCIA_DESCRIPTIONS[f.label]
                      ? [
                          {
                            _type: "block",
                            children: [
                              {
                                _type: "span",
                                text: FASCIA_DESCRIPTIONS[f.label] ?? "",
                              },
                            ],
                          },
                        ]
                      : null,
              }))}
            />
          </div>
        </Container>
      </section>

      {/* Staff coach */}
      {staff.length > 0 && (
        <section className="bg-surface-0">
          <Container className="py-16 lg:py-20" size="wide">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-3">
                <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                  Staff coach
                </span>
                <h2 className="font-display text-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                  Chi accompagna i ragazzi
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {staff.map((coach) => (
                  <StaffCoachCard key={coach.name} coach={coach} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Empty state staff (quando CMS non popolato) */}
      {staff.length === 0 && (
        <section className="bg-surface-0">
          <Container className="py-16 lg:py-20" size="wide">
            <div className="flex flex-col gap-6 max-w-2xl">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Staff coach
              </span>
              <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
                Lo staff dei tecnici qualificati FIGC della Academy
                Orbassano è in fase di definizione. Annunci ufficiali a
                breve.
              </p>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
