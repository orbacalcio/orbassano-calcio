import type { CSSProperties } from "react";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import type { MainSponsor } from "@/sanity/fetchers";

/**
 * Singola "tile" sponsor principale per la topbar (hero + scrolled).
 *
 * Razionale:
 * - **Proporzioni fisse**: ogni tile ha lo stesso bounding box (per
 *   default 196×78 hero, 168×48 scrolled), indipendentemente dalla
 *   forma del logo. La barra resta visivamente bilanciata anche se uno
 *   sponsor ha logo wide e un altro quadrato.
 * - **Sfondo bianco puro (#ffffff)**: i loghi sponsor sono pensati
 *   per stampe su materiale chiaro (maglia, banner stadio). Su navy
 *   del sito perdono saturazione: white tile li riporta al loro
 *   look originale, massima leggibilita'.
 * - **variant="color"**: rendiamo il logo a colori (non mono),
 *   coerente con il brand kit del singolo sponsor. Il fallback
 *   testuale usa `text-surface-0` per restare leggibile sul bianco.
 *
 * Hero default: tile 196×78, logo max-h 72px (≈ +20% vs marquee 60px).
 * Scrolled / shrink-end: tile 168×48, logo max-h 32px (compatto).
 *
 * I valori `width` e `logoMaxHeight` sono passati dal genitore per
 * permettere lo shrink-on-scroll della Topbar HERO (vedi Topbar.tsx,
 * useScrollShrink). Default scelti per matchare i valori HERO.
 */
type Props = {
  sponsor: MainSponsor;
  /** Larghezza tile in px. Default 196 (hero). 168 = compatto/scrolled. */
  width?: number;
  /** Altezza max logo in px. Default 72 (hero). 32 = compatto/scrolled. */
  logoMaxHeight?: number;
  /** Stile transition aggiuntivo (es. "width 450ms cubic-bezier..."),
   *  passato dalla Topbar per animare width/maxHeight tra HERO e SCROLLED. */
  transitionStyle?: CSSProperties;
};

export function MainSponsorTile({
  sponsor,
  width = 196,
  logoMaxHeight = 72,
  transitionStyle,
}: Props) {
  if (!sponsor.website) return null;
  return (
    <li className="flex h-full">
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`${sponsor.name} (sponsor principale)`}
        style={{ width: `${width}px`, ...transitionStyle }}
        className="group flex h-full items-center justify-center bg-white px-5"
      >
        {/* Lo zoom vive su questo wrapper, NON sulla SponsorLogo: quella
            ha un `transition` inline (shrink topbar) che sovrascriverebbe
            transition-transform rendendo lo scale a scatti. Qui niente
            conflitto → zoom morbido. */}
        <span className="flex items-center justify-center transition-transform duration-300 ease-out will-change-transform group-hover:scale-110">
          <SponsorLogo
            sponsor={sponsor}
            variant="color"
            width={300}
            height={Math.round(logoMaxHeight)}
            style={{ maxHeight: `${logoMaxHeight}px`, ...transitionStyle }}
            className="text-surface-0 max-w-full object-contain"
          />
        </span>
      </a>
    </li>
  );
}
