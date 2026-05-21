import { sanityClient } from "@/sanity/client";
import { mainSponsorsQuery } from "@/sanity/queries";
import { MobileSponsorStripClient } from "./MobileSponsorStripClient";

/**
 * Mobile (<lg): striscia sponsor sticky a 56px sotto la topbar mobile.
 * Wrapper server: fetcha i main sponsor e delega rendering + auto-hide
 * allo scroll al MobileSponsorStripClient (client component).
 */
type Sponsor = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  logoMonochrome: string | null;
};

async function fetchMainSponsors(): Promise<Sponsor[]> {
  try {
    const data = await sanityClient.fetch(
      mainSponsorsQuery,
      {},
      { next: { tags: ["sponsor"] } },
    );
    return (data ?? []) as Sponsor[];
  } catch {
    return [];
  }
}

export async function MobileSponsorStrip() {
  const sponsors = await fetchMainSponsors();
  if (sponsors.length === 0) return null;
  return <MobileSponsorStripClient sponsors={sponsors} />;
}
