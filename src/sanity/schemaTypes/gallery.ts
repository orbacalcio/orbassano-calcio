import { Images } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Galleria fotografica (album) — pagina /news/gallery (index mosaic)
 * + /news/gallery/[slug] (viewer dell'album).
 *
 * Pattern juventus.com: ogni album e' un evento/momento (es. "Gallery
 * | Prima Squadra | Juventus-Lecce", "Allenamento pre-partita") con
 * cover dedicata e dentro N foto. Mostriamo 20 album per batch
 * nell'index, pulsante "Carica altri" per il batch successivo.
 *
 * Ordinamento di default per `uploadedAt` discendente (gallerie piu'
 * recenti in alto). Campo `ordering` (number, opzionale) per pin
 * manuale di un album in cima (es. galleria storica, evento speciale).
 *
 * Asset upload manuale dallo Studio (cover + foto), niente seed
 * automatico — rischio incidente cancellazione asset, lesson learned
 * dai loghi sponsor (10/05/2026).
 */
export const gallery = defineType({
  name: "gallery",
  title: "Galleria fotografica",
  type: "document",
  icon: Images,
  fieldsets: [
    {
      name: "meta",
      title: "Metadati album",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contenuto",
      title: "Contenuto fotografico",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "extra",
      title: "Pin manuale & categoria",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titolo album",
      description:
        "Es. 'Gallery | Prima Squadra | Juventus-Inter' oppure 'Allenamento pre-partita'. Mostrato sotto la cover nel mosaic.",
      type: "string",
      fieldset: "meta",
      validation: (r) => r.required().min(5).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      fieldset: "meta",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "uploadedAt",
      title: "Data e ora di caricamento",
      description:
        "Default: data e ora attuali. Modificabile per riposizionare un album piu' vecchio o per data storica. L'ordinamento gallery si basa su questo campo (desc).",
      type: "datetime",
      fieldset: "meta",
      validation: (r) => r.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover (immagine di copertina)",
      description:
        "L'immagine che rappresenta l'album nel mosaic /news/gallery. Scegli quella piu' forte/iconica del set.",
      type: "image",
      fieldset: "contenuto",
      options: { hotspot: true, accept: "image/*" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coverAlt",
      title: "Testo alternativo della cover",
      description: "Descrizione breve per a11y + SEO (8-200 caratteri).",
      type: "string",
      fieldset: "contenuto",
      validation: (r) =>
        r
          .required()
          .min(8)
          .max(200)
          .warning("Tieni l'alt tra 8 e 200 caratteri."),
    }),
    defineField({
      name: "images",
      title: "Immagini dell'album",
      description:
        "Le foto contenute nella galleria. Ordine = ordine di visualizzazione nel viewer. La cover puo' anche essere ripetuta qui se vuoi mostrarla nel set.",
      type: "array",
      fieldset: "contenuto",
      of: [
        {
          type: "image",
          options: { hotspot: true, accept: "image/*" },
          fields: [
            defineField({
              name: "alt",
              title: "Testo alternativo (a11y + SEO)",
              type: "string",
              validation: (r) =>
                r
                  .required()
                  .min(8)
                  .max(200)
                  .warning("Tieni l'alt tra 8 e 200 caratteri."),
            }),
            defineField({
              name: "caption",
              title: "Didascalia (opzionale)",
              description: "Mostrata sotto la foto nel viewer.",
              type: "string",
            }),
          ],
        },
      ],
      validation: (r) =>
        r
          .min(1)
          .warning("Album senza foto: aggiungine almeno 1 prima di pubblicare."),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      fieldset: "extra",
      options: {
        list: [
          { title: "Partita", value: "match" },
          { title: "Allenamento", value: "training" },
          { title: "Evento sociale", value: "event" },
          { title: "Settore Giovanile", value: "youth" },
          { title: "Squadra / Posato", value: "team" },
          { title: "Storia / Archivio", value: "archive" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "ordering",
      title: "Pin order (opzionale)",
      description:
        "Numero piu' alto = piu' in alto. Lascialo vuoto, l'album va in ordine cronologico. Usa solo per pinnare un album in cima (es. evento speciale).",
      type: "number",
      fieldset: "extra",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "uploadedAt",
      media: "coverImage",
      images: "images",
    },
    prepare({ title, subtitle, media, images }) {
      const date = subtitle
        ? new Date(subtitle).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";
      const count = Array.isArray(images) ? images.length : 0;
      return {
        title: title ?? "Senza titolo",
        subtitle: `${date} · ${count} foto`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Caricamento (recente prima)",
      name: "uploadedAtDesc",
      by: [{ field: "uploadedAt", direction: "desc" }],
    },
    {
      title: "Pin order (manuale)",
      name: "orderingDesc",
      by: [
        { field: "ordering", direction: "desc" },
        { field: "uploadedAt", direction: "desc" },
      ],
    },
  ],
});
