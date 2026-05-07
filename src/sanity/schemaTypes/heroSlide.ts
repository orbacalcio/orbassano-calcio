import { Image as ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Slide del carosello hero homepage.
 *
 * Spec da docs/LAYOUT_NAVIGATION.md §3.3:
 * - 4-6 foto curate del club (squadra, partite, allenamenti, stadio)
 * - Risoluzione raccomandata sorgente: 2400×1350 (16:9)
 * - Il testo dell'hero NON cambia con l'immagine: il carosello è
 *   "atmosfera" non editoriale. Quindi questo schema porta SOLO
 *   l'immagine + alt + crediti opzionali.
 */
export const heroSlide = defineType({
  name: "heroSlide",
  title: "Slide hero homepage",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titolo interno",
      description:
        "Solo per riconoscere la slide nello Studio. Non viene mostrato sul sito.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Testo alternativo (accessibilità)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "credits",
      title: "Crediti foto",
      type: "string",
    }),
    defineField({
      name: "isActive",
      title: "Attiva nel carosello",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Ordine",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "title",
      isActive: "isActive",
      media: "image",
    },
    prepare({ title, isActive, media }) {
      return {
        title,
        subtitle: isActive === false ? "Disattivata" : "Attiva",
        media,
      };
    },
  },
  orderings: [
    {
      title: "Ordine manuale",
      name: "manual",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
