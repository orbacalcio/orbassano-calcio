import { Coins } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Rendicontazione annuale 5×1000 — art. 7.14 del Codice Etico.
 *
 * Un documento per anno fiscale. La pagina /societa/trasparenza
 * fetcha la lista ordinata `*[_type == "trasparenza5x1000"] | order(anno desc)`
 * e mostra una card per ogni anno con importo, firme, breakdown
 * destinazioni, documentazione scaricabile.
 *
 * I dati arrivano dall'Agenzia delle Entrate con ritardo di 2-3 anni
 * sull'anno fiscale di competenza, quindi la pagina prevede empty
 * state nei mesi tra dichiarazione e ricezione.
 */
export const trasparenza5x1000 = defineType({
  name: "trasparenza5x1000",
  title: "Rendicontazione 5×1000",
  type: "document",
  icon: Coins,
  fields: [
    defineField({
      name: "anno",
      title: "Anno fiscale di competenza",
      description:
        "Es. 2023 = scelte fatte nei modelli 730/Redditi del 2024, importo erogato dall'Agenzia delle Entrate nel 2025-2026.",
      type: "number",
      validation: (r) => r.required().min(2020).max(2099),
    }),
    defineField({
      name: "importoRicevuto",
      title: "Importo ricevuto (€)",
      description: "Importo lordo erogato dall'Agenzia delle Entrate.",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "numeroFirme",
      title: "Numero di firme",
      description: "Numero di contribuenti che hanno destinato il 5×1000 al club.",
      type: "number",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "destinazione",
      title: "Destinazione delle somme",
      description:
        "Breakdown dettagliato delle voci di spesa coperte dal contributo. Trasparenza richiesta dal Codice Etico (art. 7.14).",
      type: "array",
      of: [
        {
          type: "object",
          name: "voceSpesa",
          title: "Voce di spesa",
          fields: [
            defineField({
              name: "voce",
              title: "Voce",
              description:
                "Es. 'Materiale tecnico Settore Giovanile', 'Borse di studio atleti meritevoli', 'Manutenzione campo Aldo Porta'.",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "importo",
              title: "Importo (€)",
              type: "number",
              validation: (r) => r.min(0),
            }),
            defineField({
              name: "descrizione",
              title: "Descrizione estesa (opzionale)",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: { title: "voce", subtitle: "importo" },
            prepare: ({ title, subtitle }) => ({
              title,
              subtitle: typeof subtitle === "number" ? `€ ${subtitle}` : "—",
            }),
          },
        },
      ],
    }),
    defineField({
      name: "documentazione",
      title: "Documentazione di rendicontazione",
      description:
        "PDF / scansioni di ricevute, verbali Direttivo, fatture significative. Niente dati sensibili (importi famiglie, ecc.).",
      type: "array",
      of: [{ type: "file", options: { accept: ".pdf,.jpg,.png" } }],
    }),
    defineField({
      name: "note",
      title: "Note pubbliche",
      description:
        "Eventuali note che spiegano scostamenti, ritardi, scelte particolari.",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { anno: "anno", importoRicevuto: "importoRicevuto" },
    prepare: ({ anno, importoRicevuto }) => ({
      title: `5×1000 — ${anno ?? "anno mancante"}`,
      subtitle:
        typeof importoRicevuto === "number"
          ? `€ ${importoRicevuto}`
          : "Importo non valorizzato",
    }),
  },
  orderings: [
    {
      title: "Anno (più recenti)",
      name: "annoDesc",
      by: [{ field: "anno", direction: "desc" }],
    },
  ],
});
