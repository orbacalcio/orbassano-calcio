"use client";

import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Barra di ricerca grande sopra il footer (pattern juventus.com).
 *
 * Sfondo chiaro a contrasto col dark del sito, cliccabile su tutta
 * l'area. Al click dispatcha un CustomEvent globale "orba:open-search"
 * che ClientShell intercetta per aprire il SearchDialog esistente —
 * cosi' restiamo con UN solo dialog in pagina (e UN solo state) anche
 * se i punti di ingresso sono multipli (topbar, drawer, questa CTA).
 */
export function SearchPromptCTA() {
  function onClick() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("orba:open-search"));
    }
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
