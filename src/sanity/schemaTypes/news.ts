import { Newspaper } from "lucide-react";
import { defineField, defineType } from "sanity";

export const news = defineType({
  name: "news",
  title: "News",
  type: "document",
  icon: Newspaper,
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          "Prima Squadra",
          "Settore Giovanile",
          "Scuola Calcio",
          "Società",
          "Sponsor",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Pubblicato il",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cover",
      title: "Copertina",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "excerpt",
      title: "Estratto",
      type: "text",
      rows: 3,
      validation: (r) => r.max(280),
    }),
    defineField({
      name: "body",
      title: "Corpo",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Testo alternativo" },
          ],
        },
      ],
    }),
    defineField({
      name: "author",
      title: "Autore",
      type: "string",
    }),
    defineField({
      name: "isPinned",
      title: "Articolo in evidenza",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "cover",
    },
  },
  orderings: [
    {
      title: "Pubblicazione (più recenti)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
