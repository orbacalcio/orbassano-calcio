import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanityClient } from "@/sanity/client";

/**
 * Site search lato server. Riceve `?q=<termine>`, fa una GROQ
 * cumulativa su news / players / teams / sponsors + filtra in-memory
 * un indice di pagine statiche (5x1000, settore giovanile, contatti,
 * legale, ecc.) cosi' anche le pagine senza document Sanity sono
 * cercabili. Risultati raggruppati per tipo. Cap 8 risultati per
 * gruppo per tenere il payload leggero.
 *
 * Strategia di matching:
 * - Token splitting su whitespace
 * - GROQ: ogni token diventa un prefix-match (`token*`),
 *   case-insensitive nativamente
 * - Static pages: AND tra token (tutti devono matchare keywords),
 *   case-insensitive via toLowerCase
 * - Min 2 caratteri totali per evitare query rumorose ad ogni keystroke
 */
type SearchPayload = {
  q: string;
  pages: Array<{
    id: string;
    title: string;
    path: string;
    section: string;
  }>;
  news: Array<{
    _id: string;
    title: string;
    slug: string;
    category: string | null;
    excerpt: string | null;
    publishedAt: string | null;
  }>;
  players: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    slug: string;
    teamSlug: string | null;
    role: string | null;
  }>;
  teams: Array<{
    _id: string;
    name: string;
    slug: string;
    category: string | null;
  }>;
  sponsors: Array<{
    _id: string;
    name: string;
    tier: string | null;
    website: string | null;
  }>;
};

/**
 * Indice in-memoria delle pagine statiche del sito che non hanno un
 * document Sanity dedicato. `keywords` raccoglie sinonimi e alias per
 * intercettare ricerche varie (es. "5x1000", "cinquepermille",
 * "donazione" → tutte risolvono alla stessa pagina /5x1000).
 *
 * Quando aggiungi una nuova pagina al sito, ricordati di aggiungerla
 * qui altrimenti non sara' cercabile. Convenzione: tieni titoli
 * concisi (max 25 char) e keywords ricche (sinonimi, varianti
 * grafia, parole-tema correlate).
 */
type StaticPage = {
  id: string;
  title: string;
  path: string;
  keywords: string;
  section: string;
};

const STATIC_PAGES: StaticPage[] = [
  // Sostieni il club
  {
    id: "5x1000",
    title: "5×1000",
    path: "/5x1000",
    keywords:
      "5x1000 5×1000 cinque per mille cinquepermille donazione donare codice fiscale CF beneficio fiscale dichiarazione redditi sostieni vivaio",
    section: "Sostieni il club",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    path: "/newsletter",
    keywords:
      "newsletter iscrizione email mail aggiornamenti comunicazioni novita registrazione",
    section: "Comunicazioni",
  },
  // Squadre / Settore Giovanile
  {
    id: "settore-giovanile",
    title: "Settore Giovanile",
    path: "/squadre/settore-giovanile",
    keywords:
      "settore giovanile scolastico under 14 15 16 17 ragazzi vivaio bambini scuola calcio sgs categorie",
    section: "Squadre",
  },
  {
    id: "open-days",
    title: "Open Days",
    path: "/settore-giovanile/open-days",
    keywords:
      "open days giornate aperte prova iscrizione bambini settore giovanile modulo scuola calcio provini",
    section: "Settore Giovanile",
  },
  {
    id: "tornei",
    title: "Tornei",
    path: "/settore-giovanile/tornei",
    keywords:
      "tornei competizioni settore giovanile sgs gare appuntamenti manifestazioni",
    section: "Settore Giovanile",
  },
  // Società
  {
    id: "societa",
    title: "Società",
    path: "/societa",
    keywords:
      "societa orbassano calcio asd associazione club panoramica chi siamo",
    section: "Società",
  },
  {
    id: "storia",
    title: "Storia",
    path: "/societa/storia",
    keywords:
      "storia 1930 fondazione rossoblù rossoblu origini cronologia anni novanta cento",
    section: "Società",
  },
  {
    id: "organigramma",
    title: "Organigramma",
    path: "/societa/organigramma",
    keywords:
      "organigramma direttivo presidente vicepresidente consiglio cariche ruoli dirigenza staff",
    section: "Società",
  },
  {
    id: "impianti",
    title: "Impianti sportivi",
    path: "/societa/impianti",
    keywords:
      "impianti sportivi mazzola campo stadio strutture sede centro sportivo aldo porta via silone",
    section: "Società",
  },
  {
    id: "biglietteria",
    title: "Biglietteria",
    path: "/societa/biglietteria",
    keywords:
      "biglietteria biglietti ingresso partite tariffe abbonamenti prezzi accesso",
    section: "Società",
  },
  // Sponsor
  {
    id: "sponsor",
    title: "Sponsor",
    path: "/sponsor",
    keywords:
      "sponsor partner aziende collaborazioni supporto sostenitori main official",
    section: "Sostieni il club",
  },
  {
    id: "sponsor-partner",
    title: "Partner",
    path: "/sponsor/partner",
    keywords:
      "partner corporate sostenitori aziende collaboratori imprese fornitori",
    section: "Sostieni il club",
  },
  {
    id: "diventa-sponsor",
    title: "Diventa sponsor",
    path: "/sponsor/opportunita",
    keywords:
      "diventa sponsor opportunita opportunità collaborazione visibilita pacchetti commerciali brand",
    section: "Sostieni il club",
  },
  // Media
  {
    id: "gallery",
    title: "Gallery",
    path: "/gallery",
    keywords: "gallery foto galleria immagini scatti album media fotografie",
    section: "Media",
  },
  {
    id: "news",
    title: "Tutte le news",
    path: "/news",
    keywords:
      "news notizie articoli ultime aggiornamenti archivio storia recente",
    section: "Comunicazioni",
  },
  // Contatti / Info
  {
    id: "contatti",
    title: "Contatti",
    path: "/contatti",
    keywords:
      "contatti telefono email indirizzo info informazioni mappa dove segreteria pec",
    section: "Informazioni",
  },
  // Governance
  {
    id: "codice-etico",
    title: "Codice Etico",
    path: "/societa/codice-etico",
    keywords:
      "codice etico valori comportamento principi morale regolamento condotta",
    section: "Governance",
  },
  {
    id: "segnalazioni",
    title: "Segnalazioni",
    path: "/societa/segnalazioni",
    keywords:
      "segnalazioni whistleblowing denuncia anonima irregolarita compliance illeciti",
    section: "Governance",
  },
  // Legale
  {
    id: "privacy",
    title: "Privacy Policy",
    path: "/legal/privacy",
    keywords:
      "privacy policy gdpr dati personali trattamento informativa cookie",
    section: "Legale",
  },
  {
    id: "cookie",
    title: "Cookie Policy",
    path: "/legal/cookie",
    keywords:
      "cookie policy tracker tecnici analitici profilazione consenso",
    section: "Legale",
  },
  {
    id: "termini",
    title: "Termini",
    path: "/legal/termini",
    keywords: "termini condizioni uso sito disclaimer responsabilita",
    section: "Legale",
  },
  // Navigazione
  {
    id: "mappa",
    title: "Mappa del sito",
    path: "/mappa-del-sito",
    keywords:
      "mappa sito sitemap navigazione tutte pagine indice elenco",
    section: "Navigazione",
  },
];

function searchStaticPages(q: string, max = 8): StaticPage[] {
  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 1);
  if (tokens.length === 0) return [];
  return STATIC_PAGES.filter((p) => {
    const haystack = `${p.title} ${p.keywords} ${p.section}`.toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  }).slice(0, max);
}

function buildMatchExpr(q: string): string {
  return q
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 1)
    .map((t) => `${t}*`)
    .join(" ");
}

const QUERY = `{
  "news": *[_type == "news" && (title match $expr || excerpt match $expr)]
    | order(publishedAt desc)[0...8]{
      _id, title, "slug": slug.current, category, excerpt, publishedAt
    },
  "players": *[_type == "player" && (firstName match $expr || lastName match $expr) && team->isActive != false]
    | order(lastName asc)[0...8]{
      _id, firstName, lastName, "slug": slug.current,
      "teamSlug": team->slug.current, role
    },
  "teams": *[_type == "team" && name match $expr && isActive != false]
    | order(coalesce(order, 99) asc)[0...8]{
      _id, name, "slug": slug.current, category
    },
  "sponsors": *[_type == "sponsor" && isActive == true && name match $expr]
    | order(tier asc, coalesce(order, 99) asc)[0...8]{
      _id, name, tier, website
    }
}`;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const empty: SearchPayload = {
    q,
    pages: [],
    news: [],
    players: [],
    teams: [],
    sponsors: [],
  };

  if (q.length < 2) {
    return NextResponse.json(empty);
  }

  // Rate limit per evitare scraping massivo + bruciare quota Sanity.
  // 30 req/min/IP copre usi legittimi (anche typeahead aggressivo),
  // ferma bot. La SearchDialog debounce 250ms → ~4 req/sec max in UI.
  const rl = checkRateLimit({
    req,
    bucket: "search",
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(empty, {
      status: 429,
      headers: { "retry-after": String(rl.retryAfter) },
    });
  }

  const expr = buildMatchExpr(q);
  if (!expr) return NextResponse.json(empty);

  // Static pages: filtro in-memoria parallelo al GROQ Sanity. Anche
  // se Sanity fallisce, le pagine statiche restano sempre cercabili.
  const pages = searchStaticPages(q);

  try {
    const data = await sanityClient.fetch<
      Omit<SearchPayload, "q" | "pages">
    >(
      QUERY,
      { expr },
      // Niente cache: la search deve essere live.
      { cache: "no-store" },
    );
    return NextResponse.json({ q, pages, ...data });
  } catch (err) {
    console.error("[api/search]", err);
    // Anche con Sanity down restituiamo le pagine statiche: utile per
    // utenti che cercano "5x1000" o "contatti" — non li lasciamo a vuoto.
    return NextResponse.json({ ...empty, pages }, { status: 200 });
  }
}
