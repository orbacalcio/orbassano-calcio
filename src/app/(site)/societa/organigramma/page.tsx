import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { OfficialCard } from "@/components/societa/OfficialCard";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { buildClubOfficialLd } from "@/lib/json-ld";
import { fetchClubOfficials } from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/societa/organigramma" },
  title: "Organigramma",
  description:
    "Le persone che guidano oggi ASD Orbassano Calcio: presidente, vice, direttore generale, tesoriere, consigliere e responsabile safeguarding.",
};

export default async function OrganigrammaPage() {
  const officials = await fetchClubOfficials();
  // Due livelli (richiesta utente 2026-05-22): il Presidente in evidenza
  // in cima, tutti gli altri nel Consiglio Direttivo. Match esatto su
  // "presidente" (esclude "vice presidente"); fallback al primo per
  // `order` se non trovato.
  const president =
    officials.find((o) => o.role.trim().toLowerCase() === "presidente") ??
    officials[0] ??
    null;
  const council = officials.filter((o) => o !== president);

  // Person JSON-LD per ogni dirigente (audit fix #2): da' a Google
  // una mappa "chi e' chi" del club, utile per knowledge graph e
  // disambiguazione ricerche tipo "presidente Orbassano Calcio".
  const peopleLd = officials.map((o) =>
    buildClubOfficialLd({
      fullName: o.fullName,
      role: o.role,
      title: o.title,
    }),
  );

  return (
    <>
      {peopleLd.length > 0 && <JsonLd data={peopleLd} />}
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="pitch" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Organigramma
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Le persone del club
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Il consiglio direttivo di ASD Orbassano Calcio guida la vita
              societaria, i tesseramenti e le relazioni con la Lega
              Nazionale Dilettanti. Per contattare segreteria e dirigenza
              usa i riferimenti in fondo pagina.
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            {officials.length > 0 ? (
              // Due livelli, tutto centrato (anche tablet/mobile), senza
              // box: Presidente in cima da solo, poi il Consiglio
              // Direttivo (tutti gli altri) in una riga che va a capo
              // centrata. flex-wrap justify-center → centratura su ogni
              // breakpoint senza colonne fisse.
              <div className="flex flex-col items-center gap-14 lg:gap-20">
                {president && (
                  <section className="flex w-full flex-col items-center gap-7">
                    <h2 className="font-display text-light-ink-hi text-center text-3xl font-extrabold tracking-[0.03em] uppercase sm:text-4xl">
                      Presidente
                    </h2>
                    <OfficialCard official={president} />
                  </section>
                )}
                {council.length > 0 && (
                  <section className="flex w-full flex-col items-center gap-8">
                    <h2 className="font-display text-light-ink-hi text-center text-3xl font-extrabold tracking-[0.03em] uppercase sm:text-4xl">
                      Consiglio Direttivo
                    </h2>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-9">
                      {council.map((o) => (
                        <OfficialCard key={o._id} official={o} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <p className="text-light-ink-mid border-light-border bg-light-bg-1 rounded-2xl border border-dashed p-10 text-center text-base">
                L&apos;organigramma non &egrave; ancora popolato. Controlla che il CMS
                contenga i dirigenti e i webhook revalidate siano attivi.
              </p>
            )}
          </RevealOnScroll>
        </Container>
      </section>

      <section
        aria-labelledby="contatti-segreteria"
        className="bg-surface-1 border-border/50 border-t"
      >
        <Container className="grid items-start gap-10 py-16 lg:grid-cols-[1fr_1.5fr] lg:py-20" size="wide">
          <div className="flex flex-col gap-3">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Segreteria
            </span>
            <h2
              id="contatti-segreteria"
              className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl"
            >
              Come contattarci
            </h2>
          </div>
          <ul className="text-ink-mid grid gap-6 sm:grid-cols-2">
            <li className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                Orari segreteria
              </span>
              <span className="text-ink-hi text-base leading-relaxed">
                Martedì e giovedì
                <br />
                17:30 — 19:30
              </span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                Sede operativa
              </span>
              <span className="text-ink-hi text-base leading-relaxed">
                Centro Sportivo &laquo;Aldo Porta&raquo;
                <br />
                Via Ignazio Silone, 4
                <br />
                10043 Orbassano (TO)
              </span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="text-ink-low font-mono text-xs tracking-[0.15em] uppercase">
                Email
              </span>
              <a
                href="mailto:info@orbassanocalcio.com"
                className="text-ink-hi hover:text-brand-gold flex items-center gap-2 text-base transition-colors"
              >
                <Mail size={14} aria-hidden />
                info@orbassanocalcio.com
              </a>
              <span className="text-ink-low font-mono text-xs tracking-wide">
                PEC orbassanocalcio@legalmail.it
              </span>
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
        </Container>
      </section>
    </>
  );
}
