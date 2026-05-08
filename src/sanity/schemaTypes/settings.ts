import { Cog } from "lucide-react";
import { defineField, defineType } from "sanity";

export const settings = defineType({
  name: "settings",
  title: "Impostazioni globali",
  type: "document",
  icon: Cog,
  fieldsets: [
    {
      name: "heroCarousel",
      title: "Carosello hero",
      description:
        "Tempistiche di autoplay e transizione del carosello in homepage. Le singole slide possono sovrascrivere la durata via 'Durata custom' nello schema 'Slide hero homepage'.",
      options: { collapsible: true, collapsed: false },
    },
  ],
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
      name: "heroSlideDuration",
      title: "Durata di ogni slide (secondi)",
      description:
        "Tempo per cui ciascuna slide resta visibile prima di passare alla successiva. Default 5s.",
      type: "number",
      initialValue: 5,
      validation: (r) => r.min(2).max(30),
      fieldset: "heroCarousel",
    }),
    defineField({
      name: "heroTransitionDuration",
      title: "Durata transizione (ms)",
      description:
        "Tempo del cross-fade tra una slide e la successiva. Default 300ms (cinematografico). Sotto i 200ms scattante, sopra gli 800ms lento.",
      type: "number",
      initialValue: 300,
      validation: (r) => r.min(100).max(1500),
      fieldset: "heroCarousel",
    }),
    defineField({
      name: "heroAutoplayEnabled",
      title: "Autoplay attivo",
      description:
        "Se disattivato, le slide non avanzano automaticamente: viene mostrata staticamente solo la prima slide attiva.",
      type: "boolean",
      initialValue: true,
      fieldset: "heroCarousel",
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
