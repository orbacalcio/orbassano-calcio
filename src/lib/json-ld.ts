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
  season?: string | null;
  league?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": `${SITE_URL}/squadre/prima-squadra#team`,
    name: "Prima Squadra A.S.D. Orbassano Calcio",
    sport: "Calcio",
    url: `${SITE_URL}/squadre/prima-squadra`,
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
