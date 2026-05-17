import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SearchPageClient } from "./SearchPageClient";

/**
 * Pagina risultati ricerca site-wide.
 *
 * Server wrapper minimo: il fetch dei risultati avviene client-side
 * via /api/search (stesso endpoint del SearchDialog modale) cosi'
 * pagina e modal restano sincronizzate sull'unica fonte di indice.
 * Suspense boundary obbligato per useSearchParams() in Next 16.
 */
export const metadata: Metadata = {
  title: "Ricerca · ASD Orbassano Calcio",
  description:
    "Cerca tra news, squadre, giocatori, sponsor e tutte le pagine del sito ufficiale dell'ASD Orbassano Calcio.",
  robots: { index: false, follow: true },
};

export default function RicercaPage() {
  return (
    <main className="bg-surface-0 min-h-[60vh] py-12 md:py-16 lg:py-20">
      <Container size="wide">
        <Suspense
          fallback={
            <p className="text-ink-mid text-center text-sm">Caricamento…</p>
          }
        >
          <SearchPageClient />
        </Suspense>
      </Container>
    </main>
  );
}
