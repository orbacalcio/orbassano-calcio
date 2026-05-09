import { Building2 } from "lucide-react";
import { defineField, defineType } from "sanity";

export const clubOfficial = defineType({
  name: "clubOfficial",
  title: "Dirigente",
  type: "document",
  icon: Building2,
  fields: [
    defineField({
      name: "role",
      title: "Ruolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "fullName",
      title: "Nome completo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Titolo onorifico",
      description: "Es. 'Dott.', 'Avv.', 'Geom.'",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Ordine",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "fullName",
      subtitle: "role",
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
