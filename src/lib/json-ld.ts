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
  "https://www.youtube.com/@OrbassanoCalcio",
  "https://www.threads.net/@asdorbassanocalcio",
  "https://twitter.com/orbassanocalcio",
  "https://www.tiktok.com/@asdorbassanocalcio",
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
