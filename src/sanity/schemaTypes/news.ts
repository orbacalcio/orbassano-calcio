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
 *   slugify è centralizzato in `sanity/lib/slugify.ts`.
 * - `author` initialValue "Orbassano Calcio": ogni nuova news parte
 *   con questo valore, l'admin può cambiarlo per pezzi firmati.
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
        "URL all'articolo originale su una testata esterna (es. sprintesport.it). Se valorizzato, sotto il corpo dell'articolo appare il CTA \"LEGGI L'ARTICOLO ORIGINALE\". Lascia vuoto se la news è nativa del sito.",
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
      name: "video",
      title: "Video (Cloudinary)",
      description:
        "Carica un video su Cloudinary cliccando 'Browse Cloudinary library' (mp4, mov, webm). LIMITE FREE TIER: 100 MB per file. Se il video supera il limite, comprimilo prima con HandBrake (preset 'Web → Vimeo YouTube HQ 1080p60', bitrate ~5000 kbps) o con ffmpeg ('ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4'). Una partita di 30 min in 1080p sta tipicamente sotto 80 MB con questa compressione. Il video viene mostrato nella pagina news SOPRA la galleria foto, con player HTML5 nativo (controls, autoplay disattivato, poster auto-generato). Lascia vuoto se non c'è video.",
      type: "cloudinary.asset",
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
        "OFF di default: attivalo SOLO se vuoi che, alla pubblicazione, questo articolo venga inviato via email agli iscritti newsletter (Brevo). Lascia spento per articoli marginali (es. errata corrige, post tecnici).",
      type: "boolean",
      initialValue: false,
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
