"use client";

import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { Z } from "@/lib/z-indexes";

/**
 * Sidebar destra desktop (≥ lg, 80px width, fixed full-height).
 *
 * Visibilita' gestita da ClientShell (opacity + pointer-events):
 * appare solo sopra l'hero, sostituita da TopbarScrolled allo scroll.
 * Estetica sempre trasparente, tarata per stare sopra le foto hero.
 *
 * I link arrivano dal singleton settings di Sanity. Fallback ai link
 * statici di DATA_ORBASSANO §1 finche' il CMS non e' popolato.
 */
const FALLBACK_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/asdorbassanocalcio/",
  facebook: "https://facebook.com/asdorbassanocalcio",
  threads: "https://www.threads.net/@asdorbassanocalcio",
  youtube: "https://www.youtube.com/@OrbassanoCalcio",
  twitter: "https://twitter.com/orbassanocalcio",
  tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
};

export function SidebarRight({
  links = FALLBACK_LINKS,
}: {
  links?: SocialLinks;
}) {
  return (
    <aside
      aria-label="Social del club"
      className="bg-surface-0/55 fixed top-0 right-0 hidden h-screen w-[80px] flex-col items-center pt-[210px] pb-6 backdrop-blur-md lg:flex"
      style={{ zIndex: Z.sidebar }}
    >
      <SocialIcons links={links} className="flex-col gap-3.5" />
    </aside>
  );
}
