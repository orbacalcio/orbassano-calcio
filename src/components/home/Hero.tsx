import Image from "next/image";
import { sanityClient } from "@/sanity/client";
import { heroSlidesQuery, settingsQuery } from "@/sanity/queries";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";
import { HeroOverlay } from "./HeroOverlay";

/**
 * Hero homepage. Full-bleed sotto la topbar, altezza calc(100vh - X).
 *
 * Pattern editoriale: ogni slide del carosello porta il proprio set
 * testuale (eyebrow / headline / subhead / cta). HeroCarousel
 * sincronizza foto e testi nella stessa transizione (cross-fade
 * 300ms + stagger 100ms tra elementi testuali).
 *
 * Se nessuna slide e' pubblicata (caso edge), fallback a un
 * placeholder testuale statico (gradient brand + logo watermark +
 * HeroOverlay con testi derivati da settings + copy fisso) per non
 * lasciare uno schermo bianco.
 */

type RawSlide = {
  _id: string;
  title: string;
  alt: string;
  image: string;
  credits?: string | null;
  eyebrow?: string | null;
  headline?: string | null;
  subhead?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
};

type Settings = {
  currentSeason: string | null;
  currentLeague: string | null;
  currentGroup: string | null;
};

const FALLBACK_SETTINGS: Settings = {
  currentSeason: "2026/27",
  currentLeague: "Prima Categoria Piemonte VdA",
  currentGroup: "",
};

async function fetchHeroData() {
  try {
    const [slides, settings] = await Promise.all([
      sanityClient.fetch(
        heroSlidesQuery,
        {},
        { next: { tags: ["heroSlide"] } },
      ),
      sanityClient.fetch(
        settingsQuery,
        {},
        { next: { tags: ["settings"] } },
      ),
    ]);
    return {
      slides: (slides ?? []) as RawSlide[],
      settings: (settings ?? FALLBACK_SETTINGS) as Settings,
    };
  } catch (err) {
    console.error("[Hero.fetchHeroData]", err);
    return { slides: [] as RawSlide[], settings: FALLBACK_SETTINGS };
  }
}

/**
 * Normalizza le slide in HeroSlide: filtra fuori quelle senza
 * headline (campo required dello schema, ma slide create prima
 * dell'estensione potrebbero non averlo). I sotto-campi opzionali
 * (eyebrow, subhead, ctaLabel, ctaLink) restano null se vuoti — il
 * componente HeroCarousel li nasconde con rendering condizionale.
 */
function resolveSlides(slides: RawSlide[]): HeroSlide[] {
  return slides
    .filter((s) => s.headline && s.headline.trim().length > 0)
    .map((s) => {
      const ctaLabel = s.ctaLabel?.trim() ?? "";
      const ctaLink = s.ctaLink?.trim() ?? "";
      return {
        _id: s._id,
        alt: s.alt,
        image: s.image,
        credits: s.credits ?? null,
        eyebrow: s.eyebrow?.trim() || null,
        headline: s.headline!.trim(),
        subhead: s.subhead?.trim() || null,
        ctaLabel: ctaLabel || null,
        ctaLink: ctaLink || null,
      };
    });
}

export async function Hero() {
  const { slides, settings } = await fetchHeroData();
  const resolvedSlides = resolveSlides(slides);
  const hasSlides = resolvedSlides.length > 0;

  // Settings normalizzati per il fallback HeroOverlay (eyebrow
  // derivato da currentSeason + currentLeague + currentGroup).
  const season =
    settings.currentSeason ?? FALLBACK_SETTINGS.currentSeason ?? "";
  const league =
    settings.currentLeague ?? FALLBACK_SETTINGS.currentLeague ?? "";
  const group = settings.currentGroup ?? FALLBACK_SETTINGS.currentGroup ?? "";

  return (
    <section
      data-hero-sentinel
      aria-label="Identità del club"
      className="relative flex min-h-[calc(100vh-44px)] flex-col justify-end overflow-hidden"
    >
      {hasSlides ? (
        <HeroCarousel slides={resolvedSlides} />
      ) : (
        <>
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div className="from-surface-2 via-surface-1 to-surface-0 absolute inset-0 bg-gradient-to-br" />
            <div className="bg-brand-blue/40 absolute -top-32 -left-32 h-[44rem] w-[44rem] rounded-full blur-[140px]" />
            <div className="bg-brand-red/25 absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full blur-[160px]" />
            <div className="bg-brand-gold/10 absolute -bottom-32 left-1/4 h-[32rem] w-[32rem] rounded-full blur-[140px]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
              <Image
                src="/Logo_Orbassano_2K.png"
                alt=""
                width={900}
                height={1266}
                priority
                className="object-contain"
              />
            </div>
            <div className="from-surface-0 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          </div>
          <HeroOverlay season={season} league={league} group={group} />
        </>
      )}
    </section>
  );
}
