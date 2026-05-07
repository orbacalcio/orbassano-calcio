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
      title: "Anno",
      type: "number",
      validation: (r) => r.required().min(1900).max(2100),
    }),
    defineField({
      name: "season",
      title: "Stagione",
      description: "Es. '1979-1980'",
      type: "string",
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
