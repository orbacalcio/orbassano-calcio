import { Trophy } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Torneo del club — manifestazioni single-day o multi-day organizzate
 * o ospitate dal club. Visibile sulla pagina /tornei raggruppate per
 * categoria e ordinate per data.
 *
 * Categoria: ammette Prima Squadra (amichevoli pre-stagione, memorial),
 * Juniores Under 19 e le 4 categorie del Settore Giovanile Scolastico
 * (U14-U17). Per tornei multi-categoria, crea un evento per ciascuna.
 *
 * Separato da `openDay` per accomodare campi specifici (format,
 * gironi, premio) senza appesantire la UI degli Open Day.
 */
export const tournament = defineType({
  name: "tournament",
  title: "Torneo",
  type: "document",
  icon: Trophy,
  fields: [
    defineField({
      name: "title",
      title: "Nome torneo",
      description:
        "Es. 'Torneo della Befana 2026', '5° Memorial Aldo Porta'.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      description:
        "Categoria/squadra a cui e' rivolto il torneo. Per tornei multi-categoria, crea un evento per ciascuna.",
      type: "string",
      options: {
        list: [
          { title: "Prima Squadra", value: "Prima Squadra" },
          { title: "Juniores Under 19", value: "Juniores Under 19" },
          { title: "Allievi Under 17", value: "Allievi Under 17" },
          { title: "Allievi Under 16", value: "Allievi Under 16" },
          { title: "Giovanissimi Under 15", value: "Giovanissimi Under 15" },
          { title: "Giovanissimi Under 14", value: "Giovanissimi Under 14" },
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "season",
      title: "Stagione",
      type: "string",
      initialValue: "2026/27",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Data inizio",
      description: "Giorno (e ora) di inizio del torneo.",
      type: "datetime",
      options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "endDate",
      title: "Data fine (opzionale)",
      description:
        "Solo per tornei multi-giornata. Per tornei single-day lascia vuoto.",
      type: "datetime",
      options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm" },
    }),
    defineField({
      name: "venue",
      title: "Indirizzo / Luogo",
      type: "string",
      initialValue:
        "Via Silone, 4 - Orbassano, Centro Sportivo Aldo Porta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "format",
      title: "Formato",
      description:
        "Es. 'Triangolare', 'Gironi + eliminazione', 'Girone unico'. Mostrato come tag.",
      type: "string",
    }),
    defineField({
      name: "prize",
      title: "Premio",
      description: "Es. 'Trofeo + medaglie a tutte le squadre'.",
      type: "string",
    }),
    defineField({
      name: "participatingTeams",
      title: "Squadre partecipanti",
      description:
        "Elenco testuale, una squadra per riga. Solo per visualizzazione (no relazione con anagrafiche).",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "notes",
      title: "Note (opzionali)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "registrationUrl",
      title: "URL iscrizione / bando",
      description:
        "Link al modulo o al bando del torneo (PDF, Google Form). Se valorizzato, compare il bottone 'Info e iscrizioni'.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"], allowRelative: false }),
    }),
    defineField({
      name: "isActive",
      title: "Visibile sul sito",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      date: "date",
      isActive: "isActive",
    },
    prepare({ title, category, date, isActive }) {
      const formatted = date
        ? new Date(date).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—";
      return {
        title: title || "Torneo senza titolo",
        subtitle: `${category ?? "?"} · ${formatted}${isActive === false ? " · NASCOSTO" : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Data crescente",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
    {
      title: "Data decrescente",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
