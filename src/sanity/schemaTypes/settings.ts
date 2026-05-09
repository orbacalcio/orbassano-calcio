import { Cog } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

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
    {
      name: "storyNumbers",
      title: 'Box "Storia in numeri" (homepage)',
      description:
        "Eyebrow, titolo e statistiche del box mostrato in homepage tra «Le squadre» e il Manifesto. Consigliate 4 voci, ma il numero è libero.",
      options: { collapsible: true, collapsed: true },
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
      name: "storyNumbersEyebrow",
      title: "Eyebrow",
      description: 'Testo piccolo sopra il titolo (es. "Storia in numeri").',
      type: "string",
      fieldset: "storyNumbers",
    }),
    defineField({
      name: "storyNumbersTitle",
      title: "Titolo del box",
      description:
        'Es. "Oltre novanta anni di rossoblù raccontati in quattro numeri".',
      type: "string",
      fieldset: "storyNumbers",
    }),
    defineField({
      name: "storyNumbersItems",
      title: "Statistiche",
      description:
        "Ogni voce mostra un numero animato + etichetta + descrizione. Riordinabili con drag-and-drop.",
      type: "array",
      fieldset: "storyNumbers",
      of: [
        defineArrayMember({
          type: "object",
          name: "storyNumberItem",
          title: "Statistica",
          fields: [
            defineField({
              name: "value",
              title: "Valore numerico",
              description: "Solo il numero, senza prefissi/suffissi.",
              type: "number",
              validation: (r) => r.required().min(0),
            }),
            defineField({
              name: "prefix",
              title: "Prefisso",
              description: 'Es. "+". Vuoto se non serve.',
              type: "string",
            }),
            defineField({
              name: "suffix",
              title: "Suffisso",
              description: 'Es. "+". Vuoto se non serve.',
              type: "string",
            }),
            defineField({
              name: "label",
              title: "Etichetta breve",
              description: 'Es. "Anni di rossoblù".',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "caption",
              title: "Descrizione",
              description: "1-2 righe sotto l'etichetta.",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: {
              value: "value",
              prefix: "prefix",
              suffix: "suffix",
              label: "label",
              caption: "caption",
            },
            prepare: ({ value, prefix, suffix, label, caption }) => ({
              title: `${prefix ?? ""}${value ?? "?"}${suffix ?? ""} · ${label ?? "(senza etichetta)"}`,
              subtitle: caption ?? "",
            }),
          },
        }),
      ],
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
