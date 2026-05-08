import { sanityClient } from "./client";
import {
  mainSponsorsQuery,
  playerBySlugQuery,
  teamBySlugQuery,
  teamsByCategoryQuery,
  teamsListQuery,
} from "./queries";
import type { PortableTextBlock } from "@portabletext/react";

/**
 * Helper di fetch riusabili. Vivono in moduli server-only (lato AppShell
 * e pagine app/). Quando i tag matchano un webhook revalidate, Next 16
 * ricarica i tag e questi helper restituiscono dati freschi al prossimo
 * render del shell.
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

// ---------- Squadre ------------------------------------------------------------------

export type TeamCategory =
  | "Prima Squadra"
  | "Settore Giovanile"
  | "Scuola Calcio";

export type TeamSummary = {
  _id: string;
  name: string;
  slug: string;
  category: TeamCategory;
  subcategory: string | null;
  season: string | null;
  league: string | null;
  group: string | null;
  heroImage: string | null;
  playerCount: number;
};

export type StaffMember = {
  role: string;
  name: string;
  photo: string | null;
};

export type PlayerSummary = {
  _id: string;
  firstName: string;
  lastName: string;
  slug: string;
  birthYear: number | null;
  shirtNumber: number | null;
  role: string | null;
  foot: string | null;
  nationality: string | null;
  isCaptain: boolean | null;
  photo: string | null;
};

export type TeamDetail = {
  _id: string;
  name: string;
  slug: string;
  category: TeamCategory;
  subcategory: string | null;
  season: string | null;
  league: string | null;
  group: string | null;
  description: PortableTextBlock[] | null;
  heroImage: string | null;
  staff: StaffMember[] | null;
  players: PlayerSummary[];
};

export async function fetchTeamsList(): Promise<TeamSummary[]> {
  try {
    const data = await sanityClient.fetch(
      teamsListQuery,
      {},
      { next: { tags: ["team"] } },
    );
    return (data ?? []) as TeamSummary[];
  } catch {
    return [];
  }
}

export async function fetchTeamsByCategory(
  category: TeamCategory,
): Promise<TeamSummary[]> {
  try {
    const data = await sanityClient.fetch(
      teamsByCategoryQuery,
      { category },
      { next: { tags: ["team"] } },
    );
    return (data ?? []) as TeamSummary[];
  } catch {
    return [];
  }
}

export async function fetchTeamBySlug(
  slug: string,
): Promise<TeamDetail | null> {
  try {
    const data = await sanityClient.fetch(
      teamBySlugQuery,
      { slug },
      { next: { tags: ["team", "player"] } },
    );
    return (data ?? null) as TeamDetail | null;
  } catch {
    return null;
  }
}

// ---------- Giocatori ----------------------------------------------------------------

export type PlayerStats = {
  appearances?: number | null;
  goals?: number | null;
  assists?: number | null;
  yellowCards?: number | null;
  redCards?: number | null;
};

export type PlayerDetail = {
  _id: string;
  firstName: string;
  lastName: string;
  slug: string;
  birthYear: number | null;
  shirtNumber: number | null;
  role: string | null;
  foot: string | null;
  nationality: string | null;
  isCaptain: boolean | null;
  photo: string | null;
  photoAction: string | null;
  bio: PortableTextBlock[] | null;
  stats: PlayerStats | null;
  team: {
    _id: string;
    name: string;
    slug: string;
    category: TeamCategory;
    subcategory: string | null;
    season: string | null;
    league: string | null;
    group: string | null;
  } | null;
};

export async function fetchPlayerBySlug(
  slug: string,
): Promise<PlayerDetail | null> {
  try {
    const data = await sanityClient.fetch(
      playerBySlugQuery,
      { slug },
      { next: { tags: ["player"] } },
    );
    return (data ?? null) as PlayerDetail | null;
  } catch {
    return null;
  }
}
