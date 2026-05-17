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
 * - **Sfondo light-bg-0**: stesso bianco-grigio della banda news
 *   (#f2f4f8) per continuita' visiva tra header e sezioni di contenuto.
 *   I loghi sponsor sono pensati per stampe su materiale chiaro
 *   (maglia, banner stadio), questo sfondo li riporta vicino al
 *   look originale mantenendo coerenza col resto del sito.
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
        className="bg-light-bg-0 flex h-full items-center justify-center px-5 hover:opacity-90"
      >
        <SponsorLogo
          sponsor={sponsor}
          variant="color"
          width={300}
          height={Math.round(logoMaxHeight)}
          style={{ maxHeight: `${logoMaxHeight}px`, ...transitionStyle }}
          className="text-surface-0 max-w-full object-contain"
        />
      </a>
    </li>
  );
}
