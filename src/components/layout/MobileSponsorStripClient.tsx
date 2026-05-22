"use client";

import { useEffect, useRef, useState } from "react";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { Z } from "@/lib/z-indexes";

type Sponsor = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  logoMonochrome: string | null;
};

/**
 * Striscia sponsor mobile (<lg): banda BIANCA sotto la topbar con i
 * main sponsor a COLORI, centrati. Si nasconde scorrendo verso il
 * basso (piu' spazio di lettura) e ricompare scorrendo verso l'alto o
 * vicino al top della pagina. Client component perche' serve la
 * direzione dello scroll.
 *
 * Altezza 56px (h-14): il padding-top del main (AppShell) e l'offset
 * negativo dell'hero sono tarati su 55px (topbar) + 56px = 111px. Se
 * cambi l'altezza qui o quella della topbar, aggiorna pt-[111px] in
 * AppShell e -mt-[111px] in Hero.
 *
 * Bianco: i loghi sponsor sono pensati per fondo chiaro (stesso
 * pattern del marquee desktop, vedi SponsorMarquee). Il fallback
 * testuale di SponsorLogo viene scurito (text-surface-0) per restare
 * leggibile sul bianco.
 */
export function MobileSponsorStripClient({
  sponsors,
}: {
  sponsors: Sponsor[];
}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      // Vicino al top: sempre visibile. Altrimenti: giu' = nascondi,
      // su = mostra. Soglia 6px per evitare jitter su micro-scroll.
      if (y < 80) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -6) setHidden(false);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-[55px] flex h-14 items-center justify-center gap-6 border-b border-black/10 bg-white px-4 transition-transform duration-300 lg:hidden"
      style={{
        zIndex: Z.mobileSponsorStrip,
        // -100% (altezza) - 55px (offset top-[55px]) = fuori schermo,
        // dietro/oltre la topbar.
        transform: hidden
          ? "translateY(calc(-100% - 55px))"
          : "translateY(0)",
      }}
      role="region"
      aria-label="Sponsor principali"
      aria-hidden={hidden}
    >
      {sponsors.map((s) => {
        const logo = (
          <SponsorLogo
            sponsor={s}
            variant="color"
            width={200}
            height={64}
            className="font-display text-surface-0 h-8 w-auto text-base font-bold tracking-[0.02em]"
          />
        );
        return s.website ? (
          <a
            key={s._id}
            href={s.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.name} (sponsor principale)`}
            className="shrink-0"
          >
            {logo}
          </a>
        ) : (
          <span key={s._id} className="shrink-0">
            {logo}
          </span>
        );
      })}
    </div>
  );
}
