import { sanityClient } from "./client";
import { mainSponsorsQuery } from "./queries";

/**
 * Helper di fetch riusabili. Vivono in moduli server-only (lato AppShell).
 * Quando i tag matchano un webhook revalidate, Next 16 ricarica i tag e
 * questi helper restituiscono dati freschi al prossimo render del shell.
 */

export type MainSponsor = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  logoMonochrome: string | null;
};

export async function fetchMainSponsors(): Promise<MainSponsor[]> {
  try {
    const data = await sanityClient.fetch(
      mainSponsorsQuery,
      {},
      { next: { tags: ["sponsor"] } },
    );
    return (data ?? []) as MainSponsor[];
  } catch {
    return [];
  }
}
