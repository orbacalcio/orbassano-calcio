import { sanityClient } from "./client";
import {
  activeFacilitySlugsQuery,
  activePartnersCountQuery,
  activeTeamSlugsQuery,
  allActiveSponsorsQuery,
  allNewsQuery,
  allNewsSlugsQuery,
  allPlayersForSitemapQuery,
  allTeamSlugsQuery,
  clubOfficialsQuery,
  facilitiesQuery,
  mainSponsorsQuery,
  matchesByTeamSlugQuery,
  newsBySlugQuery,
  playerBySlugQuery,
  settingsQuery,
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
  | "Juniores"
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
  group: string | null;
  groupOrder: number | null;
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

// ---------- News --------------------------------------------------------------------

export type NewsCategory =
  | "Prima Squadra"
  | "Settore Giovanile"
  | "Scuola Calcio"
  | "Società"
  | "Sponsor";

export type NewsSummary = {
  _id: string;
  title: string;
  slug: { current: string } | null;
  category: NewsCategory | null;
  publishedAt: string | null;
  excerpt: string | null;
  cover: string | null;
  coverLqip: string | null;
  isPinned: boolean | null;
  author?: string | null;
};

export type NewsGalleryImage = {
  url: string | null;
  lqip: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
};

export type NewsDetail = {
  _id: string;
  title: string;
  slug: string;
  category: NewsCategory | null;
  publishedAt: string | null;
  excerpt: string | null;
  cover: string | null;
  coverLqip: string | null;
  body: PortableTextBlock[] | null;
  gallery: NewsGalleryImage[] | null;
  author: string | null;
  isPinned: boolean | null;
};

export async function fetchAllNews(): Promise<NewsSummary[]> {
  try {
    const data = await sanityClient.fetch(
      allNewsQuery,
      {},
      { next: { tags: ["news"] } },
    );
    return (data ?? []) as NewsSummary[];
  } catch (err) {
    console.error("[fetchAllNews]", err);
    return [];
  }
}

export async function fetchNewsBySlug(
  slug: string,
): Promise<NewsDetail | null> {
  try {
    const data = await sanityClient.fetch(
      newsBySlugQuery,
      { slug },
      { next: { tags: ["news"] } },
    );
    return (data ?? null) as NewsDetail | null;
  } catch (err) {
    console.error("[fetchNewsBySlug]", { slug }, err);
    return null;
  }
}

export async function fetchAllNewsSlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch(
      allNewsSlugsQuery,
      {},
      { next: { tags: ["news"] } },
    );
    return ((data ?? []) as Array<{ slug: string }>)
      .map((s) => s.slug)
      .filter(Boolean);
  } catch (err) {
    console.error("[fetchAllNewsSlugs]", err);
    return [];
  }
}

export async function fetchAllTeamSlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch(
      allTeamSlugsQuery,
      {},
      { next: { tags: ["team"] } },
    );
    return ((data ?? []) as Array<{ slug: string }>)
      .map((s) => s.slug)
      .filter(Boolean);
  } catch (err) {
    console.error("[fetchAllTeamSlugs]", err);
    return [];
  }
}

export type PlayerSitemapEntry = {
  slug: string;
  teamSlug: string;
  _updatedAt: string;
};

export async function fetchAllPlayersForSitemap(): Promise<
  PlayerSitemapEntry[]
> {
  try {
    const data = await sanityClient.fetch(
      allPlayersForSitemapQuery,
      {},
      { next: { tags: ["player", "team"] } },
    );
    return (data ?? []) as PlayerSitemapEntry[];
  } catch (err) {
    console.error("[fetchAllPlayersForSitemap]", err);
    return [];
  }
}

// ---------- Sponsor (hub /sponsor + /sponsor/partner) -------------------------------

export type SponsorTier = "Main Sponsor" | "Official Sponsor" | "Corporate Partner";

export type SponsorSummary = {
  _id: string;
  name: string;
  website: string | null;
  logo: string | null;
  description: string | null;
};

export type PartnerSummary = SponsorSummary & {
  partnerBenefit: string | null;
  partnerBrochure: string | null;
};

export type ActiveSponsorsBundle = {
  main: SponsorSummary[];
  official: SponsorSummary[];
  partners: PartnerSummary[];
};

export async function fetchActiveSponsors(): Promise<ActiveSponsorsBundle> {
  try {
    const data = await sanityClient.fetch(
      allActiveSponsorsQuery,
      {},
      { next: { tags: ["sponsor"] } },
    );
    const result = (data ?? {}) as Partial<ActiveSponsorsBundle>;
    return {
      main: result.main ?? [],
      official: result.official ?? [],
      partners: result.partners ?? [],
    };
  } catch (err) {
    console.error("[fetchActiveSponsors]", err);
    return { main: [], official: [], partners: [] };
  }
}

/**
 * Slug delle squadre attive. Usato da drawer / footer / mappa per
 * nascondere link verso squadre disattivate (es. Scuola Calcio in
 * stand-by). Array invece di Set perche' va serializzato come prop
 * server → client (Set non e' serializzabile da Next).
 */
export async function fetchActiveTeamSlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch(
      activeTeamSlugsQuery,
      {},
      { next: { tags: ["team"] } },
    );
    return (data ?? []) as string[];
  } catch {
    return [];
  }
}

/**
 * Slug degli impianti attivi. Usato da impianti page per decidere
 * visibilita' di sezioni editorial (es. "Il Mazzola e i campioni"
 * CTA dipende dal Mazzola facility attivo).
 */
export async function fetchActiveFacilitySlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch(
      activeFacilitySlugsQuery,
      {},
      { next: { tags: ["facility"] } },
    );
    return (data ?? []) as string[];
  } catch {
    return [];
  }
}

/**
 * Helper leggero: ritorna true se esistono Corporate Partner attivi.
 * Usato da footer / sitemap / mappa-del-sito / pagina partner per
 * nascondere link e sezioni quando non c'è nulla da mostrare. Cache
 * tag "sponsor" in modo che il webhook revalidate aggiorni anche
 * questa info.
 */
export async function fetchHasActivePartners(): Promise<boolean> {
  try {
    const count = await sanityClient.fetch(
      activePartnersCountQuery,
      {},
      { next: { tags: ["sponsor"] } },
    );
    return typeof count === "number" && count > 0;
  } catch {
    return false;
  }
}

// ---------- Settings: storyNumbers (homepage) ---------------------------------------

export type StoryNumberItem = {
  value: number;
  prefix: string | null;
  suffix: string | null;
  label: string;
  caption: string | null;
};

export type StoryNumbersContent = {
  eyebrow: string | null;
  title: string | null;
  items: StoryNumberItem[];
};

export async function fetchStoryNumbers(): Promise<StoryNumbersContent> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    const settings = (data ?? {}) as {
      storyNumbersEyebrow?: string | null;
      storyNumbersTitle?: string | null;
      storyNumbersItems?: StoryNumberItem[] | null;
    };
    return {
      eyebrow: settings.storyNumbersEyebrow ?? null,
      title: settings.storyNumbersTitle ?? null,
      items: settings.storyNumbersItems ?? [],
    };
  } catch (err) {
    console.error("[fetchStoryNumbers]", err);
    return { eyebrow: null, title: null, items: [] };
  }
}

// ---------- Calendario / risultati partite (m5b) -----------------------------

export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export type MatchCompetitionCategory =
  | "championship"
  | "cup"
  | "tournament"
  | "playoff"
  | "friendly";

export type MatchCompetition = {
  slug: string | null;
  shortName: string | null;
  name: string | null;
  season: string | null;
  group: string | null;
  category: MatchCompetitionCategory | null;
  defaultReportLink: string | null;
  logo: string | null;
};

export type MatchOpponentClub = {
  _id: string;
  name: string | null;
  shortName: string | null;
  slug: string | null;
  logo: string | null;
  websiteUrl: string | null;
  tuttocampoUrl: string | null;
  primaryColor: string | null;
};

export type MatchSummary = {
  _id: string;
  date: string;
  matchday: number | null;
  home: boolean;
  venue: string | null;
  status: MatchStatus | null;
  scoreHome: number | null;
  scoreAway: number | null;
  reportLink: string | null;
  highlightsUrl: string | null;
  isOpponentTbd: boolean | null;
  isClosedDoors: boolean | null;
  isDateTbd: boolean | null;
  notes: string | null;
  competition: MatchCompetition | null;
  opponent: { club: MatchOpponentClub | null } | null;
};

/**
 * Tutte le partite di una squadra in una stagione, ordinate per data
 * ascendente. La pagina /squadre/[slug]/calendario filtra poi
 * client-side per tab (Prossime / Risultati / Tutte) + competition.
 *
 * @param slug    slug della squadra Orbassano (es. "prima-squadra")
 * @param season  stringa stagione (es. "2026/2027"). Da team.season
 *                con fallback a settings.currentSeason.
 */
export async function fetchMatchesByTeam(
  slug: string,
  season: string,
): Promise<MatchSummary[]> {
  try {
    const data = await sanityClient.fetch(
      matchesByTeamSlugQuery,
      { slug, season },
      { next: { tags: ["match"] } },
    );
    return (data ?? []) as MatchSummary[];
  } catch (err) {
    console.error("[fetchMatchesByTeam]", { slug, season }, err);
    return [];
  }
}
