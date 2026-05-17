import type { Metadata } from "next";
import { FacilityCard } from "@/components/societa/FacilityCard";
import { MazzolaImpiantiBox } from "@/components/societa/MazzolaImpiantiBox";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { fetchFacilities } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Impianti sportivi",
  description:
    "Gli impianti sportivi di ASD Orbassano Calcio: dove si allenano e giocano la Prima Squadra e il Settore Giovanile.",
};

export default async function ImpiantiPage() {
  const facilities = await fetchFacilities();

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

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            {facilities.length > 0 ? (
              <div className="flex flex-col gap-8">
                {facilities.map((f, i) => (
                  <FacilityCard key={f._id} facility={f} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-light-ink-mid border-light-border bg-light-bg-1 rounded-2xl border border-dashed p-10 text-center text-base">
                Gli impianti non sono ancora popolati nel CMS.
              </p>
            )}
          </RevealOnScroll>
        </Container>
      </section>

      {/* Box editoriale "Il Mazzola" — sempre visibile (testo + lista
          campioni editabili da Studio → singleton settings → fieldset
          "Box Il Mazzola"). Indipendente dallo stato isActive del
          facility Mazzola in CMS: e' una memoria storica, non un
          impianto operativo. */}
      <MazzolaImpiantiBox />
    </>
  );
}
