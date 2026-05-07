"use client";

import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Search prompt CTA — sezione molto chiara, contrasto totale col resto
 * dark del sito. Cliccabile su tutta l'area, per ora logga in console.
 * L'integrazione vera (algolia / pagefind / search Sanity) e' in M6/M7.
 */
export function SearchPromptCTA() {
  function onClick() {
    console.log("search clicked");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Apri la ricerca del sito"
      className="bg-ink-hi hover:bg-brand-gold focus-visible:outline-brand-gold group block w-full py-12 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4"
    >
      <Container
        size="wide"
        className="flex items-center justify-between gap-6"
      >
        <span className="font-display text-surface-0/40 group-hover:text-surface-0/70 text-3xl leading-tight font-bold tracking-[0.005em] uppercase transition-colors md:text-5xl">
          Scrivi qui per iniziare la ricerca
        </span>
        <Search
          className="text-surface-0/40 group-hover:text-surface-0/80 h-8 w-8 shrink-0 transition-colors"
          strokeWidth={2}
          aria-hidden
        />
      </Container>
    </button>
  );
}
