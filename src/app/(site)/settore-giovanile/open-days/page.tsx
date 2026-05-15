import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, GraduationCap } from "lucide-react";
import {
  YouthEventGroup,
  type EventRow,
} from "@/components/settore-giovanile/YouthEventGroup";
import { Container } from "@/components/ui/Container";
import { fetchOpenDays } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Open Days Settore Giovanile",
  description:
    "Calendario degli Open Days del Settore Giovanile ASD Orbassano Calcio per ogni categoria: Juniores Under 19, Allievi Under 17 e 16, Giovanissimi Under 15 e 14.",
};

// Ordine fisso delle categorie nella pagina: dal piu' grande al piu'
// piccolo (Juniores → U14). Anche se Sanity ha solo 3 categorie
// popolate, l'array intero viene iterato cosi' le sezioni vuote
// mostrano comunque l'header (utile per dire "in arrivo").
const CATEGORY_ORDER = [
  "Juniores Under 19",
  "Allievi Under 17",
  "Allievi Under 16",
  "Giovanissimi Under 15",
  "Giovanissimi Under 14",
] as const;

export default async function OpenDaysPage() {
  const events = await fetchOpenDays();

  // Raggruppa per categoria (lookup O(1) per ogni render group)
  const byCategory = new Map<string, EventRow[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const ev of events) {
    const row: EventRow = {
      id: ev._id,
      title: ev.title,
      date: ev.date,
      endTime: ev.endTime,
      venue: ev.venue,
      notes: ev.notes,
      cta: ev.downloadModuleUrl
        ? {
            label: "Scarica modulo",
            href: ev.downloadModuleUrl,
            icon: "download",
          }
        : null,
    };
    const list = byCategory.get(ev.category);
    if (list) list.push(row);
    else byCategory.set(ev.category, [row]);
  }

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <Link
            href="/squadre"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-wide transition-colors"
          >
            <ArrowLeft size={12} aria-hidden />
            Torna alle squadre
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <GraduationCap size={16} aria-hidden />
              Settore Giovanile
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Open Days
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Sono aperte le iscrizioni al Settore Giovanile dell&apos;Orbassano
              Calcio. Una vera esperienza all&apos;insegna del divertimento,
              dello sport e dell&apos;amicizia. Qui sotto trovi le date degli
              Open Day per ogni categoria: vieni a provare con noi.
            </p>
            <p className="text-ink-mid border-brand-gold border-l-2 pl-4 text-sm leading-relaxed">
              <strong className="text-ink-hi">Iscriviti ora</strong>:
              compila e firma il modulo scaricabile dal pulsante &laquo;Scarica
              modulo&raquo; nella tua categoria, poi invialo via mail a{" "}
              <a
                href="mailto:info@orbassanocalcio.com"
                className="text-brand-gold hover:underline"
              >
                info@orbassanocalcio.com
              </a>
              .
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16" size="wide">
        {events.length === 0 ? (
          <div className="border-border/40 bg-surface-1/40 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <CalendarCheck
              size={48}
              className="text-ink-low"
              aria-hidden
            />
            <h2 className="font-display text-ink-hi text-2xl font-bold tracking-[0.005em] uppercase">
              Calendario in arrivo
            </h2>
            <p className="text-ink-mid max-w-md text-sm leading-relaxed">
              Le date degli Open Days per la prossima stagione saranno
              pubblicate appena confermate dalla Segreteria.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORY_ORDER.map((cat) => {
              const rows = byCategory.get(cat) ?? [];
              return (
                <YouthEventGroup
                  key={cat}
                  category={cat}
                  rows={rows}
                  emptyLabel="Nessuna data ancora pubblicata per questa categoria."
                />
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
