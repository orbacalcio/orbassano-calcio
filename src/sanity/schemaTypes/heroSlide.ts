import { Image as ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Slide del carosello hero homepage.
 *
 * Spec da docs/LAYOUT_NAVIGATION.md §3.3 + estensione 2026-05-08:
 * - 4-6 foto curate del club (squadra, partite, allenamenti, stadio)
 * - Risoluzione raccomandata sorgente: 2400×1350 (16:9)
 * - Pattern editoriale juventus.com: ogni slide porta il proprio set
 *   testuale (eyebrow / headline / subhead / cta) sincronizzato con
 *   l'immagine. Il rendering nasconde i sotto-elementi vuoti, quindi
 *   solo headline è obbligatorio (ma una slide minimal con sola
 *   headline è un caso valido).
 *
 * Ordine dei campi: i campi testuali vengono PRIMA di image perché
 * editorialmente è il messaggio a guidare la scelta della foto, non
 * il contrario.
 */
export const heroSlide = defineType({
  name: "heroSlide",
  title: "Slide hero homepage",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titolo interno",
      description:
        "Solo per riconoscere la slide nello Studio. Non viene mostrato sul sito.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow (testo piccolo sopra il titolo)",
      description:
        "Riga in oro tracciata sopra la headline. Es. 'STAGIONE 2026/27 · PRIMA CATEGORIA'. Opzionale.",
      type: "string",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "headline",
      title: "Titolo principale (H1)",
      description:
        "Massimo 5-6 parole. Big Shoulders Display, distribuito su 2-3 righe naturali (premi Invio per andare a capo). L'ultima riga viene colorata in oro automaticamente se >=2 righe.",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "subhead",
      title: "Sottotitolo",
      description: "Una riga di contesto, opzionale. Massimo 200 caratteri.",
      type: "text",
      rows: 2,
      validation: (r) => r.max(200),
    }),
    defineField({
      name: "ctaLabel",
      title: "Testo bottone CTA",
      description: "Etichetta del bottone. Lascia vuoto per nascondere il bottone.",
      type: "string",
      validation: (r) => r.max(30),
    }),
    defineField({
      name: "ctaLink",
      title: "Link CTA",
      description:
        "URL relativo (es. /societa/storia) o assoluto. Richiesto se 'Testo bottone CTA' è compilato.",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Testo alternativo (accessibilità)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "credits",
      title: "Crediti foto",
      type: "string",
    }),
    defineField({
      name: "isActive",
      title: "Attiva nel carosello",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Ordine",
      type: "number",
    }),
    defineField({
      name: "customDuration",
      title: "Durata custom per questa slide (opzionale)",
      description:
        "Sovrascrive la durata globale solo per questa slide. Lascia vuoto per usare la durata di default. Utile se una slide ha più testo da leggere.",
      type: "number",
      validation: (r) => r.min(2).max(30),
    }),
  ],
  preview: {
    select: {
      title: "title",
      headline: "headline",
      isActive: "isActive",
      media: "image",
    },
    prepare({ title, headline, isActive, media }) {
      const status = isActive === false ? "Disattivata" : "Attiva";
      const subtitle = headline
        ? `${status} — "${headline.split("\n")[0]}"`
        : `${status} — testi non compilati`;
      return { title, subtitle, media };
    },
  },
  orderings: [
    {
      title: "Ordine manuale",
      name: "manual",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
