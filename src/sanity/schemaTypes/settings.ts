import { Cog } from "lucide-react";
import { defineField, defineType } from "sanity";

export const settings = defineType({
  name: "settings",
  title: "Impostazioni globali",
  type: "document",
  icon: Cog,
  fields: [
    defineField({
      name: "siteTitle",
      title: "Titolo del sito",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description:
        "Breve frase che accompagna il titolo del sito (es. 'Dal 1930 il calcio di Orbassano').",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Immagine OG di default",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "currentSeason",
      title: "Stagione corrente",
      type: "string",
      description: "Es. '2025/2026'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "currentLeague",
      title: "Categoria corrente",
      type: "string",
      description: "Es. 'Promozione Piemonte VdA'",
    }),
    defineField({
      name: "currentGroup",
      title: "Girone corrente",
      type: "string",
      description: "Es. 'Girone B'",
    }),
    defineField({
      name: "social",
      title: "Social media",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "facebook", type: "url" }),
        defineField({ name: "youtube", type: "url" }),
        defineField({ name: "threads", type: "url" }),
        defineField({ name: "twitter", type: "url" }),
        defineField({ name: "tiktok", type: "url" }),
      ],
    }),
    defineField({
      name: "sprintsportLinks",
      title: "Link Sprintesport",
      description:
        "Link esterni a classifica/calendario/statistiche del campionato.",
      type: "object",
      fields: [
        defineField({ name: "classifica", type: "url" }),
        defineField({ name: "calendario", type: "url" }),
        defineField({ name: "statistiche", type: "url" }),
      ],
    }),
    defineField({
      name: "contactInfo",
      title: "Contatti",
      type: "object",
      fields: [
        defineField({ name: "email", type: "string" }),
        defineField({ name: "pec", type: "string" }),
        defineField({ name: "phone", type: "string" }),
        defineField({ name: "address", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "legalInfo",
      title: "Dati legali",
      type: "object",
      fields: [
        defineField({ name: "vatNumber", title: "P.IVA", type: "string" }),
        defineField({ name: "fiscalCode", title: "Codice Fiscale", type: "string" }),
        defineField({ name: "iban", type: "string" }),
        defineField({ name: "figcMatricola", type: "string" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Impostazioni globali" }),
  },
});
