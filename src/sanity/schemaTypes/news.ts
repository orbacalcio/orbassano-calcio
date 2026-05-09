import { Newspaper } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Schema News.
 *
 * Punti notevoli:
 * - `slug` con `source: "title"` + `slugify` custom: pulsante "Genera"
 *   nello Studio crea uno slug pulito (lowercase, accenti normalizzati,
 *   trattini, cap 96 char). L'utente puo' sempre sovrascrivere a mano.
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
        "URL della news. Premi «Genera» per crearlo automaticamente dal titolo, oppure scrivilo a mano.",
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
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
