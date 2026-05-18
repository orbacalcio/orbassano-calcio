/**
 * Helper di costruzione JSON-LD (schema.org) per il sito. Niente
 * libreria esterna: oggetti puri inseriti via <script type="application/ld+json">
 * nel componente JsonLd.
 *
 * Convenzione: tutti i builder ritornano un singolo oggetto schema.org
 * o un array. La chiave `@context` e' `https://schema.org`. Per pagine
 * con piu' schemi (es. NewsArticle + BreadcrumbList) si renderizza
 * piu' volte JsonLd.
 */

const SITE_URL = "https://www.orbassanocalcio.com";

const SOCIAL_LINKS = [
  "https://www.instagram.com/asdorbassanocalcio/",
  "https://facebook.com/asdorbassanocalcio",
  "https://www.youtube.com/@OrbassanoCalcio/playlists",
  "https://www.tiktok.com/@asdorbassanocalcio",
  "https://www.threads.net/@asdorbassanocalcio",
];

export function buildOrganizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "@id": `${SITE_URL}#org`,
    name: "A.S.D. Orbassano Calcio",
    alternateName: ["Orbassano Calcio", "ASD Orbassano"],
    url: SITE_URL,
    logo: `${SITE_URL}/Logo_Orbassano_2K.png`,
    foundingDate: "1930",
    sport: "Calcio",
    email: "info@orbassanocalcio.com",
    telephone: "+39 327 779 3326",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Ignazio Silone, 4",
      addressLocality: "Orbassano",
      postalCode: "10043",
      addressRegion: "TO",
      addressCountry: "IT",
    },
    sameAs: SOCIAL_LINKS,
    taxID: "95634370019",
    vatID: "12100640015",
  };
}

export function buildSportsTeamLd(opts?: {
  slug?: string;
  name?: string;
  season?: string | null;
  league?: string | null;
}) {
  const slug = opts?.slug ?? "prima-squadra";
  const name = opts?.name ?? "Prima Squadra A.S.D. Orbassano Calcio";
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": `${SITE_URL}/squadre/${slug}#team`,
    name,
    sport: "Calcio",
    url: `${SITE_URL}/squadre/${slug}`,
    logo: `${SITE_URL}/Logo_Orbassano_2K.png`,
    parentOrganization: { "@id": `${SITE_URL}#org` },
    location: {
      "@type": "Place",
      name: "Centro Sportivo Aldo Porta",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Via Ignazio Silone, 4",
        addressLocality: "Orbassano",
        postalCode: "10043",
        addressCountry: "IT",
      },
    },
    ...(opts?.league
      ? {
          memberOf: {
            "@type": "SportsOrganization",
            name: opts.league,
          },
        }
      : {}),
    ...(opts?.season ? { description: `Stagione ${opts.season}` } : {}),
  };
}

/**
 * SportsEvent schema.org per una singola partita.
 *
 * - Per lo status finished aggiunge un block `result` con il punteggio
 * - Per postponed/cancelled valorizza `eventStatus` corrispondente
 * - awayTeam ha `@id` solo se opponentClub.websiteUrl valorizzato
 *   (no @id fake — vedi spec governance/calendar)
 *
 * Output unita' single. La pagina calendario chiama buildSportsEventListLd
 * per costruire l'array di tutti i match della stagione.
 */
type SportsEventOpts = {
  match: {
    _id: string;
    date: string;
    matchday: number | null;
    home: boolean;
    venue: string | null;
    status:
      | "scheduled"
      | "live"
      | "finished"
      | "postponed"
      | "cancelled"
      | null;
    scoreHome: number | null;
    scoreAway: number | null;
    isOpponentTbd: boolean | null;
    isDateTbd: boolean | null;
  };
  ourTeamSlug: string;
  ourTeamName: string;
  competition: {
    shortName: string | null;
    season: string | null;
    group: string | null;
  } | null;
  opponentName: string | null;
  opponentWebsite: string | null;
  venueAddress?: string | null;
};

const STATUS_TO_LD: Record<
  NonNullable<SportsEventOpts["match"]["status"]>,
  string
> = {
  scheduled: "https://schema.org/EventScheduled",
  live: "https://schema.org/EventScheduled",
  finished: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
  cancelled: "https://schema.org/EventCancelled",
};

export function buildSportsEventLd(opts: SportsEventOpts) {
  const { match, ourTeamSlug, ourTeamName, competition, opponentName, opponentWebsite } = opts;
  const opp = match.isOpponentTbd ? "Avversario da definire" : (opponentName ?? "Avversario");
  const homeTeamName = match.home ? ourTeamName : opp;
  const awayTeamName = match.home ? opp : ourTeamName;

  const result =
    match.status === "finished" &&
    typeof match.scoreHome === "number" &&
    typeof match.scoreAway === "number"
      ? {
          result: {
            "@type": "PropertyValue",
            name: "Risultato finale",
            value: `${match.scoreHome}-${match.scoreAway}`,
          },
        }
      : {};

  const description = [
    competition?.shortName,
    competition?.group ? `Girone ${competition.group}` : null,
    match.matchday ? `Giornata ${match.matchday}` : null,
    competition?.season,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `${SITE_URL}/squadre/${ourTeamSlug}/calendario#match-${match._id}`,
    name: `${homeTeamName} vs ${awayTeamName}`,
    description: description || undefined,
    startDate: match.date,
    eventStatus: STATUS_TO_LD[match.status ?? "scheduled"],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Calcio",
    location: {
      "@type": "Place",
      name: match.venue ?? (match.home ? "Centro Sportivo Aldo Porta" : opp),
      ...(opts.venueAddress
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: opts.venueAddress,
              addressCountry: "IT",
            },
          }
        : match.home
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: "Via Ignazio Silone, 4",
                addressLocality: "Orbassano",
                postalCode: "10043",
                addressCountry: "IT",
              },
            }
          : {}),
    },
    homeTeam: {
      "@type": "SportsTeam",
      ...(match.home
        ? { "@id": `${SITE_URL}/squadre/${ourTeamSlug}#team`, name: ourTeamName }
        : {
            name: opp,
            ...(opponentWebsite ? { "@id": `${opponentWebsite}#team` } : {}),
          }),
    },
    awayTeam: {
      "@type": "SportsTeam",
      ...(match.home
        ? {
            name: opp,
            ...(opponentWebsite ? { "@id": `${opponentWebsite}#team` } : {}),
          }
        : { "@id": `${SITE_URL}/squadre/${ourTeamSlug}#team`, name: ourTeamName }),
    },
    ...(competition?.shortName
      ? {
          organizer: {
            "@type": "SportsOrganization",
            name: competition.shortName,
          },
        }
      : {}),
    ...result,
  };
}

/**
 * Wrapper per renderizzare un array di SportsEvent in una sola
 * <JsonLd /> invece di N script separati. Usato dalla pagina
 * /squadre/[slug]/calendario.
 */
export function buildSportsEventListLd(events: SportsEventOpts[]) {
  return events.map(buildSportsEventLd);
}

export function buildWebsiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: "ASD Orbassano Calcio",
    inLanguage: "it-IT",
    publisher: { "@id": `${SITE_URL}#org` },
  };
}

export function buildBreadcrumbLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function buildNewsArticleLd(opts: {
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  publishedAt: string | null;
  author: string | null;
  category: string | null;
}) {
  const url = `${SITE_URL}/news/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: opts.title,
    description: opts.excerpt ?? undefined,
    image: opts.image ? [opts.image] : undefined,
    datePublished: opts.publishedAt ?? undefined,
    dateModified: opts.publishedAt ?? undefined,
    author: {
      "@type": "Organization",
      name: opts.author ?? "Redazione Orbassano Calcio",
    },
    publisher: {
      "@type": "Organization",
      name: "A.S.D. Orbassano Calcio",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/Logo_Orbassano_2K.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: opts.category ?? undefined,
    inLanguage: "it-IT",
  };
}

/**
 * Article generico (non NewsArticle) per pagine editoriali statiche
 * istituzionali. Usato dalla pagina /societa/codice-etico.
 */
export function buildArticleLd(opts: {
  title: string;
  url: string;
  description: string;
  datePublished: string | null;
  dateModified: string | null;
  version: string | null;
}) {
  const fullUrl = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${fullUrl}#article`,
    headline: opts.title,
    description: opts.description,
    url: fullUrl,
    datePublished: opts.datePublished ?? undefined,
    dateModified: opts.dateModified ?? opts.datePublished ?? undefined,
    author: {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: "A.S.D. Orbassano Calcio",
    },
    publisher: {
      "@type": "Organization",
      name: "A.S.D. Orbassano Calcio",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/Logo_Orbassano_2K.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": fullUrl },
    inLanguage: "it-IT",
    ...(opts.version ? { version: opts.version } : {}),
  };
}

export function buildPersonLd(opts: {
  firstName: string;
  lastName: string;
  slug: string;
  teamSlug: string;
  birthYear: number | null;
  role: string | null;
  nationality: string | null;
  photo: string | null;
}) {
  const url = `${SITE_URL}/squadre/${opts.teamSlug}/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: `${opts.firstName} ${opts.lastName}`,
    givenName: opts.firstName,
    familyName: opts.lastName,
    url,
    image: opts.photo ?? undefined,
    nationality: opts.nationality ?? undefined,
    birthDate: opts.birthYear ? `${opts.birthYear}` : undefined,
    jobTitle: opts.role ?? "Calciatore",
    memberOf: { "@id": `${SITE_URL}#org` },
  };
}

/**
 * Person schema per i dirigenti/staff club mostrati su
 * /societa/organigramma. A differenza di buildPersonLd (calciatori,
 * con URL slug-based), qui le persone non hanno una pagina dedicata:
 * il loro `@id` e' un anchor sulla pagina organigramma.
 *
 * `role` corrisponde al titolo ufficiale (es. "Presidente",
 * "Direttore Generale"). Schema.org Person.jobTitle accetta stringa
 * libera.
 *
 * Renderizzato come array sulla pagina organigramma per dare a
 * Google una mappa "people behind the org" — utile per knowledge
 * graph e per disambiguare ricerche tipo "presidente Orbassano Calcio".
 */
export function buildClubOfficialLd(opts: {
  fullName: string;
  role: string;
  title?: string | null;
}) {
  const anchor = opts.role
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const url = `${SITE_URL}/societa/organigramma`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#${anchor}`,
    name: opts.fullName,
    jobTitle: opts.title ?? opts.role,
    memberOf: { "@id": `${SITE_URL}#org` },
    worksFor: { "@id": `${SITE_URL}#org` },
    url,
  };
}

/**
 * SportsActivityLocation (sotto-tipo di Place + LocalBusiness) per
 * gli impianti sportivi del club. Renderizzato su
 * /societa/impianti — un JSON-LD per ogni Facility attiva.
 *
 * Schema critico per la SEO locale: Google lo usa per mostrare la
 * card "Centro Sportivo Aldo Porta" in Maps e nelle SERP locali
 * tipo "campo da calcio Orbassano". Senza questo schema, l'impianto
 * non e' geo-indicizzato.
 *
 * NB: le coordinate (geo) NON sono in CMS oggi. Per ora il club
 * principale "Aldo Porta" si appoggia all'address postale + mapsUrl;
 * Google e' bravo a risolvere coordinate dall'indirizzo. Se in
 * futuro servisse precisione (es. campo Mazzola con stesso indirizzo
 * civico ma corte diversa), aggiungere `latitude`/`longitude` allo
 * schema facility.
 */
export function buildSportsActivityLocationLd(opts: {
  name: string;
  address: string | null;
  mapsUrl: string | null;
  image: string | null;
  description: string | null;
  slug: string | null;
}) {
  // Parse address (es. "Via Ignazio Silone 4, 10043 Orbassano (TO)")
  // in PostalAddress strutturato. Fallback: address completo come
  // streetAddress se il parsing non e' affidabile.
  const parsed = parseItalianAddress(opts.address);
  const anchor = opts.slug ?? "impianto";
  const url = `${SITE_URL}/societa/impianti#${anchor}`;
  const sameAs: string[] = [];
  if (opts.mapsUrl) sameAs.push(opts.mapsUrl);
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": url,
    name: opts.name,
    description: opts.description ?? undefined,
    url,
    image: opts.image ?? `${SITE_URL}/Logo_Orbassano_2K.png`,
    address: parsed ?? {
      "@type": "PostalAddress",
      streetAddress: opts.address ?? "Via Ignazio Silone, 4",
      addressLocality: "Orbassano",
      postalCode: "10043",
      addressRegion: "TO",
      addressCountry: "IT",
    },
    telephone: "+39 327 779 3326",
    sport: "Calcio",
    parentOrganization: { "@id": `${SITE_URL}#org` },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

/**
 * Parser greedy per indirizzi italiani nel formato
 * "Via Foo 4, 10043 Orbassano (TO)" → PostalAddress strutturato.
 * Robusto su varianti comuni ma fallback a null se non matcha.
 */
function parseItalianAddress(addr: string | null): {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressRegion: string;
  addressCountry: "IT";
} | null {
  if (!addr) return null;
  // Pattern: <street>, <cap> <city> (<region>)
  const m = addr.match(
    /^(.+?),\s*(\d{5})\s+(.+?)\s*\(([A-Z]{2})\)\s*$/,
  );
  if (!m) return null;
  const [, street, cap, city, region] = m;
  return {
    "@type": "PostalAddress",
    streetAddress: street!.trim(),
    postalCode: cap!,
    addressLocality: city!.trim(),
    addressRegion: region!,
    addressCountry: "IT",
  };
}
