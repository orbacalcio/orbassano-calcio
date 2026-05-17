import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Container } from "@/components/ui/Container";

/**
 * Sezione newsletter sopra il footer (pattern juventus.com).
 *
 * Wrappa il `NewsletterForm` reale (double opt-in via /api/newsletter
 * + log audit Sanity). Stesso componente usato in /newsletter, cosi'
 * UN solo punto di iscrizione collegato all'API: niente UX divergente
 * tra la pagina dedicata e il CTA in fondo a ogni pagina.
 */
export function NewsletterCTA() {
  return (
    <section
      aria-label="Iscriviti alla newsletter"
      className="bg-light-bg-0 py-10 md:py-12"
    >
      <Container size="default">
        {/* Cornice bianca pattern juventus.com su sfondo navy: il box
            resta scuro (bg-surface-0) con bordo bianco, ma la banda
            attorno alla sezione e' chiara (light-bg-0) per stacco
            visivo dalla sezione sopra. */}
        <div className="bg-surface-0 border-white/30 border p-8 md:p-10 lg:p-12">
          <div className="flex flex-col gap-5">
            <p className="text-ink-hi max-w-2xl text-base leading-snug md:text-lg lg:text-xl">
              Vuoi conoscere tutte le novità di orbassanocalcio.com?
            </p>
            <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase md:text-3xl lg:text-4xl">
              Lasciaci la tua mail per restare aggiornato!
            </h2>
            <div className="mt-2 w-full">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
