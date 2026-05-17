"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Container } from "@/components/ui/Container";

/**
 * Barra di ricerca grande sopra il footer (pattern juventus.com).
 *
 * Vera input field: il termine si scrive direttamente sulla barra,
 * submit con Enter o click sulla lente. Naviga alla pagina dedicata
 * /ricerca?q=... che mostra i risultati paginati su pagina (non in
 * modal). Min 2 caratteri per evitare submit a vuoto.
 *
 * Il SearchDialog modale continua a esistere come scorciatoia veloce
 * (topbar search + drawer hamburger search) per query-and-go senza
 * cambiare pagina. La CTA qui sopra footer punta invece all'esperienza
 * "page-based" come azione editoriale piu' deliberata.
 *
 * Stessa estetica del pulsante precedente (bg #e8edf5 chiaro a
 * contrasto col navy del sito), solo trasformato in form.
 */
export function SearchPromptCTA() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    router.push(`/ricerca?q=${encodeURIComponent(trimmed)}`);
  }

  const canSubmit = q.trim().length >= 2;

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Cerca nel sito"
      className="bg-[#e8edf5] focus-within:bg-[#dfe6f0] group block w-full py-10 transition-colors md:py-12"
    >
      <Container size="wide" className="flex items-center gap-6">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Scrivi qui per iniziare la ricerca"
          aria-label="Termine di ricerca"
          autoComplete="off"
          spellCheck={false}
          className="font-display text-surface-0 placeholder:text-surface-0/40 min-w-0 flex-1 bg-transparent text-2xl leading-tight font-bold tracking-[0.005em] outline-none md:text-4xl lg:text-5xl"
        />
        <button
          type="submit"
          aria-label="Avvia ricerca"
          disabled={!canSubmit}
          className="text-surface-0/40 hover:text-surface-0 focus-visible:outline-brand-gold shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed enabled:text-surface-0/70"
        >
          <Search className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2} aria-hidden />
        </button>
      </Container>
    </form>
  );
}
