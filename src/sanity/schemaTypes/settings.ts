import { Cog } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const settings = defineType({
  name: "settings",
  title: "Impostazioni globali",
  type: "document",
  icon: Cog,
  fieldsets: [
    {
      name: "heroCarousel",
      title: "Carosello hero",
      description:
        "Tempistiche di autoplay e transizione del carosello in homepage. Le singole slide possono sovrascrivere la durata via 'Durata custom' nello schema 'Slide hero homepage'.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "storyNumbers",
      title: 'Box "Storia in numeri" (homepage)',
      description:
        "Eyebrow, titolo e statistiche del box mostrato in homepage tra «Le squadre» e il Manifesto. Consigliate 4 voci, ma il numero è libero.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "teamsCards",
      title: 'Box "Le squadre" (homepage)',
      description:
        "Eyebrow, titolo, sottotitolo e descrizioni delle 3 card numerate (Prima Squadra · Juniores · Settore Giovanile) della sezione TeamsCards in homepage.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "mazzolaBox",
      title: 'Box "Il Mazzola" (pagina Impianti)',
      description:
        "Eyebrow, titolo, paragrafo descrittivo e lista dei campioni che si sono allenati al Mazzola. Mostrato sulla pagina /societa/impianti.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "squadrePage",
      title: "Pagina /squadre — eyebrow e titoli sezioni",
      description:
        "Per ciascuna delle 3 macro-categorie (Prima Squadra · Juniores · Settore Giovanile) imposta l'eyebrow numerato (es. '01 — La punta di diamante') e il titolo h2 della sezione. Le card squadre dentro ogni sezione restano popolate dai documenti 'team'.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "calendarioPage",
      title: "Pagina /calendario — header e 3 box",
      description:
        "Header della pagina (eyebrow, titolo h1, sottotitolo) + le 3 card numerate (Prima Squadra · Juniores · Settore Giovanile) che linkano ai rispettivi calendari. Pattern visivo identico al box 'Le squadre' della homepage.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "biglietteria",
      title: "Biglietteria — prezzi",
      description:
        "Tariffe dei biglietti mostrate nella card 'Tariffe biglietti' della pagina /societa/biglietteria.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Titolo del sito",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description:
        "Breve frase che accompagna il titolo del sito (es. 'Dal 1930 il calcio di Orbassano').",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Immagine OG di default",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroSlideDuration",
      title: "Durata di ogni slide (secondi)",
      description:
        "Tempo per cui ciascuna slide resta visibile prima di passare alla successiva. Default 5s.",
      type: "number",
      initialValue: 5,
      validation: (r) => r.min(2).max(30),
      fieldset: "heroCarousel",
    }),
    defineField({
      name: "heroTransitionDuration",
      title: "Durata transizione (ms)",
      description:
        "Tempo del cross-fade tra una slide e la successiva. Default 300ms (cinematografico). Sotto i 200ms scattante, sopra gli 800ms lento.",
      type: "number",
      initialValue: 300,
      validation: (r) => r.min(100).max(1500),
      fieldset: "heroCarousel",
    }),
    defineField({
      name: "heroAutoplayEnabled",
      title: "Autoplay attivo",
      description:
        "Se disattivato, le slide non avanzano automaticamente: viene mostrata staticamente solo la prima slide attiva.",
      type: "boolean",
      initialValue: true,
      fieldset: "heroCarousel",
    }),
    defineField({
      name: "storyNumbersEyebrow",
      title: "Eyebrow",
      description: 'Testo piccolo sopra il titolo (es. "Storia in numeri").',
      type: "string",
      fieldset: "storyNumbers",
    }),
    defineField({
      name: "storyNumbersTitle",
      title: "Titolo del box",
      description:
        'Es. "Oltre novantacinque anni di rossoblù raccontati in quattro numeri".',
      type: "string",
      fieldset: "storyNumbers",
    }),
    defineField({
      name: "storyNumbersItems",
      title: "Statistiche",
      description:
        "Ogni voce mostra un numero animato + etichetta + descrizione. Riordinabili con drag-and-drop.",
      type: "array",
      fieldset: "storyNumbers",
      of: [
        defineArrayMember({
          type: "object",
          name: "storyNumberItem",
          title: "Statistica",
          fields: [
            defineField({
              name: "value",
              title: "Valore numerico",
              description: "Solo il numero, senza prefissi/suffissi.",
              type: "number",
              validation: (r) => r.required().min(0),
            }),
            defineField({
              name: "prefix",
              title: "Prefisso",
              description: 'Es. "+". Vuoto se non serve.',
              type: "string",
            }),
            defineField({
              name: "suffix",
              title: "Suffisso",
              description: 'Es. "+". Vuoto se non serve.',
              type: "string",
            }),
            defineField({
              name: "label",
              title: "Etichetta breve",
              description: 'Es. "Anni di rossoblù".',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "caption",
              title: "Descrizione",
              description: "1-2 righe sotto l'etichetta.",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: {
              value: "value",
              prefix: "prefix",
              suffix: "suffix",
              label: "label",
              caption: "caption",
            },
            prepare: ({ value, prefix, suffix, label, caption }) => ({
              title: `${prefix ?? ""}${value ?? "?"}${suffix ?? ""} · ${label ?? "(senza etichetta)"}`,
              subtitle: caption ?? "",
            }),
          },
        }),
      ],
    }),
    // --- Box "Le squadre" (TeamsCards homepage) -----------------------------
    defineField({
      name: "teamsCardsEyebrow",
      title: "Eyebrow",
      description: 'Testo piccolo sopra il titolo (es. "Le squadre").',
      type: "string",
      fieldset: "teamsCards",
    }),
    defineField({
      name: "teamsCardsTitle",
      title: "Titolo del box",
      description: 'Es. "Tre realtà, una sola identità".',
      type: "string",
      fieldset: "teamsCards",
    }),
    defineField({
      name: "teamsCardsSubtitle",
      title: "Sottotitolo",
      description:
        '1-2 righe sotto il titolo. Es. "Dalla Prima Squadra al Settore Giovanile...".',
      type: "text",
      rows: 3,
      fieldset: "teamsCards",
    }),
    defineField({
      name: "teamsCardsItems",
      title: "Card (3 voci: Prima Squadra · Juniores · Settore Giovanile)",
      description:
        "Ordine fisso: 01 Prima Squadra · 02 Juniores · 03 Settore Giovanile. I numeri e i link delle card restano hardcoded; titolo e descrizione di ogni card sono modificabili qui.",
      type: "array",
      fieldset: "teamsCards",
      of: [
        defineArrayMember({
          type: "object",
          name: "teamsCardItem",
          title: "Card",
          fields: [
            defineField({
              name: "title",
              title: "Titolo card",
              description: 'Es. "Prima Squadra" / "Juniores" / "Settore Giovanile".',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Descrizione",
              description: "1-3 righe sotto il titolo della card.",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        }),
      ],
      validation: (r) =>
        r
          .max(3)
          .warning(
            "Il layout TeamsCards è progettato per 3 card. Aggiungerne di più rompe la grid.",
          ),
    }),
    // --- Pagina /squadre — eyebrow e titoli sezioni -------------------------
    defineField({
      name: "squadrePageSections",
      title: "Sezioni della pagina /squadre (3 voci ordinate)",
      description:
        "Per ogni macro-categoria scegli la 'Categoria' (Prima Squadra / Juniores / Settore Giovanile), l'eyebrow editoriale numerato e il titolo h2. Le card delle squadre vengono filtrate automaticamente in base alla categoria. Riordinabili con drag-and-drop.",
      type: "array",
      fieldset: "squadrePage",
      of: [
        defineArrayMember({
          type: "object",
          name: "squadrePageSection",
          title: "Sezione",
          fields: [
            defineField({
              name: "category",
              title: "Categoria",
              description:
                "Chiave usata per filtrare le squadre da mostrare nella sezione. Deve corrispondere ESATTAMENTE al valore 'category' dei documenti team (Prima Squadra / Juniores / Settore Giovanile).",
              type: "string",
              options: {
                list: [
                  { title: "Prima Squadra", value: "Prima Squadra" },
                  { title: "Juniores", value: "Juniores" },
                  { title: "Settore Giovanile", value: "Settore Giovanile" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "eyebrow",
              title: "Eyebrow",
              description:
                "Riga piccola sopra il titolo, in gold uppercase. Esempi: '01 — La punta di diamante', '02 — Il ponte verso il senior', '03 — Da qui passa il futuro'.",
              type: "string",
              validation: (r) => r.required().max(80),
            }),
            defineField({
              name: "title",
              title: "Titolo (h2)",
              description:
                "Titolo grande della sezione mostrato sotto l'eyebrow (es. 'Prima Squadra').",
              type: "string",
              validation: (r) => r.required().max(60),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "eyebrow" },
          },
        }),
      ],
      validation: (r) =>
        r
          .max(3)
          .warning(
            "La pagina /squadre è tarata su 3 macro-categorie (Prima Squadra · Juniores · Settore Giovanile).",
          ),
    }),
    // --- Pagina /calendario — header e 3 box --------------------------------
    defineField({
      name: "calendarioPageEyebrow",
      title: "Eyebrow",
      description: "Testo piccolo gold sopra il titolo (es. 'Calendari').",
      type: "string",
      fieldset: "calendarioPage",
    }),
    defineField({
      name: "calendarioPageTitle",
      title: "Titolo h1",
      description: "Titolone gigante della pagina (es. 'Tutte le partite di tutte le squadre').",
      type: "string",
      fieldset: "calendarioPage",
    }),
    defineField({
      name: "calendarioPageSubtitle",
      title: "Sottotitolo",
      description: "1-3 righe sotto il titolo. Inviata sul motivo della pagina.",
      type: "text",
      rows: 3,
      fieldset: "calendarioPage",
    }),
    defineField({
      name: "calendarioPageSections",
      title: "Card calendari (3 voci: Prima Squadra · Juniores · Settore Giovanile)",
      description:
        "Le 3 card numerate 01/02/03 della pagina. Per ognuna scegli la 'Categoria' (determina il link) e popola eyebrow + titolo + descrizione. Riordinabili con drag-and-drop. Lasciare vuoto = uso fallback hardcoded.",
      type: "array",
      fieldset: "calendarioPage",
      of: [
        defineArrayMember({
          type: "object",
          name: "calendarioPageSection",
          title: "Card calendario",
          fields: [
            defineField({
              name: "category",
              title: "Categoria",
              description:
                "Determina il link della card. Prima Squadra → calendario Prima Squadra · Juniores → calendario Juniores · Settore Giovanile → pagina aggregata con tutti i calendari del settore giovanile.",
              type: "string",
              options: {
                list: [
                  { title: "Prima Squadra", value: "Prima Squadra" },
                  { title: "Juniores", value: "Juniores" },
                  { title: "Settore Giovanile", value: "Settore Giovanile" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "eyebrow",
              title: "Eyebrow numerato",
              description:
                "Es. '01 — Calendario senior' / '02 — Juniores Under 19' / '03 — Settore Giovanile U14-U17'.",
              type: "string",
              validation: (r) => r.required().max(80),
            }),
            defineField({
              name: "title",
              title: "Titolo card (h3)",
              description: "Es. 'Prima Squadra'.",
              type: "string",
              validation: (r) => r.required().max(60),
            }),
            defineField({
              name: "description",
              title: "Descrizione",
              description: "1-3 righe sotto il titolo della card.",
              type: "text",
              rows: 3,
              validation: (r) => r.required().max(280),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "eyebrow" },
          },
        }),
      ],
      validation: (r) =>
        r.max(3).warning("La pagina /calendario è tarata su 3 card."),
    }),
    // --- Box "Il Mazzola" (pagina Impianti) ---------------------------------
    defineField({
      name: "mazzolaEyebrow",
      title: "Eyebrow",
      description: 'Es. "Il Mazzola" (testo piccolo gold sopra il titolo).',
      type: "string",
      fieldset: "mazzolaBox",
    }),
    defineField({
      name: "mazzolaTitle",
      title: "Titolo del box",
      description:
        'Es. "Sul nostro stadio si sono allenati i campioni". Newline ammessi per andare a capo.',
      type: "text",
      rows: 3,
      fieldset: "mazzolaBox",
    }),
    defineField({
      name: "mazzolaBody",
      title: "Paragrafo descrittivo",
      description:
        "Testo lungo che descrive il contesto storico del Mazzola, gli allenamenti di Torino/Juventus, ecc.",
      type: "text",
      rows: 8,
      fieldset: "mazzolaBox",
    }),
    defineField({
      name: "mazzolaPlayers",
      title: "Campioni che si sono allenati",
      description:
        "Lista nomi mostrata in fondo al box come card senza numerazione. Riordinabili con drag-and-drop.",
      type: "array",
      fieldset: "mazzolaBox",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "currentSeason",
      title: "Stagione corrente",
      type: "string",
      description: "Es. '2025/2026'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "currentLeague",
      title: "Categoria corrente",
      type: "string",
      description: "Es. 'Promozione Piemonte VdA'",
    }),
    defineField({
      name: "currentGroup",
      title: "Girone corrente",
      type: "string",
      description: "Es. 'Girone B'",
    }),
    defineField({
      name: "social",
      title: "Social media",
      description:
        "X / Twitter rimosso 2026-05-17 (il club non presidia più la piattaforma). I documenti già salvati potrebbero ancora avere il campo `twitter`: viene ignorato dal sito ma puoi pulirlo dal dataset con uno sweep di sanity exec.",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "facebook", type: "url" }),
        defineField({ name: "youtube", type: "url" }),
        defineField({ name: "tiktok", type: "url" }),
        defineField({ name: "threads", type: "url" }),
      ],
    }),
    defineField({
      name: "sprintsportLinks",
      title: "Link Sprintesport",
      description:
        "Link esterni a classifica/calendario/statistiche del campionato.",
      type: "object",
      fields: [
        defineField({ name: "classifica", type: "url" }),
        defineField({ name: "calendario", type: "url" }),
        defineField({ name: "statistiche", type: "url" }),
      ],
    }),
    defineField({
      name: "contactInfo",
      title: "Contatti",
      type: "object",
      fields: [
        defineField({ name: "email", type: "string" }),
        defineField({ name: "pec", type: "string" }),
        defineField({ name: "phone", type: "string" }),
        defineField({ name: "address", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "legalInfo",
      title: "Dati legali",
      type: "object",
      fields: [
        defineField({ name: "vatNumber", title: "P.IVA", type: "string" }),
        defineField({ name: "fiscalCode", title: "Codice Fiscale", type: "string" }),
        defineField({ name: "iban", type: "string" }),
        defineField({ name: "figcMatricola", type: "string" }),
      ],
    }),
    defineField({
      name: "ticketPrices",
      title: "Prezzi biglietti",
      fieldset: "biglietteria",
      description:
        "Tariffe mostrate nella card 'Tariffe biglietti' di /societa/biglietteria. Una riga per categoria. Se lasci vuoto, vengono usati i prezzi di default (Prima Squadra 10€, Juniores e Settore Giovanile Scolastico 7€).",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "ticketTier",
          fields: [
            defineField({
              name: "label",
              title: "Categoria / descrizione",
              description:
                "Es. 'Prima Squadra', 'Juniores e Settore Giovanile Scolastico', 'Ridotto'.",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "price",
              title: "Prezzo",
              description: "Es. '10€', '7€', 'Gratuito'. Scrivi anche il simbolo €.",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "price" },
          },
        }),
      ],
    }),
    defineField({
      name: "registrationFormFile",
      title: "Modulo iscrizione Settore Giovanile (PDF)",
      description:
        "PDF del modulo da scaricare e firmare per iscriversi al Settore Giovanile Scolastico. Caricalo qui per attivare il pulsante 'Scarica modulo iscrizione' nella pagina /settore-giovanile/summer-camp. Quando esce la stagione successiva basta sostituirlo: l'URL del file resta dinamico.",
      type: "file",
      options: { accept: "application/pdf" },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Impostazioni globali" }),
  },
});
