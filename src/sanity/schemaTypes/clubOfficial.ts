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
      name: "groupOrder",
      title: "Ordine della riga",
      description:
        "Numero che decide la posizione verticale della riga sulla pagina (più basso = più in alto). Es. 0 per 'Presidenza' in cima, 1 per la riga successiva, 2 per quella sotto. Basta valorizzarlo su UN dirigente del gruppo: gli altri ereditano. Vuoto = ordine automatico basato sul campo Ordine del primo dirigente.",
      type: "number",
    }),
    defineField({
      name: "order",
      title: "Ordine nella riga",
      description:
        "Posizione orizzontale del dirigente DENTRO la sua riga (più basso = più a sinistra).",
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
