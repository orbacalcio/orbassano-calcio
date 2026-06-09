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
    {
      name: "primaSquadraHub",
      title: 'Pagina "Prima Squadra" (hub 4 box)',
      description:
        "Immagini di sfondo dei 4 box (La Rosa · Le ultime news · Calendario e risultati · Classifica) della pagina /squadre/prima-squadra e link esterno alla classifica.",
      options: { collapsible: true, collapsed: true },
    },
    // ── Scuola Calcio: 4 fieldset (una per pagina), pattern Toro Camp ──
    {
      name: "scuolaCalcioHome",
      title: "Pagina /squadre/scuola-calcio — home",
      description:
        "Hero, intro, 4 USP card, immagini dei 4 box hub (Iscriviti · Programma · Informazioni · FAQ) e domande frequenti della landing principale della Scuola Calcio.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "scuolaCalcioIscriviti",
      title: "Pagina /squadre/scuola-calcio/iscriviti",
      description:
        "Quota annuale, quota iscrizione, note bonifico, IBAN, contatti dedicati, PDF del modulo iscrizione, flag per abilitare un form online (default: solo PDF + email + bonifico).",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "scuolaCalcioProgramma",
      title: "Pagina /squadre/scuola-calcio/programma",
      description:
        "Timeline settimanale allenamenti, fasce di età con focus tecnico e staff coach con qualifiche FIGC.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "scuolaCalcioInformazioni",
      title: "Pagina /squadre/scuola-calcio/informazioni",
      description:
        "Sede + mappa, tabella prezzi, cosa è incluso nell'iscrizione, FAQ pratiche.",
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
      name: "sponsorStats",
      title: "Pagina Opportunità — Box numeri",
      description:
        "I numeri della fascia statistiche di /sponsor/opportunita (valore + etichetta), nell'ordine di visualizzazione. Se lasci vuoto, vengono usati i valori di default.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "sponsorStat",
          fields: [
            defineField({
              name: "value",
              title: "Valore",
              description: "Es. '23', '120+', '30K+'.",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Etichetta",
              description:
                "Es. 'Atleti prima squadra', 'Visualizzazioni social / mese'.",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        }),
      ],
    }),
    defineField({
      name: "psHubHeroImage",
      title: "Hero — immagine di sfondo",
      fieldset: "primaSquadraHub",
      description:
        "Immagine grande in cima alla pagina Prima Squadra (es. stadio/tifo), con sopra il titolo 'Prima Squadra'.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "psHubRosaImage",
      title: 'Box "La Rosa" — immagine',
      fieldset: "primaSquadraHub",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "psHubNewsImage",
      title: 'Box "Le ultime news" — immagine',
      fieldset: "primaSquadraHub",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "psHubCalendarioImage",
      title: 'Box "Calendario e risultati" — immagine',
      fieldset: "primaSquadraHub",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "psHubClassificaImage",
      title: 'Box "Classifica" — immagine',
      fieldset: "primaSquadraHub",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "psClassificaUrl",
      title: "Classifica — link esterno",
      fieldset: "primaSquadraHub",
      description:
        "URL alla classifica del campionato (es. Tuttocampo / FIGC). Il box 'Classifica' linka qui. Se vuoto, il box rimanda alla pagina calendario.",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"], allowRelative: false }),
    }),
    defineField({
      name: "registrationFormFile",
      title: "Modulo iscrizione Settore Giovanile (PDF)",
      description:
        "PDF del modulo da scaricare e firmare per iscriversi al Settore Giovanile Scolastico. Caricalo qui per attivare il pulsante 'Scarica modulo iscrizione' nella pagina /settore-giovanile/summer-camp. Quando esce la stagione successiva basta sostituirlo: l'URL del file resta dinamico.",
      type: "file",
      options: { accept: "application/pdf" },
    }),

    // ════════════════════════════════════════════════════════════════
    // SCUOLA CALCIO — pagina home
    // ════════════════════════════════════════════════════════════════
    defineField({
      name: "scHeroImage",
      title: "Hero — immagine di sfondo",
      fieldset: "scuolaCalcioHome",
      description:
        "Foto in cima alla pagina /squadre/scuola-calcio (es. bambini in allenamento). Se vuota, viene usato il fallback navy + stemma + pitch lines.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHeroEyebrow",
      title: "Hero — eyebrow",
      fieldset: "scuolaCalcioHome",
      description:
        "Frase corta sopra il titolo h1 (es. 'Scuola Calcio'). Visualizzata in oro maiuscolo tracking ampio.",
      type: "string",
    }),
    defineField({
      name: "scHeroTitle",
      title: "Hero — titolo H1",
      fieldset: "scuolaCalcioHome",
      description: "Titolo principale della landing (es. 'Cresciamo insieme').",
      type: "string",
    }),
    defineField({
      name: "scIntroBlocks",
      title: "Intro — paragrafi descrittivi",
      fieldset: "scuolaCalcioHome",
      description:
        "Sezione testo sotto l'hero. Spiega in 2-3 paragrafi cos'è la Scuola Calcio Orbassano, valori, approccio. Supporta grassetto/corsivo/link.",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "scUspCards",
      title: "USP — 4 card valori",
      fieldset: "scuolaCalcioHome",
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
      fieldset: "scuolaCalcioHome",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHubBox2Image",
      title: 'Hub 4-box · 2 "Programma" — immagine',
      fieldset: "scuolaCalcioHome",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHubBox3Image",
      title: 'Hub 4-box · 3 "Informazioni" — immagine',
      fieldset: "scuolaCalcioHome",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scHubBox4Image",
      title: 'Hub 4-box · 4 "FAQ" — immagine',
      fieldset: "scuolaCalcioHome",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "scFaq",
      title: "FAQ — domande frequenti",
      fieldset: "scuolaCalcioHome",
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

    // ════════════════════════════════════════════════════════════════
    // SCUOLA CALCIO — pagina /iscriviti
    // ════════════════════════════════════════════════════════════════
    defineField({
      name: "scIscrIntro",
      title: "Intro — paragrafi sopra le quote",
      fieldset: "scuolaCalcioIscriviti",
      description:
        "Testo introduttivo della pagina iscrizione (cos'è, come funziona).",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "scIscrQuotaAnnuale",
      title: "Quota annuale (€)",
      fieldset: "scuolaCalcioIscriviti",
      description: "Tariffa di iscrizione per la stagione completa.",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "scIscrQuotaIscrizione",
      title: "Quota iscrizione una tantum (€)",
      fieldset: "scuolaCalcioIscriviti",
      description:
        "Eventuale quota iscrizione separata dalla quota annuale (può essere 0 o lasciata vuota).",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "scIscrPaymentNote",
      title: "Note pagamento",
      fieldset: "scuolaCalcioIscriviti",
      description:
        "Indicazioni per il bonifico, modalità di pagamento, sconti fratelli, eventuali rateizzazioni.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "scIscrModuleFile",
      title: "Modulo iscrizione Scuola Calcio (PDF)",
      fieldset: "scuolaCalcioIscriviti",
      description:
        "PDF del modulo da scaricare, compilare, firmare e inviare. Quando esce la stagione successiva basta sostituirlo: l'URL del file resta dinamico.",
      type: "file",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "scIscrIban",
      title: "IBAN per bonifico",
      fieldset: "scuolaCalcioIscriviti",
      description: "IBAN del club per il pagamento delle quote.",
      type: "string",
    }),
    defineField({
      name: "scIscrContactEmail",
      title: "Email dedicata iscrizioni",
      fieldset: "scuolaCalcioIscriviti",
      description:
        "Indirizzo email a cui inviare modulo compilato e contabile bonifico (es. scuolacalcio@orbassanocalcio.com oppure sgs@orbassanocalcio.com).",
      type: "string",
    }),
    defineField({
      name: "scIscrContactPhone",
      title: "Telefono di riferimento",
      fieldset: "scuolaCalcioIscriviti",
      description: "Numero per chiamare/whatsappare per info iscrizione.",
      type: "string",
    }),
    defineField({
      name: "scIscrEnableOnlineForm",
      title: "Abilita form online di iscrizione",
      fieldset: "scuolaCalcioIscriviti",
      description:
        "Se DISATTIVATO (default): la pagina mostra solo modulo PDF + bonifico + contatti. Se ATTIVO: viene mostrato anche un form online che invia email al club (richiede sviluppo dedicato, attivare solo dopo aver implementato la route /api/scuola-calcio-iscrizione).",
      type: "boolean",
      initialValue: false,
    }),

    // ════════════════════════════════════════════════════════════════
    // SCUOLA CALCIO — pagina /programma
    // ════════════════════════════════════════════════════════════════
    defineField({
      name: "scProgTimeline",
      title: "Timeline settimanale — slot allenamenti",
      fieldset: "scuolaCalcioProgramma",
      description:
        "Slot orari per giorno della settimana (es. martedì 16:00-18:00 'Allenamento tecnico'). Ordina per giorno di settimana.",
      type: "array",
      of: [
        defineField({
          name: "timelineSlot",
          title: "Slot",
          type: "object",
          fields: [
            defineField({
              name: "day",
              title: "Giorno",
              type: "string",
              options: {
                list: [
                  "Lunedì",
                  "Martedì",
                  "Mercoledì",
                  "Giovedì",
                  "Venerdì",
                  "Sabato",
                  "Domenica",
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "startTime",
              title: "Ora inizio (HH:mm)",
              type: "string",
              validation: (r) =>
                r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:mm" }),
            }),
            defineField({
              name: "endTime",
              title: "Ora fine (HH:mm)",
              type: "string",
              validation: (r) =>
                r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:mm" }),
            }),
            defineField({
              name: "activity",
              title: "Attività",
              type: "string",
              description:
                "Es. 'Allenamento tecnico', 'Partita amichevole', 'Riunione genitori'.",
            }),
            defineField({
              name: "ageGroup",
              title: "Fascia d'età (opzionale)",
              type: "string",
              description:
                "Se lo slot è dedicato a una fascia specifica (es. 'Piccoli Amici').",
            }),
          ],
          preview: {
            select: {
              day: "day",
              s: "startTime",
              e: "endTime",
              a: "activity",
            },
            prepare({ day, s, e, a }) {
              return {
                title: `${day} ${s ?? ""}-${e ?? ""}`,
                subtitle: a,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "scProgFasce",
      title: "Fasce d'età — focus tecnico per età",
      fieldset: "scuolaCalcioProgramma",
      description:
        "Una card per ogni fascia d'età FIGC (es. Piccoli Amici 5-7, Primi Calci 8-9, Pulcini 10-11, Esordienti 12-13).",
      type: "array",
      of: [
        defineField({
          name: "fasciaEta",
          title: "Fascia",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Nome fascia",
              type: "string",
              description:
                "Es. 'Piccoli Amici', 'Primi Calci', 'Pulcini', 'Esordienti'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "ageRange",
              title: "Range età (es. '5-7 anni')",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "focus",
              title: "Focus tecnico",
              type: "array",
              description:
                "Cosa si lavora con questa fascia (coordinazione, gioco, fondamentali...).",
              of: [{ type: "block" }],
            }),
            defineField({
              name: "image",
              title: "Foto rappresentativa",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "order",
              title: "Ordine",
              type: "number",
            }),
          ],
          preview: { select: { title: "label", subtitle: "ageRange" } },
        }),
      ],
    }),
    defineField({
      name: "scProgStaff",
      title: "Staff coach — allenatori Scuola Calcio",
      fieldset: "scuolaCalcioProgramma",
      description:
        "Allenatori con qualifiche FIGC. Inline: aggiungi/rimuovi senza creare documenti separati.",
      type: "array",
      of: [
        defineField({
          name: "coach",
          title: "Coach",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nome e cognome",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "role",
              title: "Ruolo",
              type: "string",
              description:
                "Es. 'Responsabile tecnico', 'Coach Pulcini', 'Preparatore portieri'.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "qualifications",
              title: "Qualifiche FIGC",
              type: "string",
              description:
                "Es. 'Allenatore Dilettanti FIGC', 'Allenatore Giovani UEFA C'.",
            }),
            defineField({
              name: "photo",
              title: "Foto",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "bio",
              title: "Bio breve",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "order",
              title: "Ordine",
              type: "number",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "photo" },
          },
        }),
      ],
    }),

    // ════════════════════════════════════════════════════════════════
    // SCUOLA CALCIO — pagina /informazioni
    // ════════════════════════════════════════════════════════════════
    defineField({
      name: "scInfoVenueName",
      title: "Sede — nome",
      fieldset: "scuolaCalcioInformazioni",
      type: "string",
      initialValue: "Centro Sportivo Aldo Porta",
    }),
    defineField({
      name: "scInfoVenueAddress",
      title: "Sede — indirizzo",
      fieldset: "scuolaCalcioInformazioni",
      description: "Indirizzo completo (via, civico, CAP, città).",
      type: "string",
    }),
    defineField({
      name: "scInfoMapsUrl",
      title: "Sede — link Google Maps",
      fieldset: "scuolaCalcioInformazioni",
      description: "URL pubblico Google Maps (Apri in Maps).",
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["https"], allowRelative: false }),
    }),
    defineField({
      name: "scInfoIncluded",
      title: "Cosa è incluso nell'iscrizione",
      fieldset: "scuolaCalcioInformazioni",
      description:
        "Lista di voci incluse (es. 'Kit completo', 'Assicurazione FIGC', 'Tessera FIGC').",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "scInfoPriceTable",
      title: "Tabella prezzi",
      fieldset: "scuolaCalcioInformazioni",
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
      fieldset: "scuolaCalcioInformazioni",
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
    prepare: () => ({ title: "Impostazioni globali" }),
  },
});
