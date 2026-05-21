"use client";

import { useRouter } from "next/navigation";
import { FilterSelect } from "@/components/ui/FilterSelect";

/**
 * Selettore stagione a tendina per le pagine calendario (richiesta
 * utente 2026-05-21: tutti i filtri del sito a tendina). Sostituisce le
 * pill <Link> con una select che naviga via query string `?season=`.
 *
 * La stagione "in corso" (`resetSeason`) punta al path base senza query
 * (canonical), le altre a `?season=...`. Richiede JS attivo: la
 * selezione non e' piu' un set di link statici ma un onChange con
 * router.push.
 */
export function SeasonSelect({
  basePath,
  seasons,
  selectedSeason,
  resetSeason,
}: {
  basePath: string;
  seasons: string[];
  selectedSeason: string;
  resetSeason: string;
}) {
  const router = useRouter();

  function go(value: string) {
    const href =
      value === resetSeason
        ? basePath
        : `${basePath}?season=${encodeURIComponent(value)}`;
    router.push(href);
  }

  return (
    <FilterSelect
      id="stagione-filter"
      label="Stagione"
      value={selectedSeason}
      onChange={go}
      options={seasons.map((s) => ({ value: s, label: s }))}
    />
  );
}
