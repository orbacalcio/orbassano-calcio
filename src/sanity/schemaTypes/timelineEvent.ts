import { Milestone } from "lucide-react";
import { defineField, defineType } from "sanity";

export const timelineEvent = defineType({
  name: "timelineEvent",
  title: "Evento storico",
  type: "document",
  icon: Milestone,
  fields: [
    defineField({
      name: "year",
      title: "Anno cronologico",
      description:
        "Tre casi: (1) evento PURO (fondazione, fusione, cessione) → anno solare; (2) evento STAGIONALE (promozione, classifica) → anno di FINE stagione (es. 2005-2006 → 2006); (3) PERIODO pluri-annuale (anni in media classifica, stagioni consecutive senza highlight) → anno di INIZIO del periodo + popola anche 'Anno di fine periodo' qui sotto.",
      type: "number",
      validation: (r) => r.required().min(1900).max(2100),
    }),
    defineField({
      name: "yearEnd",
      title: "Anno di fine periodo (opzionale)",
      description:
        "Compila SOLO per PERIODI pluri-annuali, es. '1985-1992 — anni in media classifica Interregionale'. Lascia vuoto per eventi singoli (puri o stagionali). Il display in timeline diventa 'AAAA - BBBB' invece di 'AAAA'. Non compatibile con il campo Stagione.",
      type: "number",
      validation: (r) =>
        r
          .min(1900)
          .max(2100)
          .custom((yearEnd, context) => {
            if (typeof yearEnd !== "number") return true;
            const doc = context.document as {
              year?: number;
              season?: string;
            };
            if (doc.season) {
              return "Non puoi compilare 'Anno di fine periodo' insieme a 'Stagione'. Per i periodi pluri-annuali la stagione deve essere vuota.";
            }
            if (typeof doc.year === "number" && yearEnd <= doc.year) {
              return `L'anno di fine periodo (${yearEnd}) deve essere MAGGIORE dell'anno di inizio (${doc.year}).`;
            }
            return true;
          }),
    }),
    defineField({
      name: "season",
      title: "Stagione",
      description:
        "Es. '2005-2006'. Lascia vuoto per eventi non legati a una stagione (fondazione, fusione, eventi sociali, periodi pluri-annuali). Quando popolato, l'anno DEVE corrispondere al secondo della stagione (anno di fine — vedi campo Anno). Non compatibile con 'Anno di fine periodo'.",
      type: "string",
      validation: (r) =>
        r.custom((season, context) => {
          if (!season) return true;
          const doc = context.document as {
            year?: number;
            yearEnd?: number;
          };
          if (typeof doc.yearEnd === "number") {
            return "Non puoi compilare 'Stagione' insieme a 'Anno di fine periodo'. Scegli uno dei due.";
          }
          // Estrae il secondo blocco di 4 cifre dalla stagione (anno
          // di FINE, es. "2005-2006" -> 2006). Fallback sul primo se
          // non trova un secondo blocco.
          const matches = Array.from(season.matchAll(/(\d{4})/g));
          const endStr = matches[1]?.[1] ?? matches[0]?.[1];
          const seasonEndYear = endStr ? parseInt(endStr, 10) : Number.NaN;
          if (Number.isNaN(seasonEndYear)) return true;
          if (typeof doc.year !== "number") return true;
          if (doc.year !== seasonEndYear) {
            return `Il campo Anno (${doc.year}) deve corrispondere al secondo anno della stagione (${seasonEndYear}). Aggiorna 'Anno' a ${seasonEndYear}.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Descrizione",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          "Fondazione",
          "Promozione",
          "Retrocessione",
          "Trofeo",
          "Fusione",
          "Rifondazione",
          "Storico",
        ],
      },
    }),
    defineField({
      name: "isHighlight",
      title: "Evento da evidenziare",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "manualOrder",
      title: "Ordine manuale (override)",
      description:
        "Numero che SOVRASCRIVE il calcolo automatico di posizione cronologica. Compilalo SOLO quando l'ordine auto basato su anno/stagione/periodo non da' il risultato desiderato. Esempi: per spingere un evento del 1992 prima della stagione 1991-1992 metti 1991; per inserirlo a meta' anno 1992 metti 1992 con valori decimali ammessi (es. 1992.5). Lascia vuoto per usare l'ordinamento automatico.",
      type: "number",
      validation: (r) => r.min(1800).max(2200),
    }),
  ],
  preview: {
    select: {
      year: "year",
      title: "title",
      category: "category",
      media: "image",
    },
    prepare({ year, title, category, media }) {
      return {
        title: `${year} · ${title}`,
        subtitle: category,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Cronologico (più recenti)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
    {
      title: "Cronologico (dal 1930)",
      name: "yearAsc",
      by: [{ field: "year", direction: "asc" }],
    },
  ],
});
