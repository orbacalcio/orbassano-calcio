import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, GraduationCap, Trophy } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Settore Giovanile",
  description:
    "Settore Giovanile ASD Orbassano Calcio: Open Days, Tornei, calendari per Juniores Under 19, Allievi Under 17/16, Giovanissimi Under 15/14.",
};

const SECTIONS = [
  {
    href: "/settore-giovanile/open-days",
    icon: CalendarCheck,
    label: "Open Days",
    description:
      "Sessioni di prova aperte. Vieni a conoscerci, porta un amico, scarica il modulo iscrizione.",
  },
  {
    href: "/settore-giovanile/tornei",
    icon: Trophy,
    label: "Tornei",
    description:
      "Memorial, triangolari, manifestazioni. Tutte le date dei tornei a cui partecipano le nostre squadre.",
  },
] as const;

export default function SettoreGiovanilePage() {
  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <GraduationCap size={16} aria-hidden />
              Settore Giovanile
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Cresciamo insieme
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Dal Settore Giovanile Scolastico (U14–U17) alla Juniores
              Under 19. Allenamenti, partite, tornei, momenti di
              spogliatoio: il calcio dell&apos;Orba inizia da qui.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        <ul className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group border-border bg-surface-1 hover:border-brand-gold/40 focus-visible:outline-brand-gold flex flex-col gap-4 rounded-2xl border p-8 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <s.icon
                  size={36}
                  strokeWidth={1.5}
                  className="text-brand-gold"
                  aria-hidden
                />
                <h2 className="font-display text-ink-hi group-hover:text-brand-gold text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase transition-colors">
                  {s.label}
                </h2>
                <p className="text-ink-mid text-sm leading-relaxed">
                  {s.description}
                </p>
                <span className="text-brand-gold inline-flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
                  Vai al calendario
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
