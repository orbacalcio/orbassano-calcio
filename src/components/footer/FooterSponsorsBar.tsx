import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { Container } from "@/components/ui/Container";
import { fetchFooterSponsors, type MainSponsor } from "@/sanity/fetchers";

/**
 * Barra sponsor istituzionale del footer (modello juventus.com).
 *
 * Va sopra le colonne di footer-nav e sopra il copyright, su tutte
 * le pagine. Layout:
 *
 * - Desktop ≥1024px: flex justify-between, Main a sx (loghi 80px,
 *   gap 32px) / Official a dx (loghi 48px, gap 24px).
 * - Tablet 640-1023px: stack centrato, Main su prima riga e
 *   Official su seconda con eventuale wrap.
 * - Mobile <640px: stack verticale, Main h-12 (3 loghi su una riga
 *   se entrano), Official h-10 con flex-wrap (2-3 loghi per riga).
 *
 * I Corporate Partner sono volutamente esclusi: sono accordi di
 * benefit per i tesserati, vivono nella loro pagina dedicata
 * /sponsor/partner. Qui parliamo solo di sponsor di visibilita'.
 *
 * Edge case:
 * - Cluster vuoto → cluster non renderizzato (lo spazio viene
 *   ridistribuito dal flex-justify-between).
 * - Entrambi vuoti → componente ritorna null e il footer si chiude
 *   senza la barra.
 */

export async function FooterSponsorsBar() {
  const { main, official } = await fetchFooterSponsors();
  const hasMain = main.length > 0;
  const hasOfficial = official.length > 0;
  if (!hasMain && !hasOfficial) return null;

  return (
    <section
      aria-label="Sponsor istituzionali"
      className="border-border/60 border-b"
    >
      <Container size="wide" className="py-12 lg:py-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between lg:gap-8">
          {hasMain && (
            <SponsorCluster
              sponsors={main}
              tier="Main Sponsor"
              ariaLabelSuffix="sponsor principale"
              clusterClassName="lg:justify-start lg:gap-8"
              gap="gap-6 lg:gap-8"
              logoSize={{ width: 200, height: 80 }}
              logoClassName="h-12 w-auto lg:h-20"
            />
          )}
          {hasOfficial && (
            <SponsorCluster
              sponsors={official}
              tier="Official Sponsor"
              ariaLabelSuffix="official sponsor"
              clusterClassName="lg:justify-end lg:gap-6"
              gap="gap-4 lg:gap-6"
              logoSize={{ width: 120, height: 50 }}
              logoClassName="h-10 w-auto lg:h-12"
            />
          )}
        </div>
      </Container>
    </section>
  );
}

type ClusterProps = {
  sponsors: MainSponsor[];
  tier: string;
  ariaLabelSuffix: string;
  clusterClassName: string;
  gap: string;
  logoSize: { width: number; height: number };
  logoClassName: string;
};

function SponsorCluster({
  sponsors,
  tier,
  ariaLabelSuffix,
  clusterClassName,
  gap,
  logoSize,
  logoClassName,
}: ClusterProps) {
  return (
    <ul
      aria-label={tier}
      className={`flex flex-wrap items-center justify-center ${gap} ${clusterClassName}`}
    >
      {sponsors.map((s) => {
        if (!s.website) return null;
        return (
          <li key={s._id} className="shrink-0">
            <a
              href={s.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.name} (${ariaLabelSuffix})`}
              className="block opacity-90 transition-opacity hover:opacity-100"
            >
              <SponsorLogo
                sponsor={s}
                variant="mono"
                width={logoSize.width}
                height={logoSize.height}
                className={logoClassName}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
