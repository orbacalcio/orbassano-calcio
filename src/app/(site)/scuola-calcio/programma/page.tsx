import type { Metadata } from "next";
import { FasceEtaGrid } from "@/components/scuola-calcio/FasceEtaGrid";
import { SettimanaTimeline } from "@/components/scuola-calcio/SettimanaTimeline";
import { StaffCoachCard } from "@/components/scuola-calcio/StaffCoachCard";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbLd } from "@/lib/json-ld";
import {
  fetchScuolaCalcioProgramma,
  type ScuolaCalcioFascia,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/scuola-calcio/programma" },
  title: "Programma tecnico Scuola Calcio",
  description:
    "Focus tecnico delle annate 2015 e 2014 (categoria Esordienti, calcio a 9) e staff coach della Scuola Calcio dell'Orbassano. Allenatori qualificati FIGC.",
};

// Orari allenamenti: NESSUN fallback (decisione utente 2026-08-17).
// La programmazione settimanale non e' ancora definita, come la sede.
// Il campo `scProgTimeline` esiste su Studio ma e' vuoto: finche' resta
// cosi' la sezione "Settimana tipo" non viene renderizzata. Appena
// l'admin inserisce gli slot, ricompare da sola.

// Le due annate della categoria Esordienti. Quando il club aprira'
// altre fasce (Pulcini, Primi Calci, Piccoli Amici) si aggiungono qui
// e in FASCIA_DESCRIPTIONS — oppure si popolano direttamente da Studio,
// che ha la precedenza su questi fallback.
const FALLBACK_FASCE: ScuolaCalcioFascia[] = [
  {
    label: "Esordienti 2015",
    ageRange: "Calcio a 9 · primo anno",
    focus: null,
    image: null,
    imageLqip: null,
    order: 1,
  },
  {
    label: "Esordienti 2014",
    ageRange: "Calcio a 9 · secondo anno",
    focus: null,
    image: null,
    imageLqip: null,
    order: 2,
  },
];

// Descrizioni statiche per le fasce (usate se focus PT mancante).
const FASCIA_DESCRIPTIONS: Record<string, string> = {
  "Esordienti 2015":
    "Ingresso nel calcio a 9. Si consolidano i fondamentali — conduzione, passaggio, controllo orientato — e si scoprono i primi principi di gioco collettivo. Tutti ruotano su più ruoli.",
  "Esordienti 2014":
    "Secondo anno di calcio a 9. Tattica di base, gestione delle transizioni, ruoli più definiti. È l'anno che prepara il passaggio ai Giovanissimi del Settore Giovanile Scolastico.",
};

export default async function ScuolaCalcioProgrammaPage() {
  const data = await fetchScuolaCalcioProgramma();

  const timeline = data.timeline;
  const fasce = data.fasce.length > 0 ? data.fasce : FALLBACK_FASCE;
  const staff = data.staff;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Scuola Calcio", url: "/scuola-calcio" },
          {
            name: "Programma",
            url: "/scuola-calcio/programma",
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
              Scuola Calcio · Programma tecnico
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Come si allena chi cresce con noi
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Il percorso tecnico delle annate 2015 e 2014, categoria
              Esordienti. Tutti i tecnici sono abilitati FIGC.
            </p>
          </div>
        </Container>
      </header>

      {/* Timeline settimana — solo quando il CMS ha degli slot. Vedi
          nota sugli orari in cima al file. */}
      {timeline.length > 0 && (
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
      )}

      {/* Fasce età con focus tecnico */}
      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Categoria Esordienti
              </span>
              <h2 className="font-display text-light-ink-hi text-4xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-5xl">
                Focus tecnico per annata
              </h2>
              <p className="text-light-ink-mid max-w-2xl text-sm leading-relaxed md:text-base">
                Le due annate si allenano insieme ma hanno obiettivi distinti,
                allineati al metodo FIGC dell&apos;attività di base. Dai
                fondamentali del primo anno alla tattica di base del secondo.
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
                Lo staff dei tecnici qualificati FIGC della Scuola Calcio
                dell&apos;Orbassano è in fase di definizione. Annunci ufficiali
                a breve.
              </p>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
