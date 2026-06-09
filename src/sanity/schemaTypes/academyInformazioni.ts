import { MapPin } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Singleton: contenuti della pagina /squadre/academy/informazioni.
 * Documento unico id fisso "academy-informazioni".
 */
export const academyInformazioni = defineType({
  name: "academyInformazioni",
  title: "Academy — Informazioni",
  type: "document",
  icon: MapPin,
  fields: [
    defineField({
      name: "scInfoHeroPitch",
      title: "Hero — pitch sotto al titolo",
      description:
        "Frase di 1-2 righe sotto il titolo h1 della pagina /informazioni. Es. 'Una stagione da rossoblù al Centro Sportivo Aldo Porta'.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "scInfoAgeRange",
      title: "Età ammesse (label)",
      description:
        "Es. 'Dai 5 ai 13 anni'. Mostrato come stat insieme al numero max gruppo.",
      type: "string",
    }),
    defineField({
      name: "scInfoMaxGroup",
      title: "Massimo per gruppo",
      description:
        "Numero massimo di bambini per gruppo di allenamento (es. 15).",
      type: "number",
      validation: (r) => r.min(1).max(50),
    }),
    defineField({
      name: "scInfoDiscounts",
      title: "Sconti famiglie / early-bird",
      description:
        "Lista sconti applicabili (es. Sconto fratelli -10%, Iscrizione anticipata entro 15 lug -5%).",
      type: "array",
      of: [
        defineField({
          name: "discount",
          title: "Sconto",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Nome sconto",
              type: "string",
              description: "Es. 'Sconto fratelli', 'Iscrizione anticipata'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "value",
              title: "Valore",
              type: "string",
              description: "Es. '-10%', '-€30', '50% sulla seconda quota'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "condition",
              title: "Condizione",
              type: "string",
              description:
                "Es. 'Sulla seconda quota', 'Iscritti entro il 15 luglio', 'Famiglie 3+ figli'.",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
    }),
    defineField({
      name: "scInfoPayments",
      title: "Timeline pagamenti / scadenze",
      description:
        "Calendario delle scadenze di pagamento (es. iscrizione settembre, saldo gennaio).",
      type: "array",
      of: [
        defineField({
          name: "payment",
          title: "Scadenza",
          type: "object",
          fields: [
            defineField({
              name: "milestone",
              title: "Milestone",
              type: "string",
              description:
                "Es. 'All'iscrizione', 'Entro 31 gennaio', 'Saldo finale'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "deadline",
              title: "Scadenza (label)",
              type: "string",
              description:
                "Es. 'Settembre 2026', 'Entro 31 gen 2027', '30 giorni dall'iscrizione'.",
            }),
            defineField({
              name: "amount",
              title: "Importo / percentuale",
              type: "string",
              description: "Es. '50% della quota annuale', '€175'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "note",
              title: "Nota",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "milestone", subtitle: "amount" },
          },
        }),
      ],
    }),
    defineField({
      name: "scInfoCancellation",
      title: "Politica di cancellazione",
      description:
        "Cosa succede se il bambino si ritira dall'Academy. Rimborso, percentuale trattenuta, casi medici, scadenze.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "scInfoContactEmail",
      title: "Email contatti diretti pagina informazioni",
      description:
        "Email mostrata nella sezione 'Contatti' della pagina /informazioni.",
      type: "string",
    }),
    defineField({
      name: "scInfoContactPhone",
      title: "Telefono contatti diretti pagina informazioni",
      description: "Numero diretto/whatsapp visibile in fondo pagina.",
      type: "string",
    }),
    defineField({
      name: "scInfoVenueName",
      title: "Sede — nome",
      type: "string",
      initialValue: "Centro Sportivo Aldo Porta",
    }),
    defineField({
      name: "scInfoVenueAddress",
      title: "Sede — indirizzo",
      description: "Indirizzo completo (via, civico, CAP, città).",
      type: "string",
    }),
    defineField({
      name: "scInfoMapsUrl",
      title: "Sede — link Google Maps",
      description: "URL pubblico Google Maps (Apri in Maps).",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"], allowRelative: false }),
    }),
    defineField({
      name: "scInfoIncluded",
      title: "Cosa è incluso nell'iscrizione",
      description:
        "Lista di voci incluse (es. 'Kit completo', 'Assicurazione FIGC', 'Tessera FIGC').",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "scInfoPriceTable",
      title: "Tabella prezzi",
      description:
        "Coppie label/valore (es. 'Quota annuale' / '€450', 'Sconto fratelli' / '-10%').",
      type: "array",
      of: [
        defineField({
          name: "priceRow",
          title: "Riga prezzo",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Voce",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "value",
              title: "Valore",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({
      name: "scInfoFaq",
      title: "FAQ — info pratiche",
      description:
        "FAQ specifiche per la pagina /informazioni (logistica, equipaggiamento, presenza/assenze).",
      type: "array",
      of: [
        defineField({
          name: "faqItem",
          title: "Domanda",
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Domanda",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "answer",
              title: "Risposta",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Academy — Informazioni" }),
  },
});
