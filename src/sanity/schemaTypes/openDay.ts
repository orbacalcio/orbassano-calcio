import { CalendarCheck } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

// Categorie del Settore Giovanile Scolastico selezionabili per una
// sessione di Summer Camp. Riusate sia per i checkbox multi-selezione
// dello schema sia per l'ordine di rendering in pagina.
const SGS_CATEGORIES = [
  "Juniores Under 19",
  "Allievi Under 17",
  "Allievi Under 16",
  "Giovanissimi Under 15",
  "Giovanissimi Under 14",
] as const;

/**
 * Summer Camp del Settore Giovanile Scolastico — date del camp estivo
 * (meta' giugno, 2-3 settimane), una per categoria/data. La pagina
 * pubblica /settore-giovanile/summer-camp raggruppa per categoria e
 * ordina per data ascendente, mostrando gli eventi con isActive=true.
 *
 * NB: l'id schema resta `openDay` (rinominare il tipo orfanerebbe i
 * documenti esistenti e il filtro del webhook revalidate). Cambia solo
 * la denominazione utente-facing/Studio: "Summer Camp". Prima si
 * chiamava "Open Day", rinominato 2026-05-21 perche' da regolamento
 * FIGC le selezioni/open day non si fanno prima del 1° luglio.
 *
 * Lo schema è separato da `tournament` perché i campi divergono nel
 * tempo: il Summer Camp vive pre-stagione (giugno) con informazioni
 * standard, i Tornei girano tutto l'anno con format, gironi, premi.
 * Tenerli distinti evita di appesantire l'UI Studio con campi
 * conditionally-visible.
 */
export const openDay = defineType({
  name: "openDay",
  title: "Summer Camp",
  type: "document",
  icon: CalendarCheck,
  fields: [
    defineField({
      name: "title",
      title: "Titolo interno",
      description:
        "Solo per identificarlo nello Studio. Es. 'Summer Camp U17 - settimana 1'.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categories",
      title: "Categorie",
      description:
        "Una o più categorie del Settore Giovanile Scolastico a cui è rivolta questa sessione di Summer Camp. Es. spunta sia Allievi U17 sia Allievi U16 se il camp è aperto a entrambe.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: SGS_CATEGORIES.map((c) => ({ title: c, value: c })),
        layout: "grid",
      },
      validation: (r) => r.required().min(1).unique(),
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
      name: "sessions",
      title: "Giorni e orari",
      description:
        "Aggiungi una riga per ogni giorno. Il camp può svolgersi in più giorni e con orari diversi: inserisci una sessione per ciascuno (giorno + ora di inizio e, se vuoi, ora di fine).",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "session",
          title: "Sessione",
          fields: [
            defineField({
              name: "date",
              title: "Giorno e ora di inizio",
              type: "datetime",
              options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm" },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "endTime",
              title: "Ora di fine",
              description:
                "Es. '19:30'. Solo l'ora (la data è quella di inizio). Lascia vuoto se non specificato.",
              type: "string",
              validation: (r) =>
                r
                  .regex(/^\d{1,2}[:.]\d{2}$/, {
                    name: "ora",
                    invert: false,
                  })
                  .warning("Formato consigliato: HH:mm (es. 19:30)"),
            }),
          ],
          preview: {
            select: { date: "date", endTime: "endTime" },
            prepare({ date, endTime }) {
              const formatted = date
                ? new Date(date).toLocaleString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
              return {
                title: formatted,
                subtitle: endTime ? `fino alle ${endTime}` : undefined,
              };
            },
          },
        }),
      ],
      validation: (r) => r.required().min(1),
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
      name: "mapsUrl",
      title: "Link Google Maps (opzionale)",
      description:
        "Link alla posizione su Google Maps. Se valorizzato, accanto all'indirizzo compare il pulsante 'Apri su Google Maps'. Su Maps: condividi → copia link.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"], allowRelative: false }),
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
      categories: "categories",
      firstDate: "sessions.0.date",
      isActive: "isActive",
    },
    prepare({ title, categories, firstDate, isActive }) {
      const cats: string[] = Array.isArray(categories) ? categories : [];
      const catLabel =
        cats.length === 0
          ? "?"
          : cats.length === 1
            ? cats[0]
            : `${cats.length} categorie`;
      const formatted = firstDate
        ? new Date(firstDate).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—";
      return {
        title: title || "Summer Camp senza titolo",
        subtitle: `${catLabel} · dal ${formatted}${isActive === false ? " · NASCOSTO" : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Stagione (più recente)",
      name: "seasonDesc",
      by: [
        { field: "season", direction: "desc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
});
