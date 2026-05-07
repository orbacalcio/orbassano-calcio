import { MapPin } from "lucide-react";
import { defineField, defineType } from "sanity";

export const facility = defineType({
  name: "facility",
  title: "Impianto sportivo",
  type: "document",
  icon: MapPin,
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "address",
      title: "Indirizzo",
      type: "string",
    }),
    defineField({
      name: "mapsUrl",
      title: "Google Maps URL",
      type: "url",
    }),
    defineField({
      name: "description",
      title: "Descrizione",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "fields",
      title: "Campi disponibili",
      description:
        "Es. 'Campo a 11 omologato Serie D', 'Campo a 7 sintetico'.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
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
      name: "order",
      title: "Ordine",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "address",
      media: "gallery.0",
    },
  },
});
