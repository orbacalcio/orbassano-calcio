import { Coins } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Singleton: contenuti della pagina /scuola-calcio/iscriviti.
 * Documento unico id fisso "academy-iscriviti".
 */
export const academyIscriviti = defineType({
  name: "academyIscriviti",
  title: "Scuola Calcio — Pagina iscrizione",
  type: "document",
  icon: Coins,
  fields: [
    defineField({
      name: "scIscrIntro",
      title: "Intro — paragrafi sopra le quote",
      description:
        "Testo introduttivo della pagina iscrizione (cos'è, come funziona).",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "scIscrQuotaAnnuale",
      title: "Quota annuale (€)",
      description: "Tariffa di iscrizione per la stagione completa.",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "scIscrQuotaIscrizione",
      title: "Quota iscrizione una tantum (€)",
      description:
        "Eventuale quota iscrizione separata dalla quota annuale (può essere 0 o lasciata vuota).",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "scIscrPaymentNote",
      title: "Note pagamento",
      description:
        "Indicazioni per il bonifico, modalità di pagamento, sconti fratelli, eventuali rateizzazioni.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "scIscrModuleFile",
      title: "Modulo iscrizione Scuola Calcio (PDF)",
      description:
        "PDF del modulo da scaricare, compilare, firmare e inviare. Quando esce la stagione successiva basta sostituirlo: l'URL del file resta dinamico.",
      type: "file",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "scIscrIban",
      title: "IBAN per bonifico",
      description: "IBAN del club per il pagamento delle quote.",
      type: "string",
    }),
    defineField({
      name: "scIscrContactEmail",
      title: "Email dedicata iscrizioni",
      description:
        "Indirizzo email a cui inviare modulo compilato e contabile bonifico (es. scuolacalcio@orbassanocalcio.com oppure sgs@orbassanocalcio.com).",
      type: "string",
    }),
    defineField({
      name: "scIscrContactPhone",
      title: "Telefono di riferimento",
      description: "Numero per chiamare/whatsappare per info iscrizione.",
      type: "string",
    }),
    defineField({
      name: "scIscrEnableOnlineForm",
      title: "Abilita form online di iscrizione",
      description:
        "Se DISATTIVATO (default): la pagina mostra solo modulo PDF + bonifico + contatti. Se ATTIVO: viene mostrato anche un form online che invia email al club (richiede sviluppo dedicato, attivare solo dopo aver implementato la route /api/scuola-calcio-iscrizione).",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Scuola Calcio — Pagina iscrizione" }),
  },
});
