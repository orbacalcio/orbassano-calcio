import { Trophy } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Una competizione e' specifica per (squadra nostra, stagione). La
 * Prima Squadra 2026/27 ha 1-2 competition: Prima Categoria + eventuale
 * Coppa. Le amichevoli pre-stagione sono una sola competition con
 * `category: 'friendly'` che raccoglie tutti gli incontri.
 *
 * Ogni `match` punta a una competition (oltre che a un opponent). Le
 * pagine /squadre/[slug]/calendario filtrano per
 * competition.targetTeam.slug == slug + competition.season == currentSeason.
 */
export const competition = defineType({
  name: "competition",
  title: "Competizione",
  type: "document",
  icon: Trophy,
  fields: [
    defineField({
      name: "name",
      title: "Denominazione",
      description:
        "Nome esteso, es. 'Prima Categoria Piemonte VdA Girone A 2026/27'.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shortName",
      title: "Nome breve",
      description:
        "Mostrato nelle MatchCard e nei tab. Es. 'Prima Categoria', 'Coppa Italia', 'Amichevoli'.",
      type: "string",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Auto-generato, usato come URL param ?comp=...",
      type: "slug",
      options: {
        source: "shortName",
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2024-01-01" });
          const id = document?._id?.replace(/^drafts\./, "");
          const query = `!defined(*[_type=="competition" && !(_id in [$draft, $published]) && slug.current == $slug][0]._id)`;
          const params = {
            draft: `drafts.${id ?? ""}`,
            published: id ?? "",
            slug,
          };
          return client.fetch(query, params);
        },
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo competizione",
      description: "Es. crest LND, FIGC, scudetto Coppa.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "season",
      title: "Stagione",
      description: "Formato '2026/27'. Coerente con team.season e settings.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Tipologia",
      type: "string",
      options: {
        list: [
          { title: "Campionato", value: "championship" },
          { title: "Coppa", value: "cup" },
          { title: "Torneo", value: "tournament" },
          { title: "Playoff / Playout", value: "playoff" },
          { title: "Amichevoli", value: "friendly" },
        ],
        layout: "radio",
      },
      initialValue: "championship",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "targetTeam",
      title: "Squadra Orbassano",
      description: "La nostra squadra che partecipa a questa competizione.",
      type: "reference",
      to: [{ type: "team" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "federation",
      title: "Federazione",
      type: "string",
      options: {
        list: [
          { title: "FIGC — Lega Nazionale Dilettanti", value: "figc-lnd" },
          { title: "FIGC — Settore Giovanile e Scolastico", value: "figc-sgs" },
          { title: "Privata / non federale", value: "private" },
        ],
        layout: "radio",
      },
      initialValue: "figc-lnd",
    }),
    defineField({
      name: "group",
      title: "Girone",
      description:
        "Es. 'A', 'B', 'Eliminatoria 1'. Lascia vuoto fino a comunicazione federale.",
      type: "string",
    }),
    defineField({
      name: "externalRankingUrl",
      title: "Classifica esterna",
      description:
        "URL classifica ufficiale (Sprintsport, Tuttocampo). Usato dal MatchStrip e dalla pagina calendario.",
      type: "url",
    }),
    defineField({
      name: "externalCalendarUrl",
      title: "Calendario esterno",
      description:
        "URL calendario ufficiale federale (utile come riferimento per l'admin che inserisce i match).",
      type: "url",
    }),
    defineField({
      name: "defaultReportLink",
      title: "Link Tuttocampo (default match)",
      description:
        "URL Tuttocampo della squadra/girone (mostra risultati + classifica in un'unica pagina). Usato come fallback sulle MatchCard quando il match non ha un tabellino specifico (match.reportLink). Cascata: match.reportLink batte questo default.",
      type: "url",
    }),
    defineField({
      name: "startDate",
      title: "Inizio competizione",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "Fine competizione",
      type: "date",
    }),
    defineField({
      name: "order",
      title: "Ordine tab",
      description:
        "Decide l'ordine dei tab nella pagina calendario. Campionato primo (0), coppa secondo (1), amichevoli ultimo (99).",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isActive",
      title: "Attiva",
      description:
        "Disattiva per nascondere la competition dai dropdown e dai tab del calendario senza cancellarla.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      shortName: "shortName",
      season: "season",
      category: "category",
      targetTeam: "targetTeam.name",
      isActive: "isActive",
      media: "logo",
    },
    prepare: ({ shortName, season, category, targetTeam, isActive, media }) => {
      const cat =
        category === "championship"
          ? "Campionato"
          : category === "cup"
            ? "Coppa"
            : category === "tournament"
              ? "Torneo"
              : category === "playoff"
                ? "Playoff"
                : "Amichevoli";
      return {
        title: isActive === false
          ? `${shortName} ${season} (disattiva)`
          : `${shortName} ${season}`,
        subtitle: `${cat} · ${targetTeam ?? "—"}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Stagione (più recenti)",
      name: "seasonDesc",
      by: [
        { field: "season", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
});
