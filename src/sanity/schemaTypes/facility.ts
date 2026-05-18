import { MapPin } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Impianto sportivo del club. Renderizzato sulla pagina
 * /societa/impianti come card editoriale: immagine principale +
 * eyebrow + nome + indirizzo + caratteristiche (lista bullet) +
 * descrizione PortableText + link Google Maps + gallery extra
 * sotto la card.
 *
 * Per aggiungere un nuovo impianto: Studio → Società → Impianti
 * sportivi → '+ Create'. Per modificare: stessa lista, click sul doc.
 */
export const facility = defineType({
  name: "facility",
  title: "Impianto sportivo",
  type: "document",
  icon: MapPin,
  groups: [
    { name: "content", title: "Contenuti", default: true },
    { name: "media", title: "Foto" },
    { name: "config", title: "Configurazione" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nome impianto",
      description:
        "Titolo grande mostrato sulla card (h2). Es. 'Centro Sportivo Aldo Porta'.",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow (oro sopra il nome)",
      description:
        "Testo piccolo gold uppercase mostrato SOPRA il nome dell'impianto. Se lasciato vuoto, il sito usa il default 'Impianto 01' / 'Impianto 02' (numero progressivo basato sull'ordine).",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      description:
        "Identificativo URL-friendly. Lascia che si compili da solo dal nome con il pulsante 'Genera'.",
      type: "slug",
      group: "config",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "address",
      title: "Indirizzo",
      description:
        "Indirizzo completo mostrato sotto il nome, accanto al pin. Es. 'Via Ignazio Silone 4, 10043 Orbassano (TO)'.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "mapsUrl",
      title: "Link Google Maps",
      description:
        "URL completo Google Maps dell'impianto. Lo trovi cliccando 'Condividi → Copia link' dalla scheda Maps. Es. 'https://goo.gl/maps/...'. Genera il pulsante 'Apri su Google Maps' in fondo alla card.",
      type: "url",
      group: "content",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "fields",
      title: "Caratteristiche (lista bullet)",
      description:
        "Una voce per riga. Esempi: '2 campi a 11 regolamentari (uno omologato Serie D)', 'Tribuna, bar, area parcheggio, uffici', 'Sede della Prima Squadra e del Settore Giovanile'. Riordinabili con drag-and-drop.",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "description",
      title: "Descrizione (paragrafi liberi)",
      description:
        "Testo lungo opzionale mostrato sotto le caratteristiche. Supporta paragrafi, grassetto, link. Lasciare vuoto se i campi sopra bastano: la lista bullet copre tipicamente il 90% dei casi.",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "gallery",
      title: "Foto dell'impianto",
      description:
        "La PRIMA foto e' usata come hero della card (16:9). Le successive vengono mostrate come strip 4-up sotto la card. Se nessuna foto e' caricata, viene generato un placeholder gradient col numero dell'impianto.",
      type: "array",
      group: "media",
      options: { layout: "grid" },
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Testo alternativo",
              description:
                "Frase breve che descrive cosa si vede (per screen reader e SEO). Es. 'Vista dall'alto del Centro Sportivo Aldo Porta'.",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Ordine di visualizzazione",
      description:
        "Numero che decide la posizione sulla pagina /societa/impianti (più basso = prima). Es. 0 per il principale, 1 per il secondario.",
      type: "number",
      group: "config",
    }),
    defineField({
      name: "isActive",
      title: "Visibile sul sito",
      description:
        "Disattiva per nascondere l'impianto dalla pagina /societa/impianti senza cancellarlo. Riattivabile in qualsiasi momento (utile per impianti in ristrutturazione, in stand-by, o non piu' usati).",
      type: "boolean",
      group: "config",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "address",
      media: "gallery.0",
      isActive: "isActive",
    },
    prepare: ({ title, subtitle, media, isActive }) => ({
      title: isActive === false ? `${title} (disattivato)` : title,
      subtitle,
      media,
    }),
  },
});
