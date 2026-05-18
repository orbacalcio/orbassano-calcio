"use client";

import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { Z } from "@/lib/z-indexes";

/**
 * Sidebar destra desktop (≥ lg, 80px width, fixed full-height).
 *
 * Visibilita' gestita da ClientShell (opacity + pointer-events):
 * appare solo sopra l'hero, fadeout in parallelo all'allargamento della
 * Topbar (pattern juventus.com). Estetica sempre trasparente, tarata
 * per stare sopra le foto hero.
 *
 * I link arrivano dal singleton settings di Sanity. Fallback ai link
 * statici di DATA_ORBASSANO §1 finche' il CMS non e' popolato.
 */
const FALLBACK_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/asdorbassanocalcio/",
  facebook: "https://facebook.com/asdorbassanocalcio",
  youtube: "https://www.youtube.com/@OrbassanoCalcio/playlists",
  tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
  threads: "https://www.threads.net/@asdorbassanocalcio",
};

export function SidebarRight({
  links = FALLBACK_LINKS,
}: {
  links?: SocialLinks;
}) {
  return (
    <aside
      aria-label="Social del club"
      // bg + backdrop-blur rimossi 2026-05-17 (richiesta utente):
      // la colonna ora e' totalmente trasparente, le icone social
      // "fluttuano" sopra l'hero. Al fade-out post-hero sembra che
      // scompaiano solo le icone, non l'intera barra navy. La
      // SidebarLeft (con tutti i micro-label/icone) resta col suo
      // background bg-surface-0/55 perche' ospita la navigazione
      // principale: deve essere visivamente solida.
      className="pointer-events-none fixed top-0 right-0 hidden h-screen w-[80px] flex-col items-center pt-[125px] pb-6 lg:flex"
      style={{ zIndex: Z.sidebar }}
    >
      {/* pt-[125px]: barra social alzata di 50px (era pt-[175px], che
          allineava Instagram a "NEWS" del menu sx). Su richiesta
          utente Instagram parte piu' in alto per dare piu' aria
          verticale alla colonna social.
          pointer-events-auto: ripristina la cliccabilita' sulle
          icone (il wrapper aside e' pointer-events-none per essere
          click-through trasparente sull'hero). */}
      <SocialIcons
        links={links}
        className="pointer-events-auto flex-col gap-9"
      />
    </aside>
  );
}
