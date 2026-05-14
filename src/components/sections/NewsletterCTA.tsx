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
      className="bg-surface-1 border-border/40 border-y py-16 md:py-20"
    >
      <Container size="narrow" className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase md:text-3xl">
          Vuoi conoscere tutte le novità di ASD Orbassano Calcio?
        </h2>
        <p className="text-ink-mid text-base leading-relaxed">
          Lasciaci la tua mail per restare aggiornato.
        </p>

        <div className="w-full max-w-xl text-left">
          <NewsletterForm />
        </div>
      </Container>
    </section>
  );
}
