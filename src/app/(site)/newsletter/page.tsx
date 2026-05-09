import type { Metadata } from "next";
import { Calendar, Mail, Trophy } from "lucide-react";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Iscriviti alla newsletter ufficiale di ASD Orbassano Calcio: risultati, prossime partite e dietro le quinte direttamente nella tua casella, una volta a settimana.",
};

const PROMISES = [
  {
    icon: Trophy,
    title: "Risultati e classifica",
    body: "Il riepilogo del weekend rossoblù: prima squadra, settore giovanile, scuola calcio. Sintesi narrativa, niente spam di numeri.",
  },
  {
    icon: Calendar,
    title: "Prossime partite",
    body: "Calendario della settimana con orari, campi e info trasferte. Mai più a chiedere «a che ora si gioca?» il sabato sera.",
  },
  {
    icon: Mail,
    title: "Una sola email a settimana",
    body: "Niente push compulsive, niente broadcast a raffica. Una newsletter curata ogni lunedì mattina. Cancellabile in un click.",
  },
];

export default function NewsletterPage() {
  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <Mail size={16} aria-hidden />
              Newsletter
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Il calcio di Orbassano nella tua inbox
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Una mail curata ogni luned&igrave; mattina con risultati,
              prossime partite e dietro le quinte. Iscriviti col tuo
              indirizzo email e ti chiediamo conferma con un secondo click,
              senza intermediari.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-16 lg:py-24" size="wide">
        <RevealOnScroll>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
            <ul className="flex flex-col gap-5">
              {PROMISES.map((p) => (
                <li
                  key={p.title}
                  className="border-border bg-surface-1 flex flex-col gap-3 rounded-2xl border p-6"
                >
                  <p.icon size={24} className="text-brand-gold" aria-hidden />
                  <h2 className="font-display text-ink-hi text-lg leading-tight font-bold tracking-[0.01em] uppercase">
                    {p.title}
                  </h2>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    {p.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-border bg-surface-1 rounded-3xl border p-8 sm:p-10">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                    Iscriviti
                  </span>
                  <h2 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase sm:text-3xl">
                    Email + un click di conferma
                  </h2>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    Iscrizione a doppio opt-in: dopo aver inviato il form,
                    ti arriva un&apos;email con il link per confermare.
                    Senza conferma non finisci nella mailing list, garantito.
                  </p>
                </div>
                <NewsletterForm />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Container>
    </>
  );
}
