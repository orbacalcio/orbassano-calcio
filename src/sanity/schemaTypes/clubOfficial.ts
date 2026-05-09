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
      name: "group",
      title: "Riga (raggruppamento)",
      description:
        "Etichetta del raggruppamento sulla pagina /societa/organigramma. Dirigenti con la stessa etichetta vanno nella stessa riga; cambiare etichetta = nuova riga con spazio sopra. Es. 'Presidenza', 'Direzione finanziaria', 'Consiglio direttivo'. Vuoto = riga unica con tutti gli altri senza etichetta.",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Ordine",
      description:
        "Ordine all'interno della riga (e ordine delle righe stesse, basato sul primo dirigente di ogni gruppo).",
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
