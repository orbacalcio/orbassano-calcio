import { sanityClient } from "./client";
import {
  clubOfficialsQuery,
  facilitiesQuery,
  mainSponsorsQuery,
  playerBySlugQuery,
  teamBySlugQuery,
  teamsByCategoryQuery,
  teamsListQuery,
  timelineEventsQuery,
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
  /** LQIP base64 (data:image/jpeg;base64,...) per blur placeholder. */
  heroImageLqip: string | null;
  playerCount: number;
};

export type StaffMember = {
  role: string;
  name: string;
  photo: string | null;
  photoLqip: string | null;
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
  photoLqip: string | null;
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
  heroImageLqip: string | null;
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
  } catch (err) {
    console.error("[fetchTeamsList]", err);
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
  } catch (err) {
    console.error("[fetchTeamsByCategory]", err);
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
  } catch (err) {
    console.error("[fetchTeamBySlug]", { slug }, err);
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
  photoLqip: string | null;
  photoAction: string | null;
  photoActionLqip: string | null;
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
  } catch (err) {
    console.error("[fetchPlayerBySlug]", { slug }, err);
    return null;
  }
}

// ---------- Societa: timeline, organigramma, impianti -------------------------------

export type TimelineCategory =
  | "Fondazione"
  | "Promozione"
  | "Trofeo"
  | "Fusione"
  | "Rifondazione"
  | "Storico";

export type TimelineEvent = {
  _id: string;
  year: number;
  season: string | null;
  title: string;
  category: TimelineCategory | null;
  isHighlight: boolean | null;
  description: PortableTextBlock[] | null;
  image: string | null;
  imageLqip: string | null;
};

export async function fetchTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    const data = await sanityClient.fetch(
      timelineEventsQuery,
      {},
      { next: { tags: ["timelineEvent"] } },
    );
    return (data ?? []) as TimelineEvent[];
  } catch (err) {
    console.error("[fetchTimelineEvents]", err);
    return [];
  }
}

export type ClubOfficial = {
  _id: string;
  role: string;
  fullName: string;
  title: string | null;
  photo: string | null;
  photoLqip: string | null;
};

export async function fetchClubOfficials(): Promise<ClubOfficial[]> {
  try {
    const data = await sanityClient.fetch(
      clubOfficialsQuery,
      {},
      { next: { tags: ["clubOfficial"] } },
    );
    return (data ?? []) as ClubOfficial[];
  } catch (err) {
    console.error("[fetchClubOfficials]", err);
    return [];
  }
}

export type FacilityImage = {
  url: string | null;
  lqip: string | null;
  alt: string | null;
};

export type Facility = {
  _id: string;
  name: string;
  slug: string | null;
  address: string | null;
  mapsUrl: string | null;
  description: PortableTextBlock[] | null;
  fields: string[] | null;
  gallery: FacilityImage[] | null;
};

export async function fetchFacilities(): Promise<Facility[]> {
  try {
    const data = await sanityClient.fetch(
      facilitiesQuery,
      {},
      { next: { tags: ["facility"] } },
    );
    return (data ?? []) as Facility[];
  } catch (err) {
    console.error("[fetchFacilities]", err);
    return [];
  }
}
