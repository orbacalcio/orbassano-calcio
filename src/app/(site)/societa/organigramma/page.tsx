import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { OfficialCard } from "@/components/societa/OfficialCard";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { fetchClubOfficials, type ClubOfficial } from "@/sanity/fetchers";

/**
 * Raggruppa i dirigenti per il campo `group`. L'ordine dei gruppi
 * segue la prima occorrenza nella lista (gia' ordinata per `order`).
 * Dirigenti senza group finiscono in un gruppo "default" senza titolo.
 */
function groupOfficials(
  officials: ClubOfficial[],
): Array<{ key: string; title: string | null; items: ClubOfficial[] }> {
  const groups = new Map<string, ClubOfficial[]>();
  for (const o of officials) {
    const key = o.group?.trim() ?? "";
    const existing = groups.get(key);
    if (existing) {
      existing.push(o);
    } else {
      groups.set(key, [o]);
    }
  }
  return Array.from(groups, ([key, items]) => ({
    key: key || "_default",
    title: key || null,
    items,
  }));
}

export const metadata: Metadata = {
  title: "Organigramma",
  description:
    "Le persone che guidano oggi ASD Orbassano Calcio: presidente, vice, direttore generale, tesoriere, consigliere e responsabile safeguarding.",
};

export default async function OrganigrammaPage() {
  const officials = await fetchClubOfficials();

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

      <Container className="py-16 lg:py-24" size="wide">
        <RevealOnScroll>
          {officials.length > 0 ? (
            <div className="flex flex-col gap-12">
              {groupOfficials(officials).map((group) => (
                <section key={group.key} className="flex flex-col gap-5">
                  {group.title && (
                    <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                      {group.title}
                    </span>
                  )}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {group.items.map((o) => (
                      <OfficialCard key={o._id} official={o} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="text-ink-mid border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center text-base">
              L&apos;organigramma non &egrave; ancora popolato. Controlla che il CMS
              contenga i dirigenti e i webhook revalidate siano attivi.
            </p>
          )}
        </RevealOnScroll>
      </Container>

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
              Come ci contatti
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
