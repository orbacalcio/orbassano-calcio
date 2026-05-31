import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, GraduationCap } from "lucide-react";
import {
  YouthEventGroup,
  type EventRow,
} from "@/components/settore-giovanile/YouthEventGroup";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { fetchOpenDays } from "@/sanity/fetchers";

/**
 * Pagina Summer Camp del Settore Giovanile Scolastico.
 *
 * Rinominata da "Open Days" a "Summer Camp" 2026-05-21 (richiesta
 * utente): da regolamento FIGC le selezioni / open day non si possono
 * tenere prima del 1° luglio, mentre l'attivita' di meta' giugno (2-3
 * settimane) e' un camp estivo. Il vecchio path /settore-giovanile/
 * open-days fa 301 verso questo (vedi next.config.ts).
 *
 * Internamente i dati arrivano ancora dai documenti Sanity di tipo
 * `openDay` (id schema invariato per non orfanare i documenti esistenti
 * / il webhook revalidate): cambia solo la denominazione utente-facing.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/settore-giovanile/summer-camp" },
  title: "Summer Camp Settore Giovanile Scolastico",
  description:
    "Summer Camp del Settore Giovanile Scolastico ASD Orbassano Calcio: due/tre settimane di calcio, sport e divertimento da metà giugno. Date, info e modulo di iscrizione per ogni categoria, dall'Under 14 alla Juniores.",
};

// Ordine fisso delle categorie nella pagina: dal piu' grande al piu'
// piccolo (Juniores → U14). Anche se Sanity ha solo alcune categorie
// popolate, l'array intero viene iterato cosi' le sezioni vuote
// mostrano comunque l'header (utile per dire "in arrivo").
const CATEGORY_ORDER = [
  "Juniores Under 19",
  "Allievi Under 17",
  "Allievi Under 16",
  "Giovanissimi Under 15",
  "Giovanissimi Under 14",
] as const;

export default async function SummerCampPage() {
  const events = await fetchOpenDays();

  // Raggruppa per categoria espandendo categorie × sessioni in righe:
  // un evento con categorie [U17, U16] e 2 sessioni produce 2 righe in
  // OGNI gruppo categoria. Le NOTE vengono raccolte UNA volta per
  // categoria (deduplicate) e passate al gruppo come prop top-level —
  // non duplicate per ogni data/orario.
  const byCategory = new Map<string, EventRow[]>();
  const notesByCategory = new Map<string, string[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const ev of events) {
    const cta = ev.downloadModuleUrl
      ? {
          label: "Scarica modulo",
          href: ev.downloadModuleUrl,
          icon: "download" as const,
        }
      : null;
    const note = ev.notes?.trim() ?? "";
    for (const cat of ev.categories) {
      const list = byCategory.get(cat);
      if (!list) continue; // categoria fuori dall'ordine atteso → ignora
      ev.sessions.forEach((session, i) => {
        list.push({
          id: `${ev._id}-${i}`,
          title: ev.title,
          date: session.date,
          endTime: session.endTime,
          venue: ev.venue,
          mapsUrl: ev.mapsUrl,
          // notes intenzionalmente omesse qui: vivono UNA volta in
          // alto al gruppo (vedi notesByCategory).
          cta,
        });
      });
      if (note) {
        const noteList = notesByCategory.get(cat) ?? [];
        if (!noteList.includes(note)) {
          noteList.push(note);
          notesByCategory.set(cat, noteList);
        }
      }
    }
  }
  // Ordina le righe di ogni categoria per data crescente (le sessioni
  // di eventi diversi si intrecciano cronologicamente).
  for (const rows of byCategory.values()) {
    rows.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="summer-camp" />
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
              Settore Giovanile Scolastico
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Summer Camp
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Due settimane di calcio, sport e divertimento con i nostri
              tecnici. Il Summer Camp è aperto ai ragazzi del Settore
              Giovanile Scolastico: un&apos;esperienza all&apos;insegna
              del gioco e dell&apos;amicizia, in attesa della nuova
              stagione. Qui sotto trovi le date e il modulo per
              iscriverti.
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
      {/* Date del Summer Camp per categoria. (Blocchi "modulo iscrizione"
          e "pagamento" rimossi su richiesta utente.) */}
      <Container className="py-12 lg:py-16" size="wide">
        {events.length === 0 ? (
          <div className="border-light-border bg-light-bg-1 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <CalendarCheck
              size={48}
              className="text-light-ink-low"
              aria-hidden
            />
            <h2 className="font-display text-light-ink-hi text-2xl font-bold tracking-[0.005em] uppercase">
              Date in arrivo
            </h2>
            <p className="text-light-ink-mid max-w-md text-sm leading-relaxed">
              Le date del Summer Camp saranno pubblicate appena confermate
              dalla Segreteria.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORY_ORDER.map((cat) => {
              const rows = byCategory.get(cat) ?? [];
              const notes = notesByCategory.get(cat) ?? [];
              return (
                <YouthEventGroup
                  key={cat}
                  category={cat}
                  rows={rows}
                  notes={notes}
                  emptyLabel="Nessuna data ancora pubblicata per questa categoria."
                />
              );
            })}
          </div>
        )}
      </Container>
      </section>
    </>
  );
}
