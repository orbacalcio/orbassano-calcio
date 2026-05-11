import { defineQuery } from "next-sanity";

/**
 * Query GROQ tipizzate. Tutte usano `defineQuery` per essere catturate
 * da `sanity typegen` (lo aggiungeremo in M2 per generare automaticamente
 * i tipi dei result in `src/sanity/types.gen.ts`).
 *
 * Convenzione: ogni query e' associata a un cache tag (vedi M1.4 webhook
 * /api/revalidate) che corrisponde al `_type` del document principale.
 */

// Riferimenti operativi (Codice Etico Allegato B) - singleton.
// NB: NON include alcun campo del singleton "segnalazione" (privato,
// mai esposto pubblicamente). Vedi commento in segnalazione.ts.
export const riferimentiOperativiQuery = defineQuery(`
  *[_type == "riferimentiOperativi"][0]{
    sedeLegale,
    codiceFiscale,
    partitaIva,
    affiliazioneFigc,
    emailSegreteria,
    "direttivo": direttivo[]{
      ruolo,
      nome,
      email,
      delega
    },
    responsabileSafeguarding,
    referenteData,
    responsabileGiovanile,
    responsabilePrimaSquadra,
    emailSegnalazioni,
    codiceEticoVersione,
    codiceEticoApprovatoIl,
    codiceEticoInVigoreDal,
    "codiceEticoPdfUrl": codiceEticoPdfUrl.asset->url,
    "codiceEticoArchivio": codiceEticoArchivio[]{
      versione,
      approvatoIl,
      sostituitoIl,
      "pdf": pdf.asset->url,
      note
    },
    ultimoAggiornamento
  }
`);

// Gallerie fotografiche — index paginato. Slice [start..end] per
// "Carica altre 20" senza scaricare tutti i record. Ordinamento:
// ordering desc (pin manuale) poi uploadedAt desc (cronologico).
// `imagesCount` per il badge numero foto nel mosaic — count(images)
// e' O(N) ma resta veloce su pochi album. coverImage.asset->url
// pre-risolto per next/image.
export const galleriesPaginatedQuery = defineQuery(`
  *[_type == "gallery" && defined(slug.current)]
    | order(coalesce(ordering, 0) desc, uploadedAt desc)
    [$start...$end]{
      _id,
      title,
      "slug": slug.current,
      uploadedAt,
      category,
      coverImage,
      coverAlt,
      "imagesCount": count(images)
    }
`);

// Conteggio totale gallerie per UX 'altri X disponibili' e per
// nascondere il pulsante 'Carica altre' a fine paginazione.
export const galleriesTotalCountQuery = defineQuery(`
  count(*[_type == "gallery" && defined(slug.current)])
`);

// Singolo album per /news/gallery/[slug]. Asset reference completi
// con metadata + alt per il viewer.
export const galleryBySlugQuery = defineQuery(`
  *[_type == "gallery" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    uploadedAt,
    category,
    coverImage,
    coverAlt,
    "images": images[]{
      _key,
      asset,
      hotspot,
      crop,
      alt,
      caption
    }
  }
`);

// Tutti gli slug per generateStaticParams su /news/gallery/[slug].
export const allGallerySlugsQuery = defineQuery(`
  *[_type == "gallery" && defined(slug.current)].slug.current
`);

// Rendicontazione 5x1000 - tutti gli anni, ordinati discendenti.
export const trasparenza5x1000Query = defineQuery(`
  *[_type == "trasparenza5x1000"] | order(anno desc){
    _id,
    anno,
    importoRicevuto,
    numeroFirme,
    "destinazione": destinazione[]{ voce, importo, descrizione },
    "documentazione": documentazione[]{ "url": asset->url },
    note
  }
`);

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
    storyNumbersEyebrow,
    storyNumbersTitle,
    "storyNumbersItems": storyNumbersItems[]{
      value, prefix, suffix, label, caption
    },
    teamsCardsEyebrow,
    teamsCardsTitle,
    teamsCardsSubtitle,
    "teamsCardsItems": teamsCardsItems[]{
      title, description
    },
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

// Conteggio rapido dei Corporate Partner attivi: usato da footer,
// sitemap, mappa-del-sito e dalla page /sponsor/partner per
// nascondere il link/sezione/pagina quando non ci sono partner.
// Ritorna direttamente un numero (count) — payload minimo.
export const activePartnersCountQuery = defineQuery(`
  count(*[_type == "sponsor" && tier == "Corporate Partner" && isActive == true])
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

// Tutte le partite di una squadra in una stagione, ordinate cronologicamente.
// Filtro `competition->season` (post-refactor m5a la stagione vive su
// competition, non sul match). Cache tag "match": webhook revalidate
// ricarica al cambio di un match nello Studio.
//
// Payload completo per MatchCard: data/status/score/flag + dereferenza
// competition (per badge tab + categoria + defaultReportLink fallback) +
// dereferenza opponent.club (logo, sito ufficiale, hyperlink card).
export const matchesByTeamSlugQuery = defineQuery(`
  *[_type == "match"
    && team->slug.current == $slug
    && competition->season == $season]
  | order(date asc){
    _id,
    date,
    matchday,
    home,
    venue,
    status,
    scoreHome,
    scoreAway,
    reportLink,
    highlightsUrl,
    isOpponentTbd,
    isClosedDoors,
    isDateTbd,
    notes,
    "competition": competition->{
      "slug": slug.current,
      shortName,
      name,
      season,
      group,
      category,
      defaultReportLink,
      externalRankingUrl,
      "logo": logo.asset->url
    },
    "opponent": opponent->{
      "club": club->{
        _id,
        name,
        shortName,
        "slug": slug.current,
        "logo": logo.asset->url,
        websiteUrl,
        tuttocampoUrl,
        primaryColor
      }
    }
  }
`);

// Prossime partite per un set di team slug (Juniores + Under 14/15/16/17
// per la strip Settore Giovanile homepage). Una sola query con `in $slugs`
// invece di 5 chiamate parallele. Ordinata per data crescente; lato server
// si prende il primo match per ogni slug. Payload alleggerito rispetto a
// matchesByTeamSlugQuery (no scoreHome/Away, no reportLink, no flag rari).
export const nextMatchesByTeamSlugsQuery = defineQuery(`
  *[_type == "match"
    && team->slug.current in $slugs
    && status == "scheduled"
    && date > now()]
  | order(date asc){
    _id,
    date,
    home,
    isOpponentTbd,
    isDateTbd,
    "teamSlug": team->slug.current,
    "competition": competition->{
      shortName,
      name,
      group,
      season,
      defaultReportLink,
      externalRankingUrl
    },
    "opponent": opponent->{
      "club": club->{
        _id,
        name,
        shortName,
        "slug": slug.current,
        "logo": logo.asset->url,
        primaryColor
      }
    }
  }
`);

// Prossima partita Prima Squadra per il MatchStrip homepage. Stesso
// payload di matchesByTeamSlugQuery (per riusare MatchCard compact).
export const nextMatchQuery = defineQuery(`
  *[_type == "match"
    && team->slug.current == "prima-squadra"
    && status == "scheduled"
    && date > now()]
  | order(date asc)[0]{
    _id,
    date,
    matchday,
    home,
    venue,
    status,
    scoreHome,
    scoreAway,
    reportLink,
    highlightsUrl,
    isOpponentTbd,
    isClosedDoors,
    isDateTbd,
    notes,
    "competition": competition->{
      "slug": slug.current,
      shortName,
      name,
      season,
      group,
      category,
      defaultReportLink,
      externalRankingUrl,
      "logo": logo.asset->url
    },
    "opponent": opponent->{
      "club": club->{
        _id,
        name,
        shortName,
        "slug": slug.current,
        "logo": logo.asset->url,
        websiteUrl,
        tuttocampoUrl,
        primaryColor
      }
    }
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
    "coverLqip": cover.asset->metadata.lqip,
    isPinned
  }
`);

// Archivio /news — tutte le news pubblicate (no paginazione: con
// volumi di un club di Promozione bastano <100 articoli/anno).
// Le pinned salgono in cima.
export const allNewsQuery = defineQuery(`
  *[_type == "news"] | order(isPinned desc, publishedAt desc){
    _id,
    title,
    slug,
    category,
    publishedAt,
    excerpt,
    "cover": cover.asset->url,
    "coverLqip": cover.asset->metadata.lqip,
    isPinned,
    author
  }
`);

// Dettaglio articolo. Body PortableText con eventuali immagini inline +
// gallery dedicata (max 3 foto extra) renderizzata col lightbox client.
export const newsBySlugQuery = defineQuery(`
  *[_type == "news" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    category,
    publishedAt,
    excerpt,
    "cover": cover.asset->url,
    "coverLqip": cover.asset->metadata.lqip,
    body,
    "gallery": gallery[]{
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      alt,
      caption
    },
    author,
    isPinned
  }
`);

// Slugs per generateStaticParams.
export const allNewsSlugsQuery = defineQuery(`
  *[_type == "news" && defined(slug.current)]{ "slug": slug.current }
`);

// Slug delle squadre (per sitemap). Filtro isActive: niente squadre
// disattivate (la pagina dedicata ritornerebbe 404 → dead-end crawler).
export const allTeamSlugsQuery = defineQuery(`
  *[_type == "team" && defined(slug.current) && isActive != false]{
    "slug": slug.current
  }
`);

// Set di slug delle squadre attive — usato da drawer/footer/mappa
// per nascondere link di squadre disattivate. Payload minimo (solo
// slug), tag "team" per cache.
export const activeTeamSlugsQuery = defineQuery(`
  *[_type == "team" && defined(slug.current) && isActive != false].slug.current
`);

// Slug degli impianti attivi (sezione /societa/impianti + decisione
// hide della sezione "Il Mazzola e i campioni" sull'impianti page).
export const activeFacilitySlugsQuery = defineQuery(`
  *[_type == "facility" && defined(slug.current) && isActive != false].slug.current
`);

// Tutti i giocatori con riferimento alla loro squadra (per sitemap
// /squadre/[teamSlug]/[playerSlug]). Filtra fuori i record privi di
// slug o di reference team.
export const allPlayersForSitemapQuery = defineQuery(`
  *[_type == "player" && defined(slug.current) && defined(team->slug.current)]{
    "slug": slug.current,
    "teamSlug": team->slug.current,
    _updatedAt
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
// Filtro `isActive != false`: documenti senza il campo (legacy) o
// con true sono visibili; solo `false` esplicito li nasconde.
export const teamsListQuery = defineQuery(`
  *[_type == "team" && isActive != false] | order(coalesce(order, 99) asc){
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
  *[_type == "team" && category == $category && isActive != false]
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
  *[_type == "team" && slug.current == $slug && isActive != false][0]{
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
    yearEnd,
    season,
    manualOrder,
    title,
    category,
    isHighlight,
    description,
    "image": image.asset->url,
    "imageLqip": image.asset->metadata.lqip
  }
`);

// Organigramma societario — ordinati per `order` (posizione DENTRO la
// riga). L'ordine VERTICALE delle righe e' deciso dal campo
// `groupOrder` lato page (groupOfficials), che fa min() per gruppo.
// Filtro `isActive != false`: include i documenti senza il campo
// (legacy, pre-introduzione del toggle) come attivi; esclude solo
// quelli esplicitamente disattivati dall'admin.
export const clubOfficialsQuery = defineQuery(`
  *[_type == "clubOfficial" && isActive != false] | order(coalesce(order, 99) asc){
    _id,
    role,
    fullName,
    title,
    group,
    groupOrder
  }
`);

// Impianti del club — ordinati per il campo `order`. Gallery opzionale
// risolta come array di url + alt-text + lqip, pronta per <Image>.
// Filtro isActive: impianti disattivati (es. Mazzola in stand-by) sono
// nascosti dalla pagina /societa/impianti.
export const facilitiesQuery = defineQuery(`
  *[_type == "facility" && isActive != false] | order(coalesce(order, 99) asc){
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
