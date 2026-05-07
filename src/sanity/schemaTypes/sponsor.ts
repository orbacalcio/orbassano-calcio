import { Handshake } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Sponsor del club. Gli sponsor non si cancellano mai: si archiviano
 * con `isActive: false`. Vedi DATA_ORBASSANO.md §8 per la lista
 * "Sponsor rimossi rispetto alla stagione precedente".
 *
 * Il campo `tier` controlla anche dove appare lo sponsor nel sito:
 * - Main Sponsor    -> topbar superiore (1-5 elementi dinamici)
 * - Official Sponsor -> sezione sponsor + marquee homepage
 * - Corporate Partner -> pagina partner (vantaggi/brochure)
 */
export const sponsor = defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  icon: Handshake,
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tier",
      title: "Livello",
      type: "string",
      options: {
        list: [
          { title: "Main Sponsor", value: "Main Sponsor" },
          { title: "Official Sponsor", value: "Official Sponsor" },
          { title: "Corporate Partner", value: "Corporate Partner" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo a colori",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "logoMonochrome",
      title: "Logo monocromatico (per topbar bianca)",
      description:
        "PNG o SVG già preparato in monocromatico bianco. Usato nella topbar e nello sponsor strip mobile dove il colore originale dei loghi farebbe rumore visivo.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "website",
      title: "Sito web",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "description",
      title: "Descrizione",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "partnerBenefit",
      title: "Vantaggio per i tesserati (solo Corporate Partner)",
      type: "text",
      rows: 3,
      hidden: ({ document }) => document?.tier !== "Corporate Partner",
    }),
    defineField({
      name: "partnerBrochure",
      title: "Brochure PDF (solo Corporate Partner)",
      type: "file",
      options: { accept: ".pdf" },
      hidden: ({ document }) => document?.tier !== "Corporate Partner",
    }),
    defineField({
      name: "isActive",
      title: "Attivo nella stagione corrente",
      type: "boolean",
      initialValue: true,
      description:
        "Disattiva (false) per archiviare lo sponsor mantenendo lo storico. Mai cancellare il documento.",
    }),
    defineField({
      name: "order",
      title: "Ordine di visualizzazione",
      type: "number",
      description:
        "Numero più basso = più in alto. Usato per ordinare i loghi nella topbar e nelle griglie.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "tier",
      isActive: "isActive",
      media: "logo",
    },
    prepare({ title, subtitle, isActive, media }) {
      return {
        title,
        subtitle: `${subtitle}${isActive === false ? " · ARCHIVIATO" : ""}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Tier + ordine",
      name: "tierOrder",
      by: [
        { field: "tier", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
});
