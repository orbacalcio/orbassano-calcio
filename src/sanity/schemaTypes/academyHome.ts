import { School } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Singleton: contenuti della home Scuola Calcio (/scuola-calcio).
 * Documento unico con id fisso "academy-home" — il sidebar Studio
 * lo espone come voce dedicata sotto top-level "Scuola Calcio".
 *
 * I field name (scXxx) restano legacy per ridurre churn dei
 * fetcher TypeScript già scritti su `ScuolaCalcioHomeData` —
 * sono solo identifier interni Sanity, non user-visible.
 */
export const academyHome = defineType({
  name: "academyHome",
  title: "Scuola Calcio — Pagina home",
  type: "document",
  icon: School,
  fields: [
    defineField({
      name: "scHeroImage",
      title: "Hero — immagine di sfondo",
      description:
        "Foto in cima alla pagina /scuola-calcio (es. bambini in allenamento). Se vuota, viene usato il fallback navy + stemma + pitch lines.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHeroEyebrow",
      title: "Hero — eyebrow",
      description:
        "Frase corta sopra il titolo h1 (es. 'Scuola Calcio'). Visualizzata in oro maiuscolo tracking ampio.",
      type: "string",
    }),
    defineField({
      name: "scHeroTitle",
      title: "Hero — titolo H1",
      description: "Titolo principale della landing (es. 'Cresciamo insieme').",
      type: "string",
    }),
    defineField({
      name: "scIntroBlocks",
      title: "Intro — paragrafi descrittivi",
      description:
        "Sezione testo sotto l'hero. Spiega in 2-3 paragrafi cos'è la Scuola Calcio dell'Orbassano, valori, approccio. Supporta grassetto/corsivo/link.",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "scUspCards",
      title: "USP — 4 card valori",
      description:
        "4 card numerate con i punti di forza della Scuola Calcio (es. 'Tecnici qualificati FIGC', 'Sicurezza prima di tutto', 'Gioco + crescita personale', 'Kit incluso').",
      type: "array",
      validation: (r) => r.max(4),
      of: [
        defineField({
          name: "uspCard",
          title: "Card",
          type: "object",
          fields: [
            defineField({
              name: "number",
              title: "Numero (es. '01')",
              type: "string",
              validation: (r) => r.required(),
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
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "number" } },
        }),
      ],
    }),
    defineField({
      name: "scHubBox1Image",
      title: 'Hub 4-box · 1 "Iscriviti" — immagine',
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHubBox2Image",
      title: 'Hub 4-box · 2 "Programma" — immagine',
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHubBox3Image",
      title: 'Hub 4-box · 3 "Informazioni" — immagine',
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHubBox4Image",
      title: 'Hub 4-box · 4 "FAQ" — immagine',
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scFaq",
      title: "FAQ — domande frequenti",
      description:
        "Domande e risposte mostrate in sezione accordion in fondo alla home (id ancorato #faq, raggiungibile dal box hub 4).",
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
    prepare: () => ({ title: "Scuola Calcio — Pagina home" }),
  },
});
