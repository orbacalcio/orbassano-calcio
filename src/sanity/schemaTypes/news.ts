import { Newspaper } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { AutoSlugInput } from "@/sanity/components/AutoSlugInput";
import { slugifyTitle } from "@/sanity/lib/slugify";

/**
 * Schema News.
 *
 * Punti notevoli:
 * - `slug` con custom input `AutoSlugInput`: auto-popola dal titolo
 *   in real-time mentre l'utente scrive, senza bisogno di premere
 *   "Genera". Resta sempre il bottone manuale come fallback. Il
 *   slugify e' centralizzato in `sanity/lib/slugify.ts`.
 * - `author` initialValue "Orbassano Calcio": ogni nuova news parte
 *   con questo valore, l'admin puo' cambiarlo per pezzi firmati.
 * - `body` con annotation `link` esplicita: gli hyperlink inseriti
 *   nello Studio sono cliccabili lato sito (renderer in
 *   `PortableTextBody`).
 * - `gallery`: array immagini extra (max 3) oltre alla cover. Il
 *   componente client `NewsGallery` apre un lightbox al click.
 */
export const news = defineType({
  name: "news",
  title: "News",
  type: "document",
  icon: Newspaper,
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "URL della news: si compila da solo mentre scrivi il titolo. Sovrascrivibile a mano.",
      options: {
        source: "title",
        maxLength: 96,
        slugify: slugifyTitle,
      },
      components: {
        input: AutoSlugInput,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          "Prima Squadra",
          "Settore Giovanile",
          "Scuola Calcio",
          "Società",
          "Sponsor",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Pubblicato il",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cover",
      title: "Copertina",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Testo alternativo",
          description:
            "Descrive la foto per chi usa screen reader o quando l'immagine non carica.",
        }),
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Estratto",
      type: "text",
      rows: 3,
      validation: (r) => r.max(280),
    }),
    defineField({
      name: "originalArticleUrl",
      title: "Link articolo originale",
      description:
        "URL all'articolo originale su una testata esterna (es. sprintesport.it). Se valorizzato, sotto il corpo dell'articolo appare il CTA \"PER LEGGERE L'ARTICOLO ORIGINALE CLICCA QUI\". Lascia vuoto se la news e' nativa del sito.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "body",
      title: "Corpo",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          marks: {
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (r) =>
                      r.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: true,
                      }),
                  }),
                  defineField({
                    name: "blank",
                    title: "Apri in una nuova scheda",
                    type: "boolean",
                    initialValue: true,
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Testo alternativo",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video (URL YouTube o Vimeo)",
      description:
        "URL completo di un video YouTube (es. https://www.youtube.com/watch?v=...) o Vimeo (es. https://vimeo.com/...). Il video viene mostrato nella pagina news SOPRA la galleria foto. Lascia vuoto se non c'e' video.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "gallery",
      title: "Foto extra (max 3)",
      description:
        "Fino a 3 foto aggiuntive oltre alla copertina. Si aprono in lightbox al click.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Testo alternativo",
            }),
            defineField({
              name: "caption",
              type: "string",
              title: "Didascalia",
            }),
          ],
        }),
      ],
      validation: (r) =>
        r.max(3).warning("Massimo 3 foto extra (oltre alla copertina)."),
    }),
    defineField({
      name: "author",
      title: "Autore",
      type: "string",
      description:
        "Default: Orbassano Calcio. Sovrascrivi per articoli firmati (es. nome del giornalista).",
      initialValue: "Orbassano Calcio",
    }),
    defineField({
      name: "isPinned",
      title: "Articolo in evidenza",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sendToNewsletter",
      title: "Invia alla newsletter",
      description:
        "Quando pubblichi questo articolo, viene inviato via email agli iscritti newsletter (Brevo). Disattiva per articoli marginali (es. errata corrige, post tecnici).",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "dispatchedAt",
      title: "Inviato alla newsletter il",
      description:
        "Si valorizza in automatico dopo l'invio Brevo, evita doppi invii. Cancellalo se vuoi rinviare manualmente l'articolo.",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "cover",
    },
  },
  orderings: [
    {
      title: "Pubblicazione (più recenti)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
