import Image from "next/image";
import { sanityClient } from "@/sanity/client";
import { heroSlidesQuery, settingsQuery } from "@/sanity/queries";
import { HeroCarousel } from "./HeroCarousel";
import { HeroOverlay } from "./HeroOverlay";

/**
 * Hero homepage. Full-bleed sotto la topbar (44px), altezza
 * calc(100vh - 44px). Carosello di foto se Sanity ha slide attive,
 * fallback con logo gigante + gradient brand altrimenti.
 */
type Slide = {
  _id: string;
  title: string;
  alt: string;
  image: string;
  credits?: string | null;
};

/**
 * Fallback temporaneo per il carosello hero, finche' lo Studio non ha
 * heroSlide reali caricati. Le immagini vivono in public/temp-hero/
 * (gitignored, scaricate manualmente dal vecchio sito Wix). Quando
 * Sanity restituisce slide attive, queste vengono ignorate.
 */
const FALLBACK_HERO_SLIDES: Slide[] = [
  {
    _id: "temp-hero-1",
    title: "Giovani calciatori in azione",
    alt: "Giovani calciatori del settore giovanile in azione su campo erboso",
    image: "/temp-hero/slide-01.jpg",
  },
  {
    _id: "temp-hero-2",
    title: "Calciatore in azione",
    alt: "Calciatore della prima squadra in fase di gioco",
    image: "/temp-hero/slide-02.jpg",
  },
  {
    _id: "temp-hero-3",
    title: "Allenamento scuola calcio",
    alt: "Bambini della scuola calcio durante un allenamento al Centro Sportivo",
    image: "/temp-hero/slide-03.jpg",
  },
];

type Settings = {
  currentSeason: string | null;
  currentLeague: string | null;
  currentGroup: string | null;
};

// 2026/27 in Prima Categoria dopo retrocessione 2025/26 dalla Promozione.
// Il girone resta vuoto finche la LND non lo pubblica (tipicamente
// agosto): l'eyebrow hero filtra automaticamente i pezzi vuoti.
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
      slides: (slides ?? []) as Slide[],
      settings: (settings ?? FALLBACK_SETTINGS) as Settings,
    };
  } catch {
    return { slides: [] as Slide[], settings: FALLBACK_SETTINGS };
  }
}

export async function Hero() {
  const { slides: sanitySlides, settings } = await fetchHeroData();
  const season = settings.currentSeason ?? FALLBACK_SETTINGS.currentSeason ?? "";
  const league = settings.currentLeague ?? FALLBACK_SETTINGS.currentLeague ?? "";
  const group = settings.currentGroup ?? FALLBACK_SETTINGS.currentGroup ?? "";
  // Sanity prevale: usiamo i fallback temporanei solo se lo Studio
  // non ha ancora heroSlide attive. Il carosello e' identico per
  // entrambe le sorgenti.
  const slides = sanitySlides.length > 0 ? sanitySlides : FALLBACK_HERO_SLIDES;

  return (
    <section
      data-hero-sentinel
      aria-label="Identità del club"
      className="relative flex min-h-[calc(100vh-44px)] flex-col justify-end overflow-hidden"
    >
      {/* Sfondo: carosello se ci sono slide (vere o fallback), altrimenti
          fallback gradient brand quando neanche le placeholder sono
          presenti (es. .gitignored su un fresh checkout senza i file). */}
      {slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="from-surface-2 via-surface-1 to-surface-0 absolute inset-0 bg-gradient-to-br" />
          <div className="bg-brand-blue/40 absolute -top-32 -left-32 h-[44rem] w-[44rem] rounded-full blur-[140px]" />
          <div className="bg-brand-red/25 absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full blur-[160px]" />
          <div className="bg-brand-gold/10 absolute -bottom-32 left-1/4 h-[32rem] w-[32rem] rounded-full blur-[140px]" />
          {/* Logo enorme come watermark identitario */}
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
          {/* Vignettatura morbida verso il basso per leggibilità testo */}
          <div className="from-surface-0 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        </div>
      )}

      <HeroOverlay season={season} league={league} group={group} />
    </section>
  );
}
