import { Building2 } from "lucide-react";
import { defineField, defineType } from "sanity";

export const clubOfficial = defineType({
  name: "clubOfficial",
  title: "Dirigente",
  type: "document",
  icon: Building2,
  fields: [
    defineField({
      name: "isActive",
      title: "Visibile sull'organigramma",
      description:
        "Attiva/disattiva la card del dirigente senza cancellarla. Disattivato = nascosto da /societa/organigramma ma resta in archivio (utile per ex-presidenti, dimissioni in corso, transizioni). Default: attivo.",
      type: "boolean",
      initialValue: true,
    }),
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
      description:
        "Posizione del dirigente nell'organigramma: più basso = prima (in alto a sinistra). Es. 0 Presidente · 1 Vice · 2 Direttore Generale · 3 Tesoriere · 4 Consigliere. La pagina dispone le card in un'unica griglia seguendo quest'ordine, senza raggruppamenti.",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "fullName",
      subtitle: "role",
      isActive: "isActive",
    },
    prepare({ title, subtitle, isActive }) {
      // Disattivato esplicito: prefisso visivo nella lista Studio così
      // l'admin distingue al volo le card live dalle archiviate.
      const active = isActive !== false;
      return {
        title: active ? title : `(disattivato) ${title ?? ""}`,
        subtitle,
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
