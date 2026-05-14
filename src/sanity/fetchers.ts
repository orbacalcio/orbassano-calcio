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
  galleriesPaginatedQuery,
  galleriesTotalCountQuery,
  galleryBySlugQuery,
  allGallerySlugsQuery,
  lastMatchesByTeamSlugsQuery,
  mainSponsorsQuery,
  matchesByTeamSlugQuery,
  nextMatchesByTeamSlugsQuery,
  newsBySlugQuery,
  playerBySlugQuery,
  riferimentiOperativiQuery,
  settingsQuery,
  teamBySlugQuery,
  teamSeasonsListQuery,
  teamsByCategoryQuery,
  teamsListQuery,
  timelineEventsQuery,
  trasparenza5x1000Query,
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
  | "Retrocessione"
  | "Trofeo"
  | "Fusione"
  | "Rifondazione"
  | "Storico";

export type TimelineEvent = {
  _id: string;
  year: number;
  /** Anno di fine periodo pluri-annuale (es. 1985-1992). Mutualmente
   *  esclusivo con `season`. Quando popolato, il display mostra il
   *  range `year - yearEnd` invece del solo `year`. */
  yearEnd: number | null;
  season: string | null;
  /** Override manuale dell'ordinamento. Quando valorizzato, sostituisce
   *  l'effective year calcolato dalla logica automatica. Permette
   *  posizionamento fine (decimale ammesso, es. 1991.5). */
  manualOrder: number | null;
  title: string;
  category: TimelineCategory | null;
  isHighlight: boolean | null;
  description: PortableTextBlock[] | null;
  /** URL esterno di approfondimento (Wikipedia, La Stampa, video).
   *  Render in card come bottone "Approfondisci" target=_blank. */
  externalLink: string | null;
  image: string | null;
  imageLqip: string | null;
};

/**
 * Anno effettivo per l'ordinamento timeline. Quattro casi (in ordine
 * di priorita'):
 *
 *  0) Evento con `manualOrder` (OVERRIDE manuale dell'admin):
 *     effective year = manualOrder. Decimali ammessi (es. 1991.5) per
 *     forzare posizioni intermedie senza toccare gli altri eventi.
 *
 *  1) Evento con `yearEnd` (PERIODO pluri-annuale, es. 1985-1992):
 *     effective year = yearEnd. Il periodo si chiude in quell'anno.
 *
 *  2) Evento con `season` (singola stagione, es. 2005-2006):
 *     effective year = secondo anno della stagione.
 *
 *  3) Evento PURO: effective year = year.
 *
 * Tie-breaker a parita' di effective year applicato in fetchTimelineEvents
 * (stagione > periodo > puro). manualOrder bypassa anche il tie-breaker
 * se due eventi hanno valori manualOrder diversi.
 */
function effectiveTimelineYear(event: TimelineEvent): number {
  if (typeof event.manualOrder === "number") return event.manualOrder;
  if (typeof event.yearEnd === "number") return event.yearEnd;
  if (event.season) {
    const matches = Array.from(event.season.matchAll(/(\d{4})/g));
    const endStr = matches[1]?.[1] ?? matches[0]?.[1];
    const parsed = endStr ? parseInt(endStr, 10) : Number.NaN;
    if (!Number.isNaN(parsed)) return parsed;
  }
  return event.year;
}

/**
 * Priorita' tie-breaker a parita' di effective year. Valore piu' BASSO
 * = posizione piu' alta nella lista. Logica cronologica:
 *
 *  0 = stagione (finisce a maggio/giugno dell'anno X)
 *  1 = periodo  (finisce piu' avanti nell'anno X, es. fine stagione del
 *                periodo + transizione estiva)
 *  2 = evento puro (luglio/agosto/oltre dell'anno X)
 *
 * Es. year=1992 con: stagione 1991-1992, periodo 1985-1992, evento puro
 * "Cambio denominazione 1992" -> ordine 1) stagione, 2) periodo,
 * 3) evento puro.
 */
function tieBreakerPriority(event: TimelineEvent): number {
  if (event.season) return 0;
  if (typeof event.yearEnd === "number") return 1;
  return 2;
}

export async function fetchTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    const data = await sanityClient.fetch(
      timelineEventsQuery,
      {},
      { next: { tags: ["timelineEvent"] } },
    );
    const items = (data ?? []) as TimelineEvent[];
    // Re-sort lato server come safety net (vedi commento su
    // effectiveTimelineYear). Con dati corretti dalla migration
    // 11/05/2026 e validation di schema, questo passaggio e' un
    // no-op rispetto al sort GROQ `order(year asc)`.
    return [...items]
      .map((event, originalIndex) => ({ event, originalIndex }))
      .sort((a, b) => {
        const ay = effectiveTimelineYear(a.event);
        const by = effectiveTimelineYear(b.event);
        if (ay !== by) return ay - by;
        // Tie-breaker 3 livelli: stagione (0) < periodo (1) < puro (2).
        // Vedi commento su tieBreakerPriority per la logica cronologica.
        const ap = tieBreakerPriority(a.event);
        const bp = tieBreakerPriority(b.event);
        if (ap !== bp) return ap - bp;
        return a.originalIndex - b.originalIndex;
      })
      .map(({ event }) => event);
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
  originalArticleUrl: string | null;
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

// ---------- Governance: Riferimenti operativi (Codice Etico All. B) ----------

export type DirettivoMember = {
  ruolo:
    | "Presidente"
    | "Vice-Presidente"
    | "Segretario"
    | "Tesoriere"
    | "Consigliere"
    | null;
  nome: string | null;
  email: string | null;
  delega: string | null;
};

export type RuoloOperativo = {
  nome: string | null;
  email: string | null;
};

export type SafeguardingResponsabile = RuoloOperativo & {
  inCarica: boolean | null;
  telefono: string | null;
};

export type CodiceEticoArchivioEntry = {
  versione: string | null;
  approvatoIl: string | null;
  sostituitoIl: string | null;
  pdf: string | null;
  note: string | null;
};

export type RiferimentiOperativi = {
  sedeLegale: string | null;
  codiceFiscale: string | null;
  partitaIva: string | null;
  affiliazioneFigc: string | null;
  emailSegreteria: string | null;
  direttivo: DirettivoMember[] | null;
  responsabileSafeguarding: SafeguardingResponsabile | null;
  referenteData: RuoloOperativo | null;
  responsabileGiovanile: RuoloOperativo | null;
  responsabilePrimaSquadra: RuoloOperativo | null;
  emailSegnalazioni: string | null;
  codiceEticoVersione: string | null;
  codiceEticoApprovatoIl: string | null;
  codiceEticoInVigoreDal: string | null;
  codiceEticoPdfUrl: string | null;
  codiceEticoArchivio: CodiceEticoArchivioEntry[] | null;
  ultimoAggiornamento: string | null;
};

export async function fetchRiferimentiOperativi(): Promise<RiferimentiOperativi | null> {
  try {
    const data = await sanityClient.fetch(
      riferimentiOperativiQuery,
      {},
      { next: { tags: ["riferimentiOperativi"] } },
    );
    return (data ?? null) as RiferimentiOperativi | null;
  } catch (err) {
    console.error("[fetchRiferimentiOperativi]", err);
    return null;
  }
}

// ---------- Governance: Rendicontazione 5x1000 -------------------------------

export type DestinazioneVoce = {
  voce: string | null;
  importo: number | null;
  descrizione: string | null;
};

export type Trasparenza5x1000Year = {
  _id: string;
  anno: number;
  importoRicevuto: number | null;
  numeroFirme: number | null;
  destinazione: DestinazioneVoce[] | null;
  documentazione: Array<{ url: string | null }> | null;
  note: string | null;
};

export async function fetchTrasparenza5x1000(): Promise<Trasparenza5x1000Year[]> {
  try {
    const data = await sanityClient.fetch(
      trasparenza5x1000Query,
      {},
      { next: { tags: ["trasparenza5x1000"] } },
    );
    return (data ?? []) as Trasparenza5x1000Year[];
  } catch (err) {
    console.error("[fetchTrasparenza5x1000]", err);
    return [];
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
  externalRankingUrl: string | null;
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
/**
 * Lista stagioni disponibili per una squadra (distinct su
 * competition.season). Ordinate desc — la prima e' la piu' recente.
 * Vuoto se la squadra non ha competition.
 */
export async function fetchTeamSeasons(slug: string): Promise<string[]> {
  try {
    const data = await sanityClient.fetch(
      teamSeasonsListQuery,
      { slug },
      { next: { tags: ["competition"] } },
    );
    return Array.isArray(data) ? (data as string[]) : [];
  } catch (err) {
    console.error("[fetchTeamSeasons]", { slug }, err);
    return [];
  }
}

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

// ---------- Gallery (album foto) ---------------------------------------------

export type GalleryCategory =
  | "match"
  | "training"
  | "event"
  | "youth"
  | "team"
  | "archive";

export type SanityImageRef = {
  _type?: "image";
  asset?: { _ref?: string; _type?: string };
  hotspot?: { x: number; y: number; height: number; width: number } | null;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
};

export type GalleryCard = {
  _id: string;
  title: string;
  slug: string;
  uploadedAt: string;
  category: GalleryCategory | null;
  coverImage: SanityImageRef | null;
  coverAlt: string | null;
  imagesCount: number;
};

export type GalleryImageItem = SanityImageRef & {
  _key: string;
  alt: string | null;
  caption: string | null;
};

export type GalleryDetail = {
  _id: string;
  title: string;
  slug: string;
  uploadedAt: string;
  category: GalleryCategory | null;
  coverImage: SanityImageRef | null;
  coverAlt: string | null;
  images: GalleryImageItem[];
};

/**
 * Index gallerie paginato: 20 alla volta per default (offset 0/20/40...).
 * Usato sia dal server (pagina /news/gallery initial batch) sia dal
 * Server Action `loadMoreGalleries` per i batch successivi.
 */
export async function fetchGalleries(
  offset = 0,
  limit = 20,
): Promise<GalleryCard[]> {
  try {
    const data = await sanityClient.fetch(
      galleriesPaginatedQuery,
      { start: offset, end: offset + limit },
      { next: { tags: ["gallery"] } },
    );
    return (data ?? []) as GalleryCard[];
  } catch (err) {
    console.error("[fetchGalleries]", { offset, limit }, err);
    return [];
  }
}

export async function fetchGalleriesTotalCount(): Promise<number> {
  try {
    const data = await sanityClient.fetch(
      galleriesTotalCountQuery,
      {},
      { next: { tags: ["gallery"] } },
    );
    return typeof data === "number" ? data : 0;
  } catch (err) {
    console.error("[fetchGalleriesTotalCount]", err);
    return 0;
  }
}

export async function fetchGalleryBySlug(
  slug: string,
): Promise<GalleryDetail | null> {
  try {
    const data = await sanityClient.fetch(
      galleryBySlugQuery,
      { slug },
      { next: { tags: ["gallery"] } },
    );
    return (data ?? null) as GalleryDetail | null;
  } catch (err) {
    console.error("[fetchGalleryBySlug]", { slug }, err);
    return null;
  }
}

export async function fetchAllGallerySlugs(): Promise<string[]> {
  try {
    const data = await sanityClient.fetch(
      allGallerySlugsQuery,
      {},
      { next: { tags: ["gallery"] } },
    );
    return (data ?? []) as string[];
  } catch (err) {
    console.error("[fetchAllGallerySlugs]", err);
    return [];
  }
}

// ---------- Strip homepage: prossime partite per team slug -------------------

/**
 * Payload alleggerito (vs MatchSummary): solo i campi che servono alla
 * mini-strip Settore Giovanile in homepage. Score/reportLink esclusi
 * (sempre scheduled), riportiamo invece teamSlug per raggruppare lato
 * server.
 */
export type YouthNextMatch = {
  _id: string;
  date: string;
  home: boolean;
  isOpponentTbd: boolean | null;
  isDateTbd: boolean | null;
  teamSlug: string | null;
  competition: {
    shortName: string | null;
    name: string | null;
    group: string | null;
    season: string | null;
    defaultReportLink: string | null;
    externalRankingUrl: string | null;
  } | null;
  opponent: { club: MatchOpponentClub | null } | null;
};

/**
 * Per ognuno degli slug richiesti ritorna la PROSSIMA partita scheduled
 * (data > now), o null se nessuna in calendario. Mantiene l'ordine
 * degli slug passati.
 */
export async function fetchNextMatchesByTeamSlugs(
  slugs: string[],
): Promise<Array<{ slug: string; match: YouthNextMatch | null }>> {
  if (slugs.length === 0) return [];
  try {
    const data = (await sanityClient.fetch(
      nextMatchesByTeamSlugsQuery,
      { slugs },
      { next: { tags: ["match"] } },
    )) as YouthNextMatch[];
    return slugs.map((slug) => ({
      slug,
      match: data.find((m) => m.teamSlug === slug) ?? null,
    }));
  } catch (err) {
    console.error("[fetchNextMatchesByTeamSlugs]", { slugs }, err);
    return slugs.map((slug) => ({ slug, match: null }));
  }
}

/**
 * Per ognuno degli slug richiesti ritorna l'ULTIMA partita finished
 * (ordinata per data desc), o null se nessuna giocata in archivio.
 * Estende YouthNextMatch con scoreHome/scoreAway/reportLink per
 * renderizzare il tag risultato V/X/P sulla card homepage.
 */
export type YouthLastMatch = YouthNextMatch & {
  scoreHome: number | null;
  scoreAway: number | null;
  reportLink: string | null;
};

export async function fetchLastMatchesByTeamSlugs(
  slugs: string[],
): Promise<Array<{ slug: string; match: YouthLastMatch | null }>> {
  if (slugs.length === 0) return [];
  try {
    const data = (await sanityClient.fetch(
      lastMatchesByTeamSlugsQuery,
      { slugs },
      { next: { tags: ["match"] } },
    )) as YouthLastMatch[];
    return slugs.map((slug) => ({
      slug,
      match: data.find((m) => m.teamSlug === slug) ?? null,
    }));
  } catch (err) {
    console.error("[fetchLastMatchesByTeamSlugs]", { slugs }, err);
    return slugs.map((slug) => ({ slug, match: null }));
  }
}
