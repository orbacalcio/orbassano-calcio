import { Users } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const staffMember = defineType({
  name: "staffMember",
  title: "Membro staff",
  type: "object",
  fields: [
    defineField({
      name: "role",
      title: "Ruolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});

export const team = defineType({
  name: "team",
  title: "Squadra",
  type: "document",
  icon: Users,
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          { title: "Prima Squadra", value: "Prima Squadra" },
          { title: "Settore Giovanile", value: "Settore Giovanile" },
          { title: "Scuola Calcio", value: "Scuola Calcio" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Sottocategoria",
      description: "Es. 'Under 17', 'Under 16', 'Pulcini'.",
      type: "string",
    }),
    defineField({
      name: "season",
      title: "Stagione",
      type: "string",
      description:
        "Default fallback per UI. La verita' vive su Competition.season. Es. '2026/2027'.",
    }),
    defineField({
      name: "currentMainCompetition",
      title: "Competizione principale (stagione corrente)",
      description:
        "Tipicamente il campionato di categoria. Alimenta la pagina /squadre/[slug]/calendario e l'info strip della pagina squadra.",
      type: "reference",
      to: [{ type: "competition" }],
      options: {
        filter: ({ document }) => {
          const id = document?._id?.replace(/^drafts\./, "");
          if (!id) return { filter: "isActive == true" };
          return {
            filter: "isActive == true && targetTeam._ref == $teamId",
            params: { teamId: id },
          };
        },
      },
    }),
    defineField({
      name: "currentSecondaryCompetitions",
      title: "Competizioni secondarie (stagione corrente)",
      description:
        "Coppe, tornei, amichevoli pre-stagione. Vengono mostrate come tab aggiuntivi nel calendario.",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "competition" }],
          options: {
            filter: ({ document }) => {
              const id = document?._id?.replace(/^drafts\./, "");
              if (!id) return { filter: "isActive == true" };
              return {
                filter: "isActive == true && targetTeam._ref == $teamId",
                params: { teamId: id },
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "league",
      title: "Categoria/campionato (legacy)",
      description:
        "[Deprecato — usa Competition principale.shortName]. Mantenuto per fallback finche' non popoli currentMainCompetition.",
      type: "string",
    }),
    defineField({
      name: "group",
      title: "Girone (legacy)",
      description:
        "[Deprecato — vive su Competition.group]. Mantenuto per fallback.",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Descrizione",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "heroImage",
      title: "Foto squadra",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "staff",
      title: "Staff tecnico",
      type: "array",
      of: [defineArrayMember({ type: "staffMember" })],
    }),
    defineField({
      name: "order",
      title: "Ordine",
      type: "number",
    }),
    defineField({
      name: "isActive",
      title: "Attiva",
      description:
        "Disattiva per nascondere la squadra dal sito senza cancellarla. La pagina dedicata risponde con 404, link nel menu/footer/mappa scompaiono. Riattivabile in qualsiasi momento.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "subcategory",
      media: "heroImage",
      isActive: "isActive",
    },
    prepare: ({ title, subtitle, media, isActive }) => ({
      title: isActive === false ? `${title} (disattivata)` : title,
      subtitle,
      media,
    }),
  },
  orderings: [
    {
      title: "Ordine manuale",
      name: "manual",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
