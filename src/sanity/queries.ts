import { defineQuery } from "next-sanity";

/**
 * Query GROQ tipizzate. Tutte usano `defineQuery` per essere catturate
 * da `sanity typegen` (lo aggiungeremo in M2 per generare automaticamente
 * i tipi dei result in `src/sanity/types.gen.ts`).
 *
 * Convenzione: ogni query e' associata a un cache tag (vedi M1.4 webhook
 * /api/revalidate) che corrisponde al `_type` del document principale.
 */

// Settings globali (singleton)
export const settingsQuery = defineQuery(`
  *[_type == "settings"][0]{
    siteTitle,
    tagline,
    currentSeason,
    currentLeague,
    currentGroup,
    social,
    sprintsportLinks,
    contactInfo,
    legalInfo,
    "defaultOgImage": defaultOgImage.asset->url
  }
`);

// Main sponsor attivi per la topbar (1-5 elementi dinamici)
export const mainSponsorsQuery = defineQuery(`
  *[_type == "sponsor" && tier == "Main Sponsor" && isActive == true]
  | order(order asc)[0...5]{
    _id,
    name,
    website,
    "logo": logo.asset->url,
    "logoMonochrome": logoMonochrome.asset->url
  }
`);

// Tutti gli sponsor attivi raggruppati per tier
export const allActiveSponsorsQuery = defineQuery(`
  {
    "main": *[_type == "sponsor" && tier == "Main Sponsor" && isActive == true] | order(order asc){
      _id, name, website, "logo": logo.asset->url, description
    },
    "official": *[_type == "sponsor" && tier == "Official Sponsor" && isActive == true] | order(order asc){
      _id, name, website, "logo": logo.asset->url, description
    },
    "partners": *[_type == "sponsor" && tier == "Corporate Partner" && isActive == true] | order(order asc){
      _id, name, website, "logo": logo.asset->url, description, partnerBenefit,
      "partnerBrochure": partnerBrochure.asset->url
    }
  }
`);

// Slide attive del carosello hero
export const heroSlidesQuery = defineQuery(`
  *[_type == "heroSlide" && isActive == true] | order(order asc){
    _id,
    title,
    alt,
    credits,
    "image": image.asset->url
  }
`);

// Prossima partita per il ticker
export const nextMatchQuery = defineQuery(`
  *[_type == "match" && status == "scheduled" && date > now()]
  | order(date asc)[0]{
    _id, date, opponent, home, venue,
    "opponentLogo": opponentLogo.asset->url
  }
`);

// Ultime news per la homepage
export const latestNewsQuery = defineQuery(`
  *[_type == "news"] | order(publishedAt desc, isPinned desc)[0...4]{
    _id,
    title,
    slug,
    category,
    publishedAt,
    excerpt,
    "cover": cover.asset->url,
    isPinned
  }
`);

// Rosa prima squadra
export const firstTeamSquadQuery = defineQuery(`
  *[_type == "player" && team->slug.current == "prima-squadra"]
  | order(coalesce(shirtNumber, 99) asc, lastName asc){
    _id,
    firstName,
    lastName,
    "slug": slug.current,
    birthYear,
    shirtNumber,
    role,
    foot,
    isCaptain,
    "photo": photo.asset->url
  }
`);
