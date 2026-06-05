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

  // Lista duplicata per il loop marquee infinito (translateX -50% =
  // esattamente una copia, scorrimento senza salti).
  const reel = [...sponsors, ...sponsors];

  return (
    <div
      // Marquee orizzontale auto-scorrevole (stessa logica del marquee
      // sponsor in fondo alla home): con piu' di 2-3 sponsor su schermi
      // stretti la riga centrata debordava e tagliava primo/ultimo logo.
      // Ora i loghi scorrono in loop continuo. overflow-hidden clippa;
      // con prefers-reduced-motion l'animazione si ferma e la striscia
      // diventa scrollabile a mano (motion-reduce:overflow-x-auto).
      className="fixed inset-x-0 top-[55px] h-14 overflow-hidden border-b border-black/10 bg-white transition-transform duration-300 [scrollbar-width:none] motion-reduce:overflow-x-auto xl:hidden [&::-webkit-scrollbar]:hidden"
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
      {/* Sfumature ai bordi: i loghi entrano/escono in dissolvenza invece
          di apparire tagliati di netto. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent"
      />
      <ul
        className="flex h-full w-max items-center gap-10 motion-safe:animate-[marquee-sponsor_25s_linear_infinite] hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        {reel.map((s, i) => {
          const logo = (
            <SponsorLogo
              sponsor={s}
              variant="color"
              width={200}
              height={64}
              className="font-display text-surface-0 h-8 w-auto text-base font-bold tracking-[0.02em]"
            />
          );
          return (
            <li key={`${s._id}-${i}`} className="flex shrink-0 items-center">
              {s.website ? (
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.name} (sponsor principale)`}
                  // tabIndex=-1 perche' il <ul> parent ha aria-hidden=true
                  // (marquee decorativo per AT, la lista accessibile vive
                  // nel <ul className="sr-only"> sotto). Senza tabIndex
                  // gli a sarebbero focusabili da Tab ma invisibili a
                  // screen reader.
                  tabIndex={-1}
                  className="block"
                >
                  {logo}
                </a>
              ) : (
                logo
              )}
            </li>
          );
        })}
      </ul>
      {/* Lista accessibile coi nomi reali (non duplicati). */}
      <ul className="sr-only">
        {sponsors.map((s) => (
          <li key={s._id}>{s.name}</li>
        ))}
      </ul>
      <style>{`
        @keyframes marquee-sponsor {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
