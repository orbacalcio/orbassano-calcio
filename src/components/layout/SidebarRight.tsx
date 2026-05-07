"use client";

import { useEffect, useState } from "react";
import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z-indexes";

/**
 * Sidebar destra desktop (≥ lg, 56px width, fixed full-height).
 *
 * 6 icone social verticali. Stessa logica di trasparenza della sidebar
 * sinistra: trasparente sopra l'hero, opaca sotto.
 *
 * I link arrivano dal singleton settings di Sanity. Se il singleton non
 * e' ancora popolato, fallback ai link statici di DATA_ORBASSANO §1.
 */
const FALLBACK_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/asdorbassanocalcio/",
  facebook: "https://facebook.com/asdorbassanocalcio",
  threads: "https://www.threads.net/@asdorbassanocalcio",
  youtube: "https://www.youtube.com/@OrbassanoCalcio",
  twitter: "https://twitter.com/orbassanocalcio",
  tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
};

function useIsOverHero() {
  const [isOver, setIsOver] = useState(false);
  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsOver(Boolean(entry?.isIntersecting)),
      { rootMargin: "-44px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  return isOver;
}

export function SidebarRight({
  links = FALLBACK_LINKS,
}: {
  links?: SocialLinks;
}) {
  const isOverHero = useIsOverHero();
  return (
    <aside
      aria-label="Social del club"
      className={cn(
        "fixed top-0 right-0 hidden h-screen w-[56px] flex-col items-center justify-center transition-colors duration-300 lg:flex",
        isOverHero
          ? "bg-surface-0/55 backdrop-blur-md"
          : "bg-surface-0 border-border border-l",
      )}
      style={{ zIndex: Z.sidebar }}
    >
      <SocialIcons links={links} className="flex-col gap-2" iconSize={18} />
    </aside>
  );
}
