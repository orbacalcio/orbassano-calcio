import { Shield } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Anagrafica madre dei club avversari (e teoricamente del nostro club
 * stesso, anche se per Orbassano usiamo già siteSettings + team).
 *
 * Un club esiste UNA SOLA VOLTA nel CMS. Quando la stessa "ASD Esempio"
 * incontra Prima Squadra, Juniores e U17 in tre competition diverse,
 * vengono creati tre `opponent` doc che puntano allo stesso club. Logo,
 * sito, social cambiano in un punto e propagano.
 */
export const club = defineType({
  name: "club",
  title: "Club",
  type: "document",
  icon: Shield,
  fields: [
    defineField({
      name: "name",
      title: "Denominazione",
      description: "Nome ufficiale, es. 'A.S.D. Esempio Calcio 1965'.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shortName",
      title: "Nome breve",
      description:
        "Visualizzato nelle MatchCard quando lo spazio è ridotto. Es. 'Esempio'.",
      type: "string",
      validation: (r) => r.required().max(20),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Generato automaticamente, deve essere univoco.",
      type: "slug",
      options: {
        source: "shortName",
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2024-01-01" });
          const id = document?._id?.replace(/^drafts\./, "");
          const query = `!defined(*[_type=="club" && !(_id in [$draft, $published]) && slug.current == $slug][0]._id)`;
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
      title: "Logo",
      description:
        "Caricato dall'admin: il logo deve avere sfondo trasparente o bianco. Sara' renderizzato 32x32 nelle MatchCard con bg-white di fallback.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "primaryColor",
      title: "Colore primario",
      description:
        "Hex opzionale (es. '#1A4F8B'). Usato per badge avversario quando il logo manca. Lascia vuoto se non lo conosci.",
      type: "string",
      validation: (r) =>
        r.regex(/^#[0-9a-fA-F]{6}$/, {
          name: "hex",
          invert: false,
        }).warning("Formato atteso: #RRGGBB"),
    }),
    defineField({
      name: "websiteUrl",
      title: "Sito ufficiale",
      type: "url",
    }),
    defineField({
      name: "tuttocampoUrl",
      title: "Pagina Tuttocampo",
      description:
        "URL della pagina squadra su tuttocampo.it (utile come fallback quando manca il sito ufficiale).",
      type: "url",
    }),
    defineField({
      name: "socialUrls",
      title: "Social",
      type: "object",
      fields: [
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "facebook", title: "Facebook", type: "url" }),
        defineField({ name: "youtube", title: "YouTube", type: "url" }),
      ],
    }),
    defineField({
      name: "headquarters",
      title: "Sede / stadio principale",
      description:
        "Es. 'Stadio Comunale, Via Roma 12, Esempio (TO)'. Solo informativo.",
      type: "string",
    }),
    defineField({
      name: "isActive",
      title: "Attivo",
      description:
        "Disattiva per nascondere il club dai dropdown nello Studio (es. squadra sciolta). I match storici contro questo club restano visibili sul sito.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "shortName",
      media: "logo",
      isActive: "isActive",
    },
    prepare: ({ title, subtitle, media, isActive }) => ({
      title: isActive === false ? `${title} (inattivo)` : title,
      subtitle,
      media,
    }),
  },
  orderings: [
    {
      title: "Denominazione (A→Z)",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
