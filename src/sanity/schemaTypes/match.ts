import { Trophy } from "lucide-react";
import { defineField, defineType } from "sanity";

export const match = defineType({
  name: "match",
  title: "Partita",
  type: "document",
  icon: Trophy,
  fields: [
    defineField({
      name: "season",
      title: "Stagione",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "matchday",
      title: "Giornata",
      type: "number",
    }),
    defineField({
      name: "date",
      title: "Data e ora",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "team",
      title: "Squadra",
      type: "reference",
      to: [{ type: "team" }],
    }),
    defineField({
      name: "opponent",
      title: "Avversario",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "opponentLogo",
      title: "Logo avversario",
      type: "image",
    }),
    defineField({
      name: "home",
      title: "In casa",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "venue",
      title: "Stadio",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Stato",
      type: "string",
      options: {
        list: [
          { title: "Programmata", value: "scheduled" },
          { title: "In corso", value: "live" },
          { title: "Terminata", value: "finished" },
          { title: "Rinviata", value: "postponed" },
        ],
        layout: "radio",
      },
      initialValue: "scheduled",
    }),
    defineField({
      name: "scoreHome",
      title: "Gol in casa",
      type: "number",
    }),
    defineField({
      name: "scoreAway",
      title: "Gol in trasferta",
      type: "number",
    }),
    defineField({
      name: "reportLink",
      title: "Tabellino esterno",
      type: "url",
    }),
    defineField({
      name: "highlightsUrl",
      title: "Highlights YouTube",
      type: "url",
    }),
  ],
  preview: {
    select: {
      opponent: "opponent",
      home: "home",
      date: "date",
      status: "status",
      scoreHome: "scoreHome",
      scoreAway: "scoreAway",
    },
    prepare({ opponent, home, date, status, scoreHome, scoreAway }) {
      const where = home ? "vs" : "@";
      const score =
        typeof scoreHome === "number" && typeof scoreAway === "number"
          ? ` · ${scoreHome}-${scoreAway}`
          : "";
      const when = date ? new Date(date).toLocaleDateString("it-IT") : "TBD";
      return {
        title: `${where} ${opponent}${score}`,
        subtitle: `${when} · ${status ?? "scheduled"}`,
      };
    },
  },
  orderings: [
    {
      title: "Data (più recenti)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
