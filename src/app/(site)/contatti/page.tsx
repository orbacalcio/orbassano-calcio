import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Contatti di ASD Orbassano Calcio: email, PEC, telefono, sede operativa, orari di segreteria. Form per richieste generiche.",
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    body: "info@orbassanocalcio.com",
    href: "mailto:info@orbassanocalcio.com",
    helper: "Risposta entro 48 ore lavorative.",
  },
  {
    icon: ShieldCheck,
    title: "PEC",
    body: "orbassanocalcio@legalmail.it",
    // Niente href: la PEC NON deve essere cliccabile (apre un client
    // mail standard che non puo' firmare/cifrare con la chiave PEC,
    // generando confusione). L'utente la copia manualmente.
    href: undefined as string | undefined,
    helper: "Per comunicazioni ufficiali e legali.",
  },
  {
    icon: Phone,
    title: "Telefono",
    body: "+39 327 779 3326",
    href: "tel:+393277793326",
    helper: "Negli orari di segreteria.",
  },
  {
    icon: MapPin,
    title: "Sede operativa",
    body: "Centro Sportivo «Aldo Porta»\nVia Ignazio Silone, 4\n10043 Orbassano (TO)",
    href: "https://goo.gl/maps/aangwwU2QR5ninCDA",
    helper: "Apri su Google Maps.",
  },
];

export default function ContattiPage() {
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
              Contatti
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Parlare con l&apos;Orba
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Per iscrizioni al Settore Giovanile, richieste di gruppi al
              campo, sponsorizzazioni o semplici curiosit&agrave;: scrivi
              alla segreteria, chiama nelle ore di apertura, oppure usa il
              form qui sotto. Ti rispondiamo entro 48 ore lavorative.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-16 lg:py-24" size="wide">
        <RevealOnScroll>
          <div className="grid gap-10 lg:grid-cols-2">
            <ul className="flex flex-col gap-4">
              {CHANNELS.map((c) => (
                <li
                  key={c.title}
                  className="border-border bg-surface-1 hover:border-brand-gold/30 group flex flex-col gap-2 rounded-2xl border p-6 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <c.icon
                      size={20}
                      className="text-brand-gold"
                      aria-hidden
                    />
                    <span className="text-ink-low font-mono text-[11px] tracking-[0.15em] uppercase">
                      {c.title}
                    </span>
                  </div>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={
                        c.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        c.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-ink-hi group-hover:text-brand-gold whitespace-pre-line text-base leading-relaxed transition-colors"
                    >
                      {c.body}
                    </a>
                  ) : (
                    <span className="text-ink-hi whitespace-pre-line text-base leading-relaxed">
                      {c.body}
                    </span>
                  )}
                  <span className="text-ink-low text-xs">{c.helper}</span>
                </li>
              ))}
              <li className="border-border bg-surface-1 flex flex-col gap-2 rounded-2xl border p-6">
                <div className="flex items-center gap-3">
                  <Clock
                    size={20}
                    className="text-brand-gold"
                    aria-hidden
                  />
                  <span className="text-ink-low font-mono text-[11px] tracking-[0.15em] uppercase">
                    Orari segreteria
                  </span>
                </div>
                <span className="text-ink-hi text-base leading-relaxed">
                  Marted&igrave; e gioved&igrave;, 17:30 — 19:30
                </span>
                <span className="text-ink-low text-xs">
                  Fuori orario rispondiamo via email il giorno seguente.
                </span>
              </li>
            </ul>

            <div className="border-border bg-surface-1 rounded-3xl border p-8 sm:p-10">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                    Scrivici
                  </span>
                  <h2 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase sm:text-3xl">
                    Form richieste generiche
                  </h2>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    Per sponsorizzazioni usa la pagina dedicata{" "}
                    <a
                      href="/sponsor/opportunita"
                      className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                    >
                      /sponsor/opportunit&agrave;
                    </a>
                    , per la newsletter c&apos;&egrave; il form{" "}
                    <a
                      href="/newsletter"
                      className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                    >
                      /newsletter
                    </a>
                    .
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Container>
    </>
  );
}
