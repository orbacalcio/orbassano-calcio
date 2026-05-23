import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
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
 * Il singleton riferimentiOperativi è usato solo per i metadati
 * (versione/date del Codice nell'hero + Article JSON-LD). L'Allegato B
 * "Riferimenti operativi" in fondo alla pagina è stato rimosso
 * (richiesta utente 2026-05-22).
 */

const PAGE_TITLE = "Codice Etico — A.S.D. Orbassano Calcio";
const PAGE_DESCRIPTION =
  "Il Codice Etico dell'A.S.D. Orbassano Calcio: principi, valori, regole di condotta per dirigenti, tecnici, atleti, sponsor e fornitori.";

export const metadata: Metadata = {
  alternates: { canonical: "/societa/codice-etico" },
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
        <HeaderMotif variant="pitch" />
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
            <DownloadCTA />
          </div>
        </Container>
      </header>

      {/* CORPO — light theme (cream parchment) per leggibilita' lunga
          editoriale dei 12 capitoli. Hero sopra resta dark per
          contrasto editoriale; il body si stacca chiaro come una
          stampa di documento ufficiale. Allineato al pattern light
          gia' usato su Manifesto, /squadre vista categoria, sezione
          impianti. Token light-ink-* + light-border configurati in
          globals.css (@theme). */}
      <section className="bg-light-bg-0 py-12 lg:py-16">
        <Container size="wide">
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
            </main>
          </div>
        </Container>
      </section>
    </>
  );
}
