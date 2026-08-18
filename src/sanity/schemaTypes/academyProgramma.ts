import { CalendarDays } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Singleton: contenuti della pagina /scuola-calcio/programma.
 * Documento unico id fisso "academy-programma".
 */
export const academyProgramma = defineType({
  name: "academyProgramma",
  title: "Scuola Calcio — Programma tecnico",
  type: "document",
  icon: CalendarDays,
  fields: [
    defineField({
      name: "scProgTimeline",
      title: "Timeline settimanale — slot allenamenti",
      description:
        "Slot orari per giorno della settimana (es. martedì 16:00-18:00 'Allenamento tecnico'). Ordina per giorno di settimana.",
      type: "array",
      of: [
        defineField({
          name: "timelineSlot",
          title: "Slot",
          type: "object",
          fields: [
            defineField({
              name: "day",
              title: "Giorno",
              type: "string",
              options: {
                list: [
                  "Lunedì",
                  "Martedì",
                  "Mercoledì",
                  "Giovedì",
                  "Venerdì",
                  "Sabato",
                  "Domenica",
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "startTime",
              title: "Ora inizio (HH:mm)",
              type: "string",
              validation: (r) =>
                r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:mm" }),
            }),
            defineField({
              name: "endTime",
              title: "Ora fine (HH:mm)",
              type: "string",
              validation: (r) =>
                r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:mm" }),
            }),
            defineField({
              name: "activity",
              title: "Attività",
              type: "string",
              description:
                "Es. 'Allenamento tecnico', 'Partita amichevole', 'Riunione genitori'.",
            }),
            defineField({
              name: "ageGroup",
              title: "Annata / fascia (opzionale)",
              type: "string",
              description:
                "Se lo slot è dedicato a un gruppo specifico (es. 'Annate 2014-2015', 'Esordienti 2014').",
            }),
          ],
          preview: {
            select: {
              day: "day",
              s: "startTime",
              e: "endTime",
              a: "activity",
            },
            prepare({ day, s, e, a }) {
              return {
                title: `${day} ${s ?? ""}-${e ?? ""}`,
                subtitle: a,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "scProgFasce",
      title: "Annate — focus tecnico",
      description:
        "Una card per ogni annata attiva. Stagione 2026/2027: 'Esordienti 2015' (primo anno) e 'Esordienti 2014' (secondo anno). Se apri altre fasce FIGC (Pulcini, Primi Calci, Piccoli Amici) aggiungile qui.",
      type: "array",
      of: [
        defineField({
          name: "fasciaEta",
          title: "Fascia",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Nome annata",
              type: "string",
              description:
                "Es. 'Esordienti 2015', 'Esordienti 2014'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "ageRange",
              title: "Anno di corso (es. 'Primo anno · Under 12')",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "focus",
              title: "Focus tecnico",
              type: "array",
              description:
                "Cosa si lavora con questa fascia (coordinazione, gioco, fondamentali...).",
              of: [{ type: "block" }],
            }),
            defineField({
              name: "image",
              title: "Foto rappresentativa",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "order",
              title: "Ordine",
              type: "number",
            }),
          ],
          preview: { select: { title: "label", subtitle: "ageRange" } },
        }),
      ],
    }),
    defineField({
      name: "scProgStaff",
      title: "Staff coach — allenatori Scuola Calcio",
      description:
        "Allenatori con qualifiche FIGC. Inline: aggiungi/rimuovi senza creare documenti separati.",
      type: "array",
      of: [
        defineField({
          name: "coach",
          title: "Coach",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nome e cognome",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "role",
              title: "Ruolo",
              type: "string",
              description:
                "Es. 'Responsabile tecnico', 'Coach Pulcini', 'Preparatore portieri'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "qualifications",
              title: "Qualifiche FIGC",
              type: "string",
              description:
                "Es. 'Allenatore Dilettanti FIGC', 'Allenatore Giovani UEFA C'.",
            }),
            defineField({
              name: "photo",
              title: "Foto",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "bio",
              title: "Bio breve",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "order",
              title: "Ordine",
              type: "number",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "photo" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Scuola Calcio — Programma tecnico" }),
  },
});
