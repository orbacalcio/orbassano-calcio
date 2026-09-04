import { ShieldCheck } from "lucide-react";
import { defineField, defineType } from "sanity";

export const player = defineType({
  name: "player",
  title: "Giocatore",
  type: "document",
  icon: ShieldCheck,
  fields: [
    defineField({
      name: "firstName",
      title: "Nome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "lastName",
      title: "Cognome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => `${doc.lastName}-${doc.firstName}`,
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "birthYear",
      title: "Anno di nascita",
      type: "number",
      validation: (r) => r.min(1950).max(new Date().getFullYear()),
    }),
    defineField({
      name: "shirtNumber",
      title: "Numero di maglia",
      type: "number",
      validation: (r) => r.min(1).max(99),
    }),
    defineField({
      name: "role",
      title: "Ruolo",
      type: "string",
      options: {
        list: ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
        layout: "radio",
      },
    }),
    defineField({
      name: "foot",
      title: "Piede",
      type: "string",
      options: { list: ["Destro", "Sinistro", "Ambidestro"] },
    }),
    defineField({
      name: "nationality",
      title: "Nazionalità",
      type: "string",
      initialValue: "Italia",
    }),
    defineField({
      name: "photo",
      title: "Foto ritratto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "photoAction",
      title: "Foto in azione",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "team",
      title: "Squadra",
      description:
        "Obbligatorio: la rosa sul sito è costruita cercando i giocatori collegati alla squadra. Senza questo campo il giocatore resta invisibile anche se pubblicato.",
      type: "reference",
      to: [{ type: "team" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isCaptain",
      title: "Capitano",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "stats",
      title: "Statistiche stagionali",
      type: "object",
      fields: [
        defineField({ name: "appearances", title: "Presenze", type: "number" }),
        defineField({ name: "goals", title: "Gol", type: "number" }),
        defineField({ name: "assists", title: "Assist", type: "number" }),
        defineField({ name: "yellowCards", title: "Ammonizioni", type: "number" }),
        defineField({ name: "redCards", title: "Espulsioni", type: "number" }),
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
      first: "firstName",
      last: "lastName",
      role: "role",
      number: "shirtNumber",
      media: "photo",
    },
    prepare({ first, last, role, number, media }) {
      const num = number ? `#${number} · ` : "";
      return {
        title: `${last} ${first}`,
        subtitle: `${num}${role ?? ""}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Numero di maglia",
      name: "shirtNumberAsc",
      by: [{ field: "shirtNumber", direction: "asc" }],
    },
    {
      title: "Cognome A→Z",
      name: "lastNameAsc",
      by: [{ field: "lastName", direction: "asc" }],
    },
  ],
});
