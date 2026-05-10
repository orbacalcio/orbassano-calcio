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
 * Dimensioni: tile 196×78 (w×h), logo max-h-[72px] (≈ +20% vs i
 * loghi del marquee in homepage che sono 60px). Scelta richiesta dal
 * Direttivo: il main sponsor in alto deve essere visivamente piu'
 * prominente del ticker scorrevole in basso, perche' rappresenta i
 * partner di primo livello (top tier) — ma senza occupare un terzo
 * di viewport in altezza (proporzioni del 10/05/2026 ridotte del 30%).
 *
 * Larghezza scala linearmente col numero di sponsor (3 = 588px,
 * 4 = 784px). A lg+ ci sta con 3-4 sponsor, a xl+ anche 5, lasciando
 * spazio a divider + search + sidebar 88px.
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
        className="flex h-full w-[196px] items-center justify-center bg-white px-5 transition-opacity hover:opacity-90"
      >
        <SponsorLogo
          sponsor={sponsor}
          variant="color"
          width={300}
          height={72}
          className="text-surface-0 max-h-[72px] max-w-full object-contain"
        />
      </a>
    </li>
  );
}
