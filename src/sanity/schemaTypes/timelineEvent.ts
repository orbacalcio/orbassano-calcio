import { Milestone } from "lucide-react";
import { defineField, defineType } from "sanity";

export const timelineEvent = defineType({
  name: "timelineEvent",
  title: "Evento storico",
  type: "document",
  icon: Milestone,
  fields: [
    defineField({
      name: "year",
      title: "Anno cronologico (anno di inizio)",
      description:
        "Per eventi PURI (fondazione, fusione, ecc.) usa l'anno solare in cui sono avvenuti. Per eventi LEGATI A UNA STAGIONE (promozione, retrocessione, posizioni di classifica) usa l'ANNO DI INIZIO della stagione (es. stagione 2005-2006 → 2005). Cosi' l'ordinamento cronologico colloca l'evento prima delle vicende dell'anno solare successivo. La stagione completa va nel campo 'Stagione' qui sotto.",
      type: "number",
      validation: (r) => r.required().min(1900).max(2100),
    }),
    defineField({
      name: "season",
      title: "Stagione",
      description:
        "Es. '2005-2006'. Lascia vuoto per eventi non legati a una stagione (fondazione, fusione, eventi sociali). Quando popolato, l'anno DEVE corrispondere al primo della stagione (vedi campo Anno).",
      type: "string",
      validation: (r) =>
        r.custom((season, context) => {
          if (!season) return true;
          // Estrae il primo blocco di 4 cifre dalla stagione.
          const match = season.match(/^\D*(\d{4})/);
          const seasonStartYear = match?.[1]
            ? parseInt(match[1], 10)
            : Number.NaN;
          if (Number.isNaN(seasonStartYear)) return true;
          const year = (context.document as { year?: number })?.year;
          if (typeof year !== "number") return true;
          if (year !== seasonStartYear) {
            return `Il campo Anno (${year}) deve corrispondere al primo anno della stagione (${seasonStartYear}). Aggiorna 'Anno' a ${seasonStartYear}.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Descrizione",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          "Fondazione",
          "Promozione",
          "Trofeo",
          "Fusione",
          "Rifondazione",
          "Storico",
        ],
      },
    }),
    defineField({
      name: "isHighlight",
      title: "Evento da evidenziare",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      year: "year",
      title: "title",
      category: "category",
      media: "image",
    },
    prepare({ year, title, category, media }) {
      return {
        title: `${year} · ${title}`,
        subtitle: category,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Cronologico (più recenti)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
    {
      title: "Cronologico (dal 1930)",
      name: "yearAsc",
      by: [{ field: "year", direction: "asc" }],
    },
  ],
});
