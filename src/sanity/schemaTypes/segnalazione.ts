import { ShieldAlert } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Segnalazione di violazione del Codice Etico — Allegato C.
 *
 * RISERVATEZZA (art. 11.6):
 * - Questo schema NON deve essere incluso in alcuna query GROQ
 *   pubblica del sito. Verificare che `src/sanity/queries.ts` non
 *   contenga riferimenti a `_type == "segnalazione"`.
 * - L'API route /api/whistleblowing usa `sanityWriteClient` (server-only,
 *   con SANITY_API_WRITE_TOKEN). I documenti vengono creati ma mai
 *   letti dal sito pubblico.
 * - Lo Studio embedded mostra le segnalazioni a chiunque abbia
 *   credenziali Sanity. Per produzione si raccomanda role-based
 *   access via Sanity Membership (manage.sanity.io) limitato a
 *   Direttivo + Responsabile Safeguarding.
 *
 * GENERAZIONE PROTOCOLLO:
 * Il campo `protocollo` (formato WB-YYYY-NNNN) e `_id` (
 * `segnalazione.<protocollo>`) sono generati lato server in
 * /api/whistleblowing/route.ts via GROQ count + retry su conflict 409.
 *
 * RETENTION:
 * Le segnalazioni archiviate restano in CMS come traccia istruttoria
 * (audit-friendly). L'eventuale cancellazione è decisione del
 * Direttivo + Responsabile Privacy in base a tempistiche GDPR (di
 * norma 5-10 anni dall'archiviazione, ma dipende dalla materia).
 */
export const segnalazione = defineType({
  name: "segnalazione",
  title: "Segnalazione (RISERVATA)",
  type: "document",
  icon: ShieldAlert,
  fieldsets: [
    {
      name: "metadata",
      title: "Metadati ricezione",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "segnalanteFs",
      title: "Identità segnalante",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "oggetto",
      title: "Oggetto della segnalazione",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "fatti",
      title: "Descrizione fatti",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "documenti",
      title: "Documentazione",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "dichiarazioni",
      title: "Dichiarazioni del segnalante",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "istruttoria",
      title: "Gestione interna (Direttivo)",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    // ----- Metadati ricezione (readOnly, generati server-side) ------------------------
    defineField({
      name: "protocollo",
      title: "Protocollo",
      description:
        "Generato automaticamente in formato WB-YYYY-NNNN. Comunicato al segnalante via email di conferma.",
      type: "string",
      readOnly: true,
      fieldset: "metadata",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ricevutaIl",
      title: "Ricevuta il",
      type: "datetime",
      readOnly: true,
      fieldset: "metadata",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isAnonimo",
      title: "Anonima",
      description:
        "Il segnalante ha scelto l'anonimato (art. 11.5: anonime accettate ma con ridotta efficacia istruttoria).",
      type: "boolean",
      readOnly: true,
      fieldset: "metadata",
      initialValue: false,
    }),
    defineField({
      name: "ipHash",
      title: "Hash IP (audit)",
      description:
        "SHA-256 del primo /24 dell'IP, no raw. Utile a correlare submission multiple senza tracking.",
      type: "string",
      readOnly: true,
      fieldset: "metadata",
    }),

    // ----- Segnalante -----------------------------------------------------------------
    defineField({
      name: "segnalante",
      title: "Identità segnalante",
      description:
        "Compilato solo se isAnonimo == false. I campi sono ricevuti dal form, ma resta facoltà del Direttivo oscurarli internamente al Responsabile Safeguarding (art. 11.6).",
      type: "object",
      fieldset: "segnalanteFs",
      fields: [
        defineField({ name: "cognomeNome", title: "Cognome e Nome", type: "string" }),
        defineField({
          name: "ruolo",
          title: "Ruolo nel club / rapporto col club",
          type: "string",
          options: {
            list: [
              { title: "Tesserato (maggiorenne)", value: "tesserato_maggiorenne" },
              { title: "Genitore di tesserato", value: "genitore" },
              { title: "Tecnico / mister", value: "tecnico" },
              { title: "Dirigente", value: "dirigente" },
              { title: "Volontario / collaboratore", value: "volontario" },
              { title: "Sponsor / fornitore", value: "sponsor" },
              { title: "Altro", value: "altro" },
            ],
          },
        }),
        defineField({
          name: "ruoloAltro",
          title: "Specifica (se ruolo = Altro)",
          type: "string",
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (r) => r.email(),
        }),
        defineField({
          name: "telefono",
          title: "Telefono",
          type: "string",
        }),
        defineField({
          name: "consensoRicontatto",
          title: "Consenso al ricontatto",
          description:
            "Se true, il Direttivo può ricontattare il segnalante per chiarimenti / esito istruttoria.",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),

    // ----- Oggetto --------------------------------------------------------------------
    defineField({
      name: "tipologie",
      title: "Tipologie di violazione segnalata",
      description: "Multipla scelta. Mappata sui capitoli del Codice Etico.",
      type: "array",
      fieldset: "oggetto",
      of: [
        {
          type: "string",
          options: {
            list: [
              { title: "Tutela minori (Cap. 4 + 5)", value: "tutela_minori" },
              { title: "Conflitto di interesse (Cap. 6)", value: "conflitto_interesse" },
              { title: "Comportamento in campo (Cap. 5)", value: "comportamento_campo" },
              { title: "Doping / sostanze (Cap. 5.7)", value: "doping" },
              { title: "Match-fixing / scommesse (Cap. 5.6)", value: "match_fixing" },
              { title: "Social media / immagine (Cap. 8)", value: "social_media" },
              { title: "Riservatezza dati (Cap. 9)", value: "riservatezza_dati" },
              { title: "Patrimonio / risorse (Cap. 7)", value: "patrimonio" },
              { title: "Sponsor / fornitori (Cap. 10)", value: "sponsor" },
              { title: "Contributi pubblici / 5×1000 (Cap. 7.14)", value: "contributi_pubblici" },
              { title: "Altro", value: "altro" },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "tipologiaAltro",
      title: "Specifica (se 'Altro')",
      type: "string",
      fieldset: "oggetto",
    }),

    // ----- Fatti ----------------------------------------------------------------------
    defineField({
      name: "dataPeriodoInizio",
      title: "Inizio periodo",
      description: "Quando hanno inizio i fatti segnalati (data ISO opzionale).",
      type: "date",
      fieldset: "fatti",
    }),
    defineField({
      name: "dataPeriodoFine",
      title: "Fine periodo",
      description: "Lasciare vuoto se i fatti sono ancora in corso.",
      type: "date",
      fieldset: "fatti",
    }),
    defineField({
      name: "luogo",
      title: "Luogo",
      description:
        "Es. 'Centro Sportivo Aldo Porta', 'spogliatoio U17', 'trasferta del 12/10', 'WhatsApp gruppo genitori'.",
      type: "string",
      fieldset: "fatti",
    }),
    defineField({
      name: "personeCoinvolte",
      title: "Persone coinvolte",
      description:
        "Nomi (o iniziali se l'anonimato è parziale) delle persone coinvolte. Resta riservato al Direttivo.",
      type: "text",
      rows: 3,
      fieldset: "fatti",
    }),
    defineField({
      name: "descrizione",
      title: "Descrizione fatti",
      description:
        "Resoconto dettagliato della segnalazione. Min 50 caratteri (validato lato form).",
      type: "text",
      rows: 8,
      fieldset: "fatti",
      validation: (r) => r.required().min(50),
    }),
    defineField({
      name: "testimoni",
      title: "Testimoni",
      description: "Eventuali persone che possono confermare i fatti.",
      type: "text",
      rows: 3,
      fieldset: "fatti",
    }),

    // ----- Documenti ------------------------------------------------------------------
    defineField({
      name: "hasAllegati",
      title: "Il segnalante dichiara di avere documentazione",
      description:
        "Il form NON consente upload allegati per ragioni di privacy / dimensione. Se hasAllegati == true, il Direttivo richiede la documentazione via email di follow-up.",
      type: "boolean",
      fieldset: "documenti",
      initialValue: false,
    }),
    defineField({
      name: "notaAllegati",
      title: "Nota su documentazione",
      type: "text",
      rows: 3,
      fieldset: "documenti",
      hidden: ({ parent }) =>
        !(parent as { hasAllegati?: boolean })?.hasAllegati,
    }),

    // ----- Dichiarazioni --------------------------------------------------------------
    defineField({
      name: "dichiarazioneBuonaFede",
      title: "Dichiarazione di buona fede",
      description:
        "Art. 11.10 — Il segnalante dichiara di agire in buona fede e di non avere intenzioni diffamatorie.",
      type: "boolean",
      fieldset: "dichiarazioni",
      initialValue: false,
      validation: (r) => r.custom((value) => value === true ? true : "Dichiarazione obbligatoria."),
    }),
    defineField({
      name: "dichiarazioneTutela",
      title: "Riconoscimento delle tutele",
      description:
        "Il segnalante dichiara di essere a conoscenza delle tutele riconosciute (riservatezza + non ritorsione, artt. 11.6-11.8).",
      type: "boolean",
      fieldset: "dichiarazioni",
      initialValue: false,
      validation: (r) => r.custom((value) => value === true ? true : "Dichiarazione obbligatoria."),
    }),
    defineField({
      name: "giaSegnalato",
      title: "I fatti sono già stati segnalati altrove?",
      type: "string",
      fieldset: "dichiarazioni",
      options: {
        list: [
          { title: "No", value: "no" },
          { title: "Sì (specifica sotto)", value: "si" },
        ],
        layout: "radio",
      },
      initialValue: "no",
    }),
    defineField({
      name: "giaSegnalatoSpecifica",
      title: "A chi è stato segnalato",
      description: "Es. 'Procura federale FIGC', 'forze dell'ordine', 'commissione disciplinare LND'.",
      type: "text",
      rows: 2,
      fieldset: "dichiarazioni",
      hidden: ({ parent }) =>
        (parent as { giaSegnalato?: string })?.giaSegnalato !== "si",
    }),

    // ----- Istruttoria interna --------------------------------------------------------
    defineField({
      name: "stato",
      title: "Stato istruttoria",
      type: "string",
      fieldset: "istruttoria",
      options: {
        list: [
          { title: "Ricevuta", value: "ricevuta" },
          { title: "In istruttoria", value: "in_istruttoria" },
          { title: "Archiviata", value: "archiviata" },
          { title: "Chiusa con esito", value: "chiusa" },
        ],
        layout: "radio",
      },
      initialValue: "ricevuta",
    }),
    defineField({
      name: "noteInterne",
      title: "Note interne istruttoria",
      description:
        "NON visibili al segnalante. Spazio per appunti del Direttivo, decisioni intermedie, riferimenti documentali.",
      type: "text",
      rows: 6,
      fieldset: "istruttoria",
    }),
    defineField({
      name: "esito",
      title: "Esito (comunicabile al segnalante)",
      description:
        "Sintesi dell'esito dell'istruttoria. Se il segnalante ha consensoRicontatto == true, copia/incolla manuale in email di esito.",
      type: "text",
      rows: 4,
      fieldset: "istruttoria",
    }),
    defineField({
      name: "chiusaIl",
      title: "Chiusa il",
      type: "datetime",
      fieldset: "istruttoria",
    }),
  ],
  preview: {
    select: {
      protocollo: "protocollo",
      ricevutaIl: "ricevutaIl",
      isAnonimo: "isAnonimo",
      stato: "stato",
      cognomeNome: "segnalante.cognomeNome",
    },
    prepare: ({ protocollo, ricevutaIl, isAnonimo, stato, cognomeNome }) => {
      const when = ricevutaIl
        ? new Date(ricevutaIl).toLocaleDateString("it-IT")
        : "—";
      const who = isAnonimo
        ? "ANONIMA"
        : (cognomeNome ?? "—");
      const stateLabel =
        stato === "ricevuta"
          ? "Ricevuta"
          : stato === "in_istruttoria"
            ? "In istruttoria"
            : stato === "archiviata"
              ? "Archiviata"
              : stato === "chiusa"
                ? "Chiusa"
                : "—";
      return {
        title: protocollo ?? "Senza protocollo",
        subtitle: `${when} · ${who} · ${stateLabel}`,
      };
    },
  },
  orderings: [
    {
      title: "Più recenti",
      name: "ricevutaDesc",
      by: [{ field: "ricevutaIl", direction: "desc" }],
    },
    {
      title: "Stato istruttoria",
      name: "statoAsc",
      by: [
        { field: "stato", direction: "asc" },
        { field: "ricevutaIl", direction: "desc" },
      ],
    },
  ],
});
