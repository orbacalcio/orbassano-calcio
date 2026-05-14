import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanityClient } from "@/sanity/client";

/**
 * Site search lato server. Riceve `?q=<termine>`, fa una GROQ
 * cumulativa su news / players / teams / sponsors e ritorna i
 * risultati raggruppati. Cap 8 risultati per gruppo per tenere il
 * payload leggero (la dialog mostra "vedi tutti" se servisse, in
 * futuro).
 *
 * Strategia di matching:
 * - Token splitting su whitespace
 * - Ogni token diventa un prefix-match GROQ (`token*`)
 * - Match operator e' case-insensitive nativamente
 * - Min 2 caratteri totali per evitare query rumorose ad ogni keystroke
 */
type SearchPayload = {
  q: string;
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

  try {
    const data = await sanityClient.fetch<Omit<SearchPayload, "q">>(
      QUERY,
      { expr },
      // Niente cache: la search deve essere live.
      { cache: "no-store" },
    );
    return NextResponse.json({ q, ...data });
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json(empty, { status: 200 });
  }
}
