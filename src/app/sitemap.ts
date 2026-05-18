import type { MetadataRoute } from "next";
import {
  fetchAllGallerySlugs,
  fetchAllNewsSlugs,
  fetchAllPlayersForSitemap,
  fetchAllTeamSlugs,
  fetchHasActivePartners,
} from "@/sanity/fetchers";
import { FEATURES } from "@/lib/features";

/**
 * Sitemap dinamico in formato Next 16 (object-based, niente XML
 * manuale). Combinazione di:
 * - URL statiche (homepage, sezioni info, legal)
 * - URL dinamiche da Sanity (news, squadre, players)
 *
 * Submit a Google Search Console post-deploy puntando a
 * https://www.orbassanocalcio.com/sitemap.xml.
 *
 * `changeFrequency` e `priority` sono hint, non garanzie. Strategia:
 * - homepage / news index: weekly
 * - news detail: monthly (immutabili dopo pubblicazione)
 * - squadre / squadre[slug]: weekly (rosa cambia)
 * - societa / impianti / sponsor: monthly
 * - legal: yearly (modifiche rare)
 */

const SITE_URL = "https://www.orbassanocalcio.com";

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/news", changeFrequency: "weekly", priority: 0.9 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/squadre", changeFrequency: "weekly", priority: 0.9 },
  // /squadre/settore-giovanile e' una vista categoria (hub SGS con
  // 4 card U14-U17 + Open Days/Tornei + modulo iscrizione), non
  // mappata da teamSlugs (non corrisponde a uno slug team).
  { path: "/squadre/settore-giovanile", changeFrequency: "weekly", priority: 0.8 },
  // Calendario aggregato Settore Giovanile (raggruppa match U14-U17).
  // Le pagine /squadre/under-XX/calendario singole esistono ancora ma
  // sono ESCLUSE dal calendarEntries dinamico sotto (richiesta utente
  // 2026-05-17: il calendario SG vive solo sulla pagina aggregata).
  { path: "/squadre/settore-giovanile/calendario", changeFrequency: "weekly", priority: 0.7 },
  // /calendario esiste ma rimossa dal sitemap 2026-05-17 (richiesta
  // utente): hub aggregato non utile, gli accordion drawer linkano
  // direttamente ai calendari per categoria.
  { path: "/settore-giovanile/open-days", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tornei", changeFrequency: "monthly", priority: 0.6 },
  { path: "/societa", changeFrequency: "monthly", priority: 0.7 },
  { path: "/societa/storia", changeFrequency: "monthly", priority: 0.7 },
  { path: "/societa/organigramma", changeFrequency: "monthly", priority: 0.6 },
  { path: "/societa/impianti", changeFrequency: "monthly", priority: 0.6 },
  { path: "/societa/biglietteria", changeFrequency: "monthly", priority: 0.6 },
  { path: "/sponsor", changeFrequency: "monthly", priority: 0.7 },
  { path: "/sponsor/opportunita", changeFrequency: "monthly", priority: 0.7 },
  { path: "/5x1000", changeFrequency: "monthly", priority: 0.6 },
  // /newsletter esiste ancora ma rimossa dal sitemap 2026-05-17
  // (richiesta utente): non vogliamo indicizzarla, il box newsletter
  // in fondo a ogni pagina copre la subscription.
  { path: "/contatti", changeFrequency: "yearly", priority: 0.6 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/cookie", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/termini", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch dinamico in parallelo. Errori → array vuoti, non bloccano la
  // generazione del sitemap statico (i fetcher gia' loggano e ritornano [])
  const [newsSlugs, teamSlugs, players, hasPartners, gallerySlugs] =
    await Promise.all([
      fetchAllNewsSlugs(),
      fetchAllTeamSlugs(),
      fetchAllPlayersForSitemap(),
      fetchHasActivePartners(),
      fetchAllGallerySlugs(),
    ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const newsEntries: MetadataRoute.Sitemap = newsSlugs.map((slug) => ({
    url: `${SITE_URL}/news/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const galleryEntries: MetadataRoute.Sitemap = gallerySlugs.map((slug) => ({
    url: `${SITE_URL}/gallery/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const teamEntries: MetadataRoute.Sitemap = teamSlugs.map((slug) => ({
    url: `${SITE_URL}/squadre/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // /squadre/[slug]/calendario per ogni squadra attiva. Crawler-friendly:
  // anche se la lista match e' vuota, la pagina renderizza l'empty state
  // editoriale, niente 404.
  // Eccezione: le squadre del Settore Giovanile (under-XX) NON vengono
  // pubblicate qui — il calendario SG vive nella pagina aggregata
  // /squadre/settore-giovanile/calendario (gia' inclusa in STATIC_ROUTES).
  const SG_TEAM_SLUGS = new Set([
    "under-14",
    "under-15",
    "under-16",
    "under-17",
  ]);
  const calendarEntries: MetadataRoute.Sitemap = teamSlugs
    .filter((slug) => !SG_TEAM_SLUGS.has(slug))
    .map((slug) => ({
      url: `${SITE_URL}/squadre/${slug}/calendario`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const playerEntries: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${SITE_URL}/squadre/${p.teamSlug}/${p.slug}`,
    lastModified: p._updatedAt ? new Date(p._updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  // /sponsor/partner solo se esistono Corporate Partner attivi (la
  // pagina ritorna 404 altrimenti, includerla nel sitemap manderebbe
  // crawler verso un dead-end).
  const partnerEntry: MetadataRoute.Sitemap = hasPartners
    ? [
        {
          url: `${SITE_URL}/sponsor/partner`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        },
      ]
    : [];

  // Pagine governance solo se feature flag attivo (delibera Direttivo
  // del Codice Etico). Se off, le pagine ritornano 404 e il sitemap
  // non le include — niente esposizione SEO prematura.
  // /societa/codice-etico verra' aggiunto quando la pagina sarà
  // implementata (Step 2 del task governance — attesa del file HTML
  // sorgente).
  const governanceEntries: MetadataRoute.Sitemap = FEATURES.governanceSection
    ? [
        {
          url: `${SITE_URL}/societa/codice-etico`,
          lastModified: now,
          changeFrequency: "yearly" as const,
          priority: 0.6,
        },
        {
          url: `${SITE_URL}/societa/trasparenza`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        },
        {
          url: `${SITE_URL}/societa/segnalazioni`,
          lastModified: now,
          changeFrequency: "yearly" as const,
          priority: 0.5,
        },
      ]
    : [];

  return [
    ...staticEntries,
    ...partnerEntry,
    ...governanceEntries,
    ...newsEntries,
    ...galleryEntries,
    ...teamEntries,
    ...calendarEntries,
    ...playerEntries,
  ];
}
