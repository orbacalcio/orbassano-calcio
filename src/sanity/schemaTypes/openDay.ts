import { CalendarCheck } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Open Day del Settore Giovanile — sessioni di prova aperte a nuovi
 * iscritti, una per categoria/data. La pagina pubblica
 * /settore-giovanile/open-days raggruppa per categoria e ordina per
 * data ascendente, mostrando solo gli eventi futuri (date >= oggi)
 * o flaggati come isActive=true.
 *
 * Lo schema è separato da `tournament` perché i campi divergono nel
 * tempo: gli Open Day vivono pre-stagione (giugno-luglio) con
 * informazioni standard, i Tornei girano tutto l'anno con format,
 * gironi, premi. Tenerli distinti evita di appesantire l'UI Studio
 * con campi conditionally-visible.
 */
export const openDay = defineType({
  name: "openDay",
  title: "Open Day",
  type: "document",
  icon: CalendarCheck,
  fields: [
    defineField({
      name: "title",
      title: "Titolo interno",
      description:
        "Solo per identificarlo nello Studio. Es. 'Open Day U17 - 1 luglio'.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      description:
        "Categoria del Settore Giovanile a cui è rivolto questo Open Day. Una sola categoria per evento; se serve un evento multi-categoria, crea un evento per ciascuna.",
      type: "string",
      options: {
        list: [
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
      description: "Es. '2026/27'. Usato per filtrare archivi.",
      type: "string",
      initialValue: "2026/27",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Data",
      description: "Giorno e ora di inizio dell'Open Day.",
      type: "datetime",
      options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "endTime",
      title: "Ora di fine",
      description:
        "Es. '19:30'. Solo l'ora, niente data (la data è presa dal campo Data). Lascia vuoto se non specificato.",
      type: "string",
      validation: (r) =>
        r.regex(/^\d{1,2}[:.]\d{2}$/, {
          name: "ora",
          invert: false,
        }).warning("Formato consigliato: HH:mm (es. 19:30)"),
    }),
    defineField({
      name: "venue",
      title: "Indirizzo / Luogo",
      description:
        "Es. 'Via Silone, 4 - Orbassano, Centro Sportivo Aldo Porta'.",
      type: "string",
      initialValue:
        "Via Silone, 4 - Orbassano, Centro Sportivo Aldo Porta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "notes",
      title: "Note (opzionali)",
      description:
        "Indicazioni extra: 'portare scarpini', 'modulo da firmare', 'attività adatta a tesserati di altri club', ecc.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "downloadModuleUrl",
      title: "URL modulo iscrizione",
      description:
        "Link al PDF del modulo iscrizione (es. Google Drive condiviso). Se valorizzato, sulla pagina compare il bottone Download.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"], allowRelative: false }),
    }),
    defineField({
      name: "isActive",
      title: "Visibile sul sito",
      description:
        "Disattiva per nasconderlo senza cancellare (es. evento rinviato in attesa di nuova data).",
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
        title: title || "Open Day senza titolo",
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
      title: "Categoria",
      name: "categoryAsc",
      by: [
        { field: "category", direction: "asc" },
        { field: "date", direction: "asc" },
      ],
    },
  ],
});
