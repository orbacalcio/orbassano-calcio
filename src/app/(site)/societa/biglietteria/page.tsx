import type { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Clock,
  Heart,
  MapPin,
  Mail,
  Newspaper,
  Phone,
  Ticket,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  alternates: { canonical: "/societa/biglietteria" },
  title: "Biglietteria",
  description:
    "Tariffe biglietti, biglietteria fisica, agevolazioni disabilità e accrediti stampa per le partite casalinghe di ASD Orbassano Calcio al Centro Sportivo Aldo Porta.",
};

export default function BiglietteriaPage() {
  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Biglietteria
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Vieni a tifare con noi
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Le partite casalinghe della Prima Squadra si giocano al
              Centro Sportivo &laquo;Aldo Porta&raquo; di Orbassano. L&apos;accesso &egrave;
              libero per tutti i tifosi e le famiglie che vogliono
              sostenere i rossoblù in campo.
            </p>
          </div>
        </Container>
      </header>

      {/* Blocco info biglietteria su banda chiara light-bg-0. Le 4
          informazioni (tariffe, biglietteria fisica, agevolazioni,
          accrediti) sono rese come card a griglia 2×2 (pattern visivo
          della cookie policy): icona + eyebrow + titolo + contenuto,
          bordo/accento colorato per scansione rapida. Email mailto: in
          rosso bold. */}
      <section aria-labelledby="info-biglietti-title" className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-8">
              <p
                id="info-biglietti-title"
                className="text-light-ink-mid max-w-3xl text-base leading-relaxed lg:text-lg"
              >
                Orbassano Calcio comunica i prezzi e le modalità di
                acquisto dei biglietti per i match casalinghi:
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  accent="gold"
                  icon={<Ticket size={30} aria-hidden />}
                  subtitle="Giorno gara"
                  title="Tariffe biglietti"
                >
                  <ul className="flex flex-col gap-3">
                    <li className="border-light-border flex items-center justify-between gap-4 border-b pb-3">
                      <span className="text-light-ink-hi font-medium">
                        Prima Squadra
                      </span>
                      <span className="font-display text-brand-gold shrink-0 text-2xl leading-none font-extrabold tracking-[0.005em]">
                        10€
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-4">
                      <span className="text-light-ink-hi font-medium">
                        Juniores e Settore Giovanile Scolastico
                      </span>
                      <span className="font-display text-brand-gold shrink-0 text-2xl leading-none font-extrabold tracking-[0.005em]">
                        7€
                      </span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard
                  accent="blue"
                  icon={<Clock size={30} aria-hidden />}
                  subtitle="Apertura sportelli"
                  title="Biglietteria fisica"
                >
                  <p>
                    La biglietteria dello stadio (ingresso principale in
                    Via Ignazio Silone 4) è sempre aperta il giorno della
                    partita, 1 ora prima del fischio di inizio. Ti
                    invitiamo a recarti agli sportelli con adeguato
                    anticipo per facilitare le operazioni di ingresso.
                  </p>
                </InfoCard>

                <InfoCard
                  accent="red"
                  icon={<Accessibility size={30} aria-hidden />}
                  subtitle="Ingresso gratuito"
                  title="Agevolazioni"
                >
                  <p>
                    Tifosi con disabilità: ingresso gratuito, anche per
                    l&apos;accompagnatore. Per ottenere il titolo di
                    accesso, invia una mail a{" "}
                    <a
                      href="mailto:biglietteria@orbassanocalcio.com"
                      className="text-brand-red font-semibold hover:underline hover:decoration-brand-red hover:decoration-2 hover:underline-offset-[3px]"
                    >
                      biglietteria@orbassanocalcio.com
                    </a>{" "}
                    entro 48 ore dall&apos;evento, allegando i documenti
                    d&apos;identità dei richiedenti (persona con disabilità
                    e accompagnatore) e il certificato di disabilità.
                  </p>
                </InfoCard>

                <InfoCard
                  accent="gold"
                  icon={<Newspaper size={30} aria-hidden />}
                  subtitle="Foto e video"
                  title="Accrediti stampa"
                >
                  <p>
                    Giornalisti e operatori dell&apos;informazione senza
                    pass stagionale possono richiedere l&apos;accredito
                    scrivendo a{" "}
                    <a
                      href="mailto:segreteria@orbassanocalcio.com"
                      className="text-brand-red font-semibold hover:underline hover:decoration-brand-red hover:decoration-2 hover:underline-offset-[3px]"
                    >
                      segreteria@orbassanocalcio.com
                    </a>
                    , indicando nominativo e media di appartenenza
                    (testata, agenzia o sito web) e — per i giornalisti —
                    allegando la tessera dell&apos;Ordine in corso di
                    validità. Richieste entro le ore 12.00 del giorno
                    precedente alla partita.
                  </p>
                </InfoCard>
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <section
        aria-labelledby="venue-title"
        className="bg-surface-1 border-border/50 border-y"
      >
        <Container className="grid items-start gap-12 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-20" size="wide">
          <div className="flex flex-col gap-3">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Dove si gioca
            </span>
            <h2
              id="venue-title"
              className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl"
            >
              Centro Sportivo Aldo Porta
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <ul className="text-ink-mid grid gap-5 sm:grid-cols-2">
              <li className="flex flex-col gap-2">
                <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                  Indirizzo
                </span>
                <span className="text-ink-hi flex items-start gap-2 text-base leading-relaxed">
                  <MapPin
                    size={14}
                    className="mt-1.5 shrink-0"
                    aria-hidden
                  />
                  <span>
                    Via Ignazio Silone, 4
                    <br />
                    10043 Orbassano (TO)
                  </span>
                </span>
              </li>
              <li className="flex flex-col gap-2">
                <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                  Caratteristiche
                </span>
                <span className="text-ink-hi text-base leading-relaxed">
                  Campo a 11 omologato Serie D
                  <br />
                  Tribuna, bar, area parcheggio, uffici
                </span>
              </li>
              <li className="flex flex-col gap-2">
                <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                  Email segreteria
                </span>
                <a
                  href="mailto:segreteria@orbassanocalcio.com"
                  className="text-ink-hi hover:text-brand-gold flex items-center gap-2 text-base transition-colors"
                >
                  <Mail size={14} aria-hidden />
                  segreteria@orbassanocalcio.com
                </a>
              </li>
              <li className="flex flex-col gap-2">
                <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                  Telefono
                </span>
                <a
                  href="tel:+393277793326"
                  className="text-ink-hi hover:text-brand-gold flex items-center gap-2 text-base transition-colors"
                >
                  <Phone size={14} aria-hidden />
                  +39 327 779 3326
                </a>
              </li>
            </ul>
            <a
              href="https://goo.gl/maps/aangwwU2QR5ninCDA"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <MapPin size={14} aria-hidden />
              Apri su Google Maps
            </a>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="groups-title"
        className="bg-surface-2 relative overflow-hidden"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-brand-red/25 absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
          <div className="bg-brand-blue/40 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        </div>

        <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-24" size="wide">
          <div className="flex flex-col gap-5">
            <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <Heart size={16} aria-hidden />
              Gruppi e abbonamenti
            </span>
            <h2
              id="groups-title"
              className="font-display text-ink-hi text-4xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-5xl"
            >
              Vieni con la tua scuola, la tua azienda, la tua squadra
            </h2>
            <p className="text-ink-mid max-w-xl text-base leading-relaxed">
              Organizziamo accoglienza dedicata per gruppi di tifosi,
              scuole calcio ospiti, aziende sponsor e associazioni locali.
              Per richieste di gruppi o abbonamenti stagionali ad hoc,
              scrivi alla segreteria: troviamo insieme la formula giusta.
            </p>
          </div>

          {/* Box "Contatto dedicato": rimpiazza il vecchio box 5×1000.
              Il box destro della sezione "Gruppi e abbonamenti" ora
              focalizza sul canale segreteria per accordi gruppi/scuole/
              aziende. Layout: eyebrow + paragrafo + email mailto
              prominente in font-mono + lista 4 destinatari tipici +
              CTA Contattaci pieno. */}
          <div className="border-brand-gold/30 bg-surface-1/70 flex flex-col gap-7 rounded-3xl border p-8 backdrop-blur-sm sm:p-10">
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Contatto dedicato
              </span>
              <p className="text-ink-mid text-base leading-relaxed">
                Per ingressi di gruppo, accoglienza di scuole calcio
                ospiti e abbonamenti su misura, scrivi alla segreteria
                del club:
              </p>
              <a
                href="mailto:segreteria@orbassanocalcio.com"
                className="text-ink-hi hover:text-brand-gold font-mono text-xl leading-tight font-medium tracking-[0.02em] break-all transition-colors sm:text-2xl"
              >
                segreteria@orbassanocalcio.com
              </a>
            </div>

            <ul className="text-ink-mid grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Scuole calcio ospiti",
                "Aziende e sponsor",
                "Associazioni locali",
                "Gruppi tifosi e famiglie",
              ].map((label) => (
                <li key={label} className="flex items-start gap-2 text-sm">
                  <span
                    aria-hidden
                    className="bg-brand-gold mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contatti"
              className="bg-brand-red btn-wow-sweep text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Contattaci
              <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * Card informativa biglietteria su banda chiara (pattern cookie policy):
 * bordo + sfondo tenue colorati per accento, icona + eyebrow mono +
 * titolo display, contenuto libero (lista prezzi o paragrafo). Tre
 * accenti brand: gold / blue / red.
 */
type CardAccent = "gold" | "blue" | "red";

const CARD_ACCENTS: Record<
  CardAccent,
  { border: string; bg: string; text: string }
> = {
  gold: {
    border: "border-brand-gold/40",
    bg: "bg-brand-gold/[0.05]",
    text: "text-brand-gold",
  },
  blue: {
    border: "border-brand-blue/40",
    bg: "bg-brand-blue/[0.05]",
    text: "text-brand-blue",
  },
  red: {
    border: "border-brand-red/40",
    bg: "bg-brand-red/[0.05]",
    text: "text-brand-red",
  },
};

function InfoCard({
  accent,
  icon,
  subtitle,
  title,
  children,
}: {
  accent: CardAccent;
  icon: React.ReactNode;
  subtitle: string;
  title: string;
  children: React.ReactNode;
}) {
  const a = CARD_ACCENTS[accent];
  return (
    <div
      className={`${a.border} ${a.bg} flex h-full flex-col gap-5 rounded-2xl border p-6 lg:p-8`}
    >
      <div className={`${a.text} flex items-center gap-3`}>
        {icon}
        <div className="flex flex-col">
          <span className="text-light-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
            {subtitle}
          </span>
          <span className="font-display text-light-ink-hi text-xl leading-tight font-bold tracking-[0.005em] uppercase">
            {title}
          </span>
        </div>
      </div>
      <div className="text-light-ink-mid text-sm leading-relaxed lg:text-base">
        {children}
      </div>
    </div>
  );
}
