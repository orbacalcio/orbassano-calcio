import Image from "next/image";
import { sanityClient } from "@/sanity/client";
import { heroSlidesQuery, settingsQuery } from "@/sanity/queries";
import {
  HeroCarousel,
  type HeroCarouselConfig,
  type HeroSlide,
} from "./HeroCarousel";
import { HeroOverlay } from "./HeroOverlay";

/**
 * Hero homepage. Full-bleed sotto la topbar, altezza calc(100vh - X).
 *
 * Pattern editoriale: ogni slide del carosello porta il proprio set
 * testuale (eyebrow / headline / subhead / cta). HeroCarousel
 * sincronizza foto e testi nella stessa transizione e legge il
 * timing (autoplay/durata/transizione) da settings — l'admin puo'
 * regolare il ritmo del carosello dallo Studio senza toccare il
 * codice. Per slide piu' "discorsive" (testo lungo) si puo'
 * sovrascrivere la durata via heroSlide.customDuration.
 *
 * Se nessuna slide e' pubblicata (caso edge), fallback a un
 * placeholder testuale statico.
 */

type RawSlide = {
  _id: string;
  title: string;
  alt: string;
  image: string;
  imageLqip?: string | null;
  credits?: string | null;
  eyebrow?: string | null;
  headline?: string | null;
  subhead?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  customDuration?: number | null;
};

type Settings = {
  currentSeason: string | null;
  currentLeague: string | null;
  currentGroup: string | null;
  heroSlideDuration?: number | null;
  heroTransitionDuration?: number | null;
  heroAutoplayEnabled?: boolean | null;
};

const FALLBACK_SETTINGS: Settings = {
  currentSeason: "2026/27",
  currentLeague: "Prima Categoria Piemonte VdA",
  currentGroup: "",
};

const CONFIG_DEFAULTS = {
  slideDurationS: 5,
  transitionMs: 300,
  autoplayEnabled: true,
} as const;

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

function resolveSlides(slides: RawSlide[]): HeroSlide[] {
  return slides
    .filter((s) => s.headline && s.headline.trim().length > 0)
    .map((s) => {
      const ctaLabel = s.ctaLabel?.trim() ?? "";
      const ctaLink = s.ctaLink?.trim() ?? "";
      const custom =
        typeof s.customDuration === "number" && s.customDuration > 0
          ? s.customDuration
          : null;
      return {
        _id: s._id,
        alt: s.alt,
        image: s.image,
        imageLqip: s.imageLqip ?? null,
        credits: s.credits ?? null,
        eyebrow: s.eyebrow?.trim() || null,
        headline: s.headline!.trim(),
        subhead: s.subhead?.trim() || null,
        ctaLabel: ctaLabel || null,
        ctaLink: ctaLink || null,
        customDurationS: custom,
      };
    });
}

function resolveCarouselConfig(settings: Settings): HeroCarouselConfig {
  const slideDurationS =
    typeof settings.heroSlideDuration === "number" &&
    settings.heroSlideDuration > 0
      ? settings.heroSlideDuration
      : CONFIG_DEFAULTS.slideDurationS;
  const transitionMs =
    typeof settings.heroTransitionDuration === "number" &&
    settings.heroTransitionDuration > 0
      ? settings.heroTransitionDuration
      : CONFIG_DEFAULTS.transitionMs;
  const autoplayEnabled =
    typeof settings.heroAutoplayEnabled === "boolean"
      ? settings.heroAutoplayEnabled
      : CONFIG_DEFAULTS.autoplayEnabled;
  return { slideDurationS, transitionMs, autoplayEnabled };
}

export async function Hero() {
  const { slides, settings } = await fetchHeroData();
  const resolvedSlides = resolveSlides(slides);
  const config = resolveCarouselConfig(settings);
  const hasSlides = resolvedSlides.length > 0;

  const season =
    settings.currentSeason ?? FALLBACK_SETTINGS.currentSeason ?? "";
  const league =
    settings.currentLeague ?? FALLBACK_SETTINGS.currentLeague ?? "";
  const group = settings.currentGroup ?? FALLBACK_SETTINGS.currentGroup ?? "";

  return (
    <section
      data-hero-sentinel
      aria-label="Identità del club"
      // -mt-[100px] lg:-mt-[78px]: annulla il padding-top del main
      // (AppShell pt-[100px] lg:pt-[78px]) cosi' l'hero parte da Y=0
      // del viewport e la Topbar transparente in HERO mode fluttua
      // SOPRA l'immagine, juventus.com-style. I valori sono in
      // sincrono con AppShell.tsx — se cambi uno cambia anche l'altro.
      // min-h-dvh = 100dvh: hero occupa l'intera viewport altezza. dvh
      // (dynamic viewport height) invece di vh: su iOS Safari / Chrome
      // Android la barra indirizzi dinamica non taglia piu' il fondo
      // dell'hero (con 100vh la CTA poteva finire sotto la piega). Il
      // prossimo blocco (NewsGrid) parte subito sotto al viewport edge.
      className="relative -mt-[100px] flex min-h-dvh flex-col justify-center overflow-hidden lg:-mt-[78px]"
    >
      {hasSlides ? (
        <HeroCarousel slides={resolvedSlides} config={config} />
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
