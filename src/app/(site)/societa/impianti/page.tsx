import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FacilityCard } from "@/components/societa/FacilityCard";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  fetchActiveFacilitySlugs,
  fetchFacilities,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Impianti sportivi",
  description:
    "Gli impianti sportivi di ASD Orbassano Calcio: dove si allenano e giocano la Prima Squadra e il Settore Giovanile.",
};

export default async function ImpiantiPage() {
  const [facilities, activeFacilitySlugs] = await Promise.all([
    fetchFacilities(),
    fetchActiveFacilitySlugs(),
  ]);
  // "Il Mazzola e i campioni" è la sezione editorial sotto le card:
  // ha senso solo se l'impianto Mazzola è effettivamente attivo,
  // altrimenti diventa un riferimento orfano.
  const showMazzolaEditorial = activeFacilitySlugs.includes(
    "sporting-orbassano-stadio-mazzola",
  );

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
              Impianti sportivi
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Dove si gioca, dove si cresce
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Il Centro Sportivo &laquo;Aldo Porta&raquo; &egrave; la sede
              ufficiale del club: ospita la Prima Squadra e il Settore
              Giovanile, con campi a 11 omologati e tutti gli spazi per
              allenamenti e partite ufficiali.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-16 lg:py-24" size="wide">
        <RevealOnScroll>
          {facilities.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {facilities.map((f, i) => (
                <FacilityCard key={f._id} facility={f} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-ink-mid border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center text-base">
              Gli impianti non sono ancora popolati nel CMS.
            </p>
          )}
        </RevealOnScroll>
      </Container>

      {showMazzolaEditorial && (
        <section
          aria-labelledby="mazzola-cta"
          className="bg-surface-2 border-border/40 relative overflow-hidden border-y"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="bg-brand-gold/15 absolute -top-40 -right-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
            <div className="bg-brand-blue/30 absolute -left-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
          </div>

          <Container className="relative grid items-center gap-10 py-20 lg:grid-cols-[1.4fr_1fr] lg:py-24" size="wide">
            <div className="flex flex-col gap-5">
              <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                <Sparkles size={16} aria-hidden />
                Il Mazzola e i campioni
              </span>
              <h2
                id="mazzola-cta"
                className="font-display text-ink-hi text-3xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-4xl lg:text-5xl"
              >
                Lo stadio dove si sono allenati Baggio, Vialli e Del Piero
              </h2>
              <p className="text-ink-mid max-w-xl text-base leading-relaxed">
                Tra il 1979 e i primi anni 2000 lo Sporting Orbassano (allora
                Sisport Fiat) ha ospitato gli allenamenti di Torino e Juventus.
                Generazioni di campioni hanno tagliato il prato dello stadio
                Valentino Mazzola — la storia completa nella sezione Storia.
              </p>
            </div>
            <Link
              href="/societa/storia#mazzola-title"
              className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-surface-0 focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Vai alla sezione &laquo;Il Mazzola&raquo;
              <ArrowRight size={14} aria-hidden />
            </Link>
          </Container>
        </section>
      )}
    </>
  );
}
