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
    heroSlideDuration,
    heroTransitionDuration,
    heroAutoplayEnabled,
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

// Slide attive del carosello hero. Ogni slide porta il proprio set
// testuale (eyebrow / headline / subhead / ctaLabel / ctaLink) per
// il pattern editoriale juventus.com: l'overlay testuale cambia in
// sincrono con l'immagine. I sotto-elementi vuoti vengono nascosti
// dal componente HeroCarousel (rendering condizionale).
export const heroSlidesQuery = defineQuery(`
  *[_type == "heroSlide" && isActive == true] | order(order asc){
    _id,
    title,
    alt,
    credits,
    "image": image.asset->url,
    "imageLqip": image.asset->metadata.lqip,
    eyebrow,
    headline,
    subhead,
    ctaLabel,
    ctaLink,
    customDuration
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

// Tutte le squadre per /squadre (indice). playerCount usato per
// l'etichetta sulla card; lo Scuola Calcio ne avra' 0 finche' non
// vengono tesserati i piccoli (gestiti da Sporting Orbassano).
export const teamsListQuery = defineQuery(`
  *[_type == "team"] | order(coalesce(order, 99) asc){
    _id,
    name,
    "slug": slug.current,
    category,
    subcategory,
    season,
    league,
    group,
    "heroImage": heroImage.asset->url,
    "heroImageLqip": heroImage.asset->metadata.lqip,
    "playerCount": count(*[_type == "player" && references(^._id)])
  }
`);

// Squadre filtrate per categoria (slug speciale /squadre/settore-giovanile).
export const teamsByCategoryQuery = defineQuery(`
  *[_type == "team" && category == $category]
  | order(coalesce(order, 99) asc){
    _id,
    name,
    "slug": slug.current,
    subcategory,
    season,
    league,
    group,
    "heroImage": heroImage.asset->url,
    "heroImageLqip": heroImage.asset->metadata.lqip,
    "playerCount": count(*[_type == "player" && references(^._id)])
  }
`);

// Singola squadra: rosa joinata + staff con foto risolte. Ordinamento
// rosa: numero di maglia crescente (con coalesce 99 per chi non ne ha
// ancora uno assegnato), poi cognome A→Z come fallback stabile.
export const teamBySlugQuery = defineQuery(`
  *[_type == "team" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    category,
    subcategory,
    season,
    league,
    group,
    description,
    "heroImage": heroImage.asset->url,
    "heroImageLqip": heroImage.asset->metadata.lqip,
    staff[]{
      role,
      name,
      "photo": photo.asset->url,
      "photoLqip": photo.asset->metadata.lqip
    },
    "players": *[_type == "player" && references(^._id)]
      | order(coalesce(shirtNumber, 99) asc, lastName asc){
        _id,
        firstName,
        lastName,
        "slug": slug.current,
        birthYear,
        shirtNumber,
        role,
        foot,
        nationality,
        isCaptain,
        "photo": photo.asset->url,
        "photoLqip": photo.asset->metadata.lqip
      }
  }
`);

// Eventi storici per la timeline /societa/storia. Ordinati per anno
// crescente (1930 → oggi). La descrizione e' PortableText opzionale,
// la categoria pilota i filtri client. `_id` serve come key React.
export const timelineEventsQuery = defineQuery(`
  *[_type == "timelineEvent"] | order(year asc, _createdAt asc){
    _id,
    year,
    season,
    title,
    category,
    isHighlight,
    description,
    "image": image.asset->url,
    "imageLqip": image.asset->metadata.lqip
  }
`);

// Organigramma societario — ordinati per il campo `order`. Foto
// opzionali (per ora non caricate, fallback iniziali sulla card).
export const clubOfficialsQuery = defineQuery(`
  *[_type == "clubOfficial"] | order(coalesce(order, 99) asc){
    _id,
    role,
    fullName,
    title,
    "photo": photo.asset->url,
    "photoLqip": photo.asset->metadata.lqip
  }
`);

// Impianti del club — ordinati per il campo `order`. Gallery opzionale
// risolta come array di url + alt-text + lqip, pronta per <Image>.
export const facilitiesQuery = defineQuery(`
  *[_type == "facility"] | order(coalesce(order, 99) asc){
    _id,
    name,
    "slug": slug.current,
    address,
    mapsUrl,
    description,
    fields,
    "gallery": gallery[]{
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`);

// Scheda giocatore + riferimento alla squadra (per breadcrumb e link).
export const playerBySlugQuery = defineQuery(`
  *[_type == "player" && slug.current == $slug][0]{
    _id,
    firstName,
    lastName,
    "slug": slug.current,
    birthYear,
    shirtNumber,
    role,
    foot,
    nationality,
    isCaptain,
    "photo": photo.asset->url,
    "photoLqip": photo.asset->metadata.lqip,
    "photoAction": photoAction.asset->url,
    "photoActionLqip": photoAction.asset->metadata.lqip,
    bio,
    stats,
    team->{
      _id,
      name,
      "slug": slug.current,
      category,
      subcategory,
      season,
      league,
      group
    }
  }
`);
