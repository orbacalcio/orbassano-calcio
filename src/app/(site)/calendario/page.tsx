import type { Metadata } from "next";
import { SocietaHubCard } from "@/components/societa/SocietaHubCard";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/calendario" },
  title: "Calendari",
  description:
    "Tutti i calendari di ASD Orbassano Calcio: Prima Squadra, Juniores e Settore Giovanile (U14-U17). Scegli la squadra e accedi al calendario completo con tutte le partite di campionato e amichevoli.",
};

/**
 * Pagina hub /calendario: 3 card numerate stile TeamsCards homepage
 * (numero gigante gold/40 + titolo + descrizione + CTA "Esplora" al
 * hover). Ogni card linka al rispettivo calendario:
 *  - Prima Squadra → /squadre/prima-squadra/calendario
 *  - Juniores → /squadre/juniores/calendario
 *  - Settore Giovanile → /squadre/settore-giovanile/calendario
 *    (pagina aggregata con tutti i match U14-U17 in unica lista)
 *
 * Header + 3 card sono completamente editabili da Studio: Stagione
 * corrente → Squadre → Impostazioni pagina /calendario → fieldset
 * "Pagina /calendario". Fallback hardcoded se CMS non popolato.
 */
type CalendarioCategory = "Prima Squadra" | "Juniores" | "Settore Giovanile";

type CalendarioPageSection = {
  category?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
};

type CalendarioPageSettings = {
  calendarioPageEyebrow?: string | null;
  calendarioPageTitle?: string | null;
  calendarioPageSubtitle?: string | null;
  calendarioPageSections?: CalendarioPageSection[] | null;
};

const FALLBACK_HEADER = {
  eyebrow: "Calendari",
  title: "Tutte le partite di tutte le squadre",
  subtitle:
    "Scegli una squadra per accedere al calendario completo del campionato, alle amichevoli e ai risultati. Dalla Prima Squadra al Settore Giovanile, ogni gruppo ha la sua agenda aggiornata.",
};

const CARD_SLOTS: Array<{
  number: string;
  category: CalendarioCategory;
  href: string;
  fallbackEyebrow: string;
  fallbackTitle: string;
  fallbackDescription: string;
}> = [
  {
    number: "01",
    category: "Prima Squadra",
    href: "/squadre/prima-squadra/calendario",
    fallbackEyebrow: "01 — Calendario senior",
    fallbackTitle: "Prima Squadra",
    fallbackDescription:
      "Prima Categoria Piemonte VdA. Tutte le partite di campionato, amichevoli, risultati e tabellini ufficiali.",
  },
  {
    number: "02",
    category: "Juniores",
    href: "/squadre/juniores/calendario",
    fallbackEyebrow: "02 — Calendario Juniores",
    fallbackTitle: "Juniores",
    fallbackDescription:
      "Campionato Juniores Under 19. Le gare del nostro ultimo gradino prima del salto in Prima Squadra.",
  },
  {
    number: "03",
    category: "Settore Giovanile",
    href: "/squadre/settore-giovanile/calendario",
    fallbackEyebrow: "03 — Settore Giovanile U14-U17",
    fallbackTitle: "Settore Giovanile Scolastico",
    fallbackDescription:
      "Tutti i calendari Under 17, Under 16, Under 15 e Under 14 raccolti in un'unica vista cronologica.",
  },
];

async function fetchCalendarioPageSettings(): Promise<CalendarioPageSettings> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    return (data ?? {}) as CalendarioPageSettings;
  } catch {
    return {};
  }
}

export default async function CalendarioPage() {
  const settings = await fetchCalendarioPageSettings();
  const cmsSections = settings.calendarioPageSections ?? [];

  const header = {
    eyebrow:
      settings.calendarioPageEyebrow?.trim() || FALLBACK_HEADER.eyebrow,
    title: settings.calendarioPageTitle?.trim() || FALLBACK_HEADER.title,
    subtitle:
      settings.calendarioPageSubtitle?.trim() || FALLBACK_HEADER.subtitle,
  };

  const cards = CARD_SLOTS.map((slot) => {
    const cms = cmsSections.find((c) => c.category === slot.category);
    return {
      number: slot.number,
      title: cms?.title?.trim() || slot.fallbackTitle,
      description: cms?.description?.trim() || slot.fallbackDescription,
      href: slot.href,
      // L'eyebrow numerato CMS-driven NON viene mostrato nelle card
      // (SocietaHubCard mostra solo number+title+description+CTA).
      // Resta come label gestionale Studio per identificare la card.
    };
  });

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
              {header.eyebrow}
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              {header.title}
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              {header.subtitle}
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <RevealOnScroll>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <SocietaHubCard key={card.number} {...card} />
              ))}
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </>
  );
}
