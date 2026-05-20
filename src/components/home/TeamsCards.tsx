import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";

/**
 * 3 card numerate (01/02/03) per le macro-categorie federali del club:
 * Prima Categoria → Prima Squadra · Campionato Juniores → Under 19 ·
 * Settore Giovanile Scolastico → U17/U16/U15/U14.
 *
 * I testi (eyebrow, titolo, sottotitolo, titolo/descrizione di ogni card)
 * sono modificabili da Sanity Studio nel singleton "Impostazioni" →
 * fieldset 'Box "Le squadre"'. Se l'admin non li ha popolati, fallback
 * ai default editoriali sotto. Numeri 01/02/03 e link restano hardcoded
 * (struttura fissa: 3 card che linkano alle 3 sezioni squadre).
 *
 * La Scuola Calcio (sotto i 12 anni) e' al momento gestita da Sporting
 * Orbassano e non figura in homepage finche' non rientrera' nel
 * tesseramento del club.
 */

type TeamsCardsSettings = {
  teamsCardsEyebrow?: string | null;
  teamsCardsTitle?: string | null;
  teamsCardsSubtitle?: string | null;
  teamsCardsItems?: Array<{
    title?: string | null;
    description?: string | null;
  }> | null;
};

// Fallback statici: usati se il singleton Sanity non e' popolato o non
// raggiungibile. Numeri e link restano sempre da qui (mai modificabili
// senza tocco al codice — i tre slot sono parte del layout fisso).
const FALLBACK_EYEBROW = "Le squadre";
const FALLBACK_TITLE = "Tre realtà, una sola identità";
const FALLBACK_SUBTITLE =
  "Dalla Prima Squadra al Settore Giovanile, passando per la Juniores Under 19: il rossoblù è uguale per tutti.";

const CARD_SLOTS = [
  {
    number: "01",
    href: "/squadre/prima-squadra",
    fallbackTitle: "Prima Squadra",
    fallbackDescription:
      "Prima Categoria Piemonte VdA. Lo staff tecnico, la rosa e il sogno di riportare Orbassano in alto.",
  },
  {
    number: "02",
    href: "/squadre/juniores",
    fallbackTitle: "Juniores",
    fallbackDescription:
      "Campionato Juniores. Under 19 rossoblù, ultimo gradino prima del salto in Prima Squadra.",
  },
  {
    number: "03",
    href: "/squadre/settore-giovanile",
    fallbackTitle: "Settore Giovanile",
    fallbackDescription:
      "Quattro categorie, dall'Under 14 all'Under 17. Mister, dirigenti, accompagnatori. Da qui passa il futuro del club.",
  },
] as const;

async function fetchTeamsCardsSettings(): Promise<TeamsCardsSettings> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    return (data ?? {}) as TeamsCardsSettings;
  } catch {
    return {};
  }
}

export async function TeamsCards() {
  const settings = await fetchTeamsCardsSettings();
  const eyebrow = settings.teamsCardsEyebrow ?? FALLBACK_EYEBROW;
  const title = settings.teamsCardsTitle ?? FALLBACK_TITLE;
  const subtitle = settings.teamsCardsSubtitle ?? FALLBACK_SUBTITLE;
  const items = settings.teamsCardsItems ?? [];

  return (
    <section className="bg-light-bg-0">
      <Container className="py-20" size="wide">
      <Section tone="light" eyebrow={eyebrow} title={title} subtitle={subtitle}>
        {/* Mobile/tablet (<lg): carosello a swipe come le news (una card
            con peek della successiva, scroll-snap nativo). Da lg griglia
            3 colonne. */}
        <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {CARD_SLOTS.map((slot, index) => {
            const cms = items[index];
            const title = cms?.title?.trim() || slot.fallbackTitle;
            const description =
              cms?.description?.trim() || slot.fallbackDescription;
            return (
              <Link
                key={slot.number}
                href={slot.href}
                className="group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex w-[85%] shrink-0 snap-center flex-col gap-6 overflow-hidden border p-8 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 lg:w-auto lg:p-10"
              >
                <span className="font-display text-brand-gold/40 group-hover:text-brand-gold text-5xl leading-none font-black transition-colors sm:text-6xl lg:text-8xl">
                  {slot.number}
                </span>
                <h3 className="font-display text-ink-hi text-3xl font-extrabold tracking-[0.01em] uppercase lg:text-4xl">
                  {title}
                </h3>
                <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
                  {description}
                </p>
                <div className="text-brand-gold mt-auto inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                  Esplora
                  <ArrowUpRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
      </Container>
    </section>
  );
}
