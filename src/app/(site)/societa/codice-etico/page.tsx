import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, ScrollText, ShieldAlert } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { FEATURES } from "@/lib/features";
import { buildArticleLd } from "@/lib/json-ld";
import { fetchRiferimentiOperativi } from "@/sanity/fetchers";
import { ChapterNav } from "./components/ChapterNav";
import { DownloadCTA } from "./components/DownloadCTA";
import { Premessa } from "./content/premessa";
import { Capitolo01 } from "./content/capitolo-01";
import { Capitolo02 } from "./content/capitolo-02";
import { Capitolo03 } from "./content/capitolo-03";
import { Capitolo04 } from "./content/capitolo-04";
import { Capitolo05 } from "./content/capitolo-05";
import { Capitolo06 } from "./content/capitolo-06";
import { Capitolo07 } from "./content/capitolo-07";
import { Capitolo08 } from "./content/capitolo-08";
import { Capitolo09 } from "./content/capitolo-09";
import { Capitolo10 } from "./content/capitolo-10";
import { Capitolo11 } from "./content/capitolo-11";
import { Capitolo12 } from "./content/capitolo-12";

/**
 * Pagina /societa/codice-etico — Codice Etico A.S.D. Orbassano Calcio.
 *
 * Layout 2 colonne (desktop): ChapterNav (TOC sticky con scroll-spy)
 * a sx, contenuto capitoli a dx. Su mobile lineare full-width, niente
 * TOC.
 *
 * Contenuto: JSX statico in src/app/(site)/societa/codice-etico/content/.
 * Modifiche al testo richiedono PR mirata + delibera Direttivo (art.
 * 12.5 del Codice).
 *
 * Trascrizione completa (Step 2 governance):
 *   - Premessa + Cap 01-12 (corpo del Codice Etico)
 *   - Sorgente HTML: `docs/source/codice-etico-source.html`
 *     Modifiche al testo richiedono PR mirata + delibera Direttivo
 *     (art. 12.5 del Codice).
 *
 * Riferimenti operativi (Allegato B): in fondo alla pagina, dati
 * dinamici dal singleton Sanity riferimentiOperativi (Direttivo,
 * Safeguarding, email segnalazioni, versione corrente).
 */

const PAGE_TITLE = "Codice Etico — A.S.D. Orbassano Calcio";
const PAGE_DESCRIPTION =
  "Il Codice Etico dell'A.S.D. Orbassano Calcio: principi, valori, regole di condotta per dirigenti, tecnici, atleti, sponsor e fornitori.";

export const metadata: Metadata = {
  title: "Codice Etico",
  description: PAGE_DESCRIPTION,
  robots: FEATURES.governanceSection
    ? undefined
    : { index: false, follow: false },
};

export default async function CodiceEticoPage() {
  if (!FEATURES.governanceSection) notFound();

  const riferimenti = await fetchRiferimentiOperativi();

  const articleLd = buildArticleLd({
    title: PAGE_TITLE,
    url: "/societa/codice-etico",
    description: PAGE_DESCRIPTION,
    datePublished: riferimenti?.codiceEticoInVigoreDal ?? null,
    dateModified: riferimenti?.ultimoAggiornamento ?? null,
    version: riferimenti?.codiceEticoVersione ?? null,
  });

  const versionLine = [
    riferimenti?.codiceEticoVersione
      ? `Versione ${riferimenti.codiceEticoVersione}`
      : null,
    riferimenti?.codiceEticoApprovatoIl
      ? `Approvato dal Direttivo il ${new Date(riferimenti.codiceEticoApprovatoIl).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}`
      : null,
    riferimenti?.codiceEticoInVigoreDal
      ? `In vigore dal ${new Date(riferimenti.codiceEticoInVigoreDal).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <JsonLd data={articleLd} />

      {/* HERO compatto */}
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Documenti istituzionali
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Codice Etico
            </h1>
            {versionLine && (
              <p className="text-ink-mid font-mono text-xs tracking-wide">
                {versionLine}
              </p>
            )}
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Principi, valori e regole di condotta per dirigenti, tecnici,
              atleti, sponsor e fornitori. Il Codice Etico dell&apos;A.S.D.
              Orbassano Calcio è giuridicamente vincolante per tutti i
              tesserati e i collaboratori della Società.
            </p>
            <DownloadCTA pdfUrl={riferimenti?.codiceEticoPdfUrl ?? null} />
          </div>
        </Container>
      </header>

      {/* CORPO 2-col */}
      <Container className="py-12 lg:py-16" size="wide">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside>
            <ChapterNav />
          </aside>

          <main className="flex max-w-3xl flex-col gap-16">
            <Premessa />
            <Capitolo01 />
            <Capitolo02 />
            <Capitolo03 />
            <Capitolo04 />
            <Capitolo05 />
            <Capitolo06 />
            <Capitolo07 />
            <Capitolo08 />
            <Capitolo09 />
            <Capitolo10 />
            <Capitolo11 />
            <Capitolo12 />

            {/* RIFERIMENTI OPERATIVI (Allegato B) */}
            {riferimenti && (
              <section
                id="riferimenti-operativi"
                className="border-border/40 scroll-mt-24 flex flex-col gap-8 border-t pt-12"
              >
                <header className="flex flex-col gap-2">
                  <span className="font-mono text-brand-gold text-xs font-bold tracking-[0.25em] uppercase">
                    Allegato B
                  </span>
                  <h2 className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase sm:text-4xl">
                    Riferimenti operativi
                  </h2>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    Dati istituzionali e ruoli operativi del club.
                    Aggiornabili dallo Studio CMS senza nuova revisione del
                    Codice (art. 12.8). Per i dettagli completi su
                    rendicontazione 5×1000 e trasparenza, vedi{" "}
                    <Link
                      href="/societa/trasparenza"
                      className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                    >
                      la pagina trasparenza
                    </Link>
                    .
                  </p>
                </header>

                {riferimenti.direttivo && riferimenti.direttivo.length > 0 && (
                  <div>
                    <h3 className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                      Direttivo
                    </h3>
                    <ul className="border-border/40 mt-3 flex flex-col divide-y rounded-2xl border">
                      {riferimenti.direttivo.map((m, i) => (
                        <li
                          key={`${m.ruolo}-${m.nome}-${i}`}
                          className="flex flex-col gap-1 p-4"
                        >
                          <span className="font-mono text-ink-low text-[11px] tracking-[0.12em] uppercase">
                            {m.ruolo ?? "—"}
                          </span>
                          <span className="font-display text-ink-hi text-base font-bold tracking-[0.005em] uppercase">
                            {m.nome ?? "—"}
                          </span>
                          {m.delega && (
                            <span className="text-ink-mid text-xs">
                              {m.delega}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2">
                    <ShieldAlert size={14} aria-hidden />
                    Responsabile Safeguarding
                  </h3>
                  {riferimenti.responsabileSafeguarding?.inCarica ? (
                    <div className="border-border/40 bg-surface-1 mt-3 flex flex-col gap-1 rounded-2xl border p-4">
                      <span className="font-display text-ink-hi text-base font-bold tracking-[0.005em] uppercase">
                        {riferimenti.responsabileSafeguarding.nome ?? "—"}
                      </span>
                      {riferimenti.responsabileSafeguarding.email && (
                        <a
                          href={`mailto:${riferimenti.responsabileSafeguarding.email}`}
                          className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 text-sm transition-colors"
                        >
                          <Mail size={14} aria-hidden />
                          {riferimenti.responsabileSafeguarding.email}
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-ink-mid mt-3 text-sm leading-relaxed">
                      Posizione attualmente vacante. Le segnalazioni in
                      materia di Safeguarding sono ricevute dal Direttivo
                      all&apos;indirizzo{" "}
                      {riferimenti.emailSegnalazioni ? (
                        <a
                          href={`mailto:${riferimenti.emailSegnalazioni}`}
                          className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                        >
                          {riferimenti.emailSegnalazioni}
                        </a>
                      ) : (
                        "(da configurare)"
                      )}{" "}
                      (art. 3.7 del Codice Etico).
                    </p>
                  )}
                </div>

                {riferimenti.emailSegnalazioni && (
                  <div className="border-brand-gold/30 bg-brand-gold/5 flex flex-col gap-2 rounded-2xl border p-5">
                    <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2">
                      <ScrollText size={14} aria-hidden />
                      Canale segnalazioni
                    </span>
                    <p className="text-ink-mid text-sm leading-relaxed">
                      Per segnalare violazioni del Codice Etico usa il{" "}
                      <Link
                        href="/societa/segnalazioni"
                        className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                      >
                        modulo dedicato
                      </Link>{" "}
                      oppure scrivi a{" "}
                      <a
                        href={`mailto:${riferimenti.emailSegnalazioni}`}
                        className="text-brand-gold hover:text-brand-white"
                      >
                        {riferimenti.emailSegnalazioni}
                      </a>
                      . Riservatezza garantita (art. 11.6) e divieto di
                      ritorsioni (art. 11.7).
                    </p>
                  </div>
                )}

                {riferimenti.codiceEticoArchivio &&
                  riferimenti.codiceEticoArchivio.length > 0 && (
                    <div>
                      <h3 className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                        Versioni precedenti
                      </h3>
                      <ul className="border-border/40 mt-3 flex flex-col divide-y rounded-2xl border">
                        {riferimenti.codiceEticoArchivio.map((v, i) => (
                          <li
                            key={`${v.versione}-${i}`}
                            className="flex flex-wrap items-center justify-between gap-3 p-4"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-display text-ink-hi text-sm font-bold tracking-[0.005em] uppercase">
                                Versione {v.versione}
                              </span>
                              {v.note && (
                                <span className="text-ink-low text-xs">
                                  {v.note}
                                </span>
                              )}
                              {v.approvatoIl && (
                                <span className="text-ink-mid font-mono text-[10px]">
                                  {new Date(v.approvatoIl).toLocaleDateString("it-IT")}
                                  {v.sostituitoIl &&
                                    ` → ${new Date(v.sostituitoIl).toLocaleDateString("it-IT")}`}
                                </span>
                              )}
                            </div>
                            {v.pdf && (
                              <a
                                href={v.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-gold hover:text-brand-white text-xs font-semibold transition-colors"
                              >
                                Scarica PDF
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </section>
            )}
          </main>
        </div>
      </Container>
    </>
  );
}
