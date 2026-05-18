import { ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { VivLOrbaWidget } from "./VivLOrbaWidget";
import { VivLOrbaWidgetBoundary } from "./VivLOrbaWidgetBoundary";

/**
 * Sezione "Vivi l'Orba" della homepage: feed Instagram embed via
 * Behold (https://behold.so), pattern juventus.com che usa l'IG feed
 * solo in questa sezione (non nell'hero).
 *
 * Configurazione: l'env var `NEXT_PUBLIC_BEHOLD_FEED_ID` contiene
 * l'ID del feed Behold (lo si crea su behold.so collegando l'account
 * Instagram del club). Se non e' configurato, mostriamo un placeholder
 * pulito con CTA al profilo IG — utile in dev/staging finche' Behold
 * non e' collegato.
 *
 * Il link "Seguici su Instagram" usa il singleton settings.social.instagram
 * con fallback all'handle ufficiale del club.
 */

const FALLBACK_INSTAGRAM_URL = "https://www.instagram.com/asdorbassanocalcio/";

type Settings = {
  social?: { instagram?: string | null } | null;
};

async function fetchInstagramUrl(): Promise<string> {
  try {
    const data = (await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    )) as Settings | null;
    return data?.social?.instagram ?? FALLBACK_INSTAGRAM_URL;
  } catch {
    return FALLBACK_INSTAGRAM_URL;
  }
}

export async function VivLOrba() {
  const feedId = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID;
  const instagramUrl = await fetchInstagramUrl();

  return (
    <section
      aria-label="Vivi l'Orba — feed Instagram"
      className="bg-light-bg-0 relative overflow-hidden py-20"
    >
      <Container className="relative" size="wide">
        <Section
          tone="light"
          eyebrow="Vivi l'Orba"
          title="Il club dentro Instagram"
          subtitle="Allenamenti, partite, momenti di spogliatoio. Quello che succede sui campi di Orbassano arriva prima qui."
        >
          <div className="mt-4">
            {feedId ? (
              <VivLOrbaWidgetBoundary fallback={<BeholdPlaceholder />}>
                <VivLOrbaWidget feedId={feedId} />
              </VivLOrbaWidgetBoundary>
            ) : (
              <BeholdPlaceholder />
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-red text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <InstagramIcon size={16} />
              Seguici su Instagram
              <ArrowUpRight size={16} />
            </a>
          </div>
        </Section>
      </Container>
    </section>
  );
}

/**
 * Placeholder fotografico-coerente quando Behold non e' configurato:
 * 6 caselle quadrate con gradient brand alternato + watermark Instagram
 * sotto. Mai schermo vuoto.
 */
function BeholdPlaceholder() {
  return (
    <div
      aria-label="Feed Instagram non ancora collegato"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="border-border/50 bg-surface-1 relative aspect-square overflow-hidden rounded-md border"
        >
          <div
            className={
              i % 2 === 0
                ? "from-brand-blue/40 to-surface-1 absolute inset-0 bg-gradient-to-br"
                : "from-brand-red/30 to-surface-1 absolute inset-0 bg-gradient-to-tr"
            }
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <InstagramIcon
              size={32}
              className="text-ink-low/30"
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
