import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import type { MainSponsor } from "@/sanity/fetchers";

/**
 * Singola "tile" sponsor principale per la topbar (hero + scrolled).
 *
 * Razionale:
 * - **Proporzioni fisse**: ogni tile ha lo stesso bounding box
 *   (`w-[168px] h-12`), indipendentemente dalla forma del logo.
 *   Cosi' la barra resta visivamente bilanciata anche se uno
 *   sponsor ha logo wide e un altro quadrato.
 * - **Sfondo bianco di default**: i loghi sponsor sono pensati per
 *   stampe su materiale chiaro (maglia, banner stadio). Su navy del
 *   sito perdono saturazione: white tile li riporta al loro look
 *   originale, massima leggibilita'.
 * - **variant="color"**: rendiamo il logo a colori (non mono),
 *   coerente con il brand kit del singolo sponsor. Il fallback
 *   testuale usa `text-surface-0` per restare leggibile sul bianco.
 *
 * Larghezza scala linearmente col numero di sponsor (3 = 504px,
 * 4 = 672px, 5 = 840px). A lg+ ci sta con 3-4 sponsor, a xl+ anche 5,
 * lasciando spazio a divider + search + sidebar 88px.
 */
type Props = { sponsor: MainSponsor };

export function MainSponsorTile({ sponsor }: Props) {
  if (!sponsor.website) return null;
  return (
    <li className="flex h-full">
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`${sponsor.name} (sponsor principale)`}
        className="flex h-full w-[168px] items-center justify-center bg-white px-4 transition-opacity hover:opacity-90"
      >
        <SponsorLogo
          sponsor={sponsor}
          variant="color"
          width={200}
          height={32}
          className="text-surface-0 max-h-8 max-w-full object-contain"
        />
      </a>
    </li>
  );
}
