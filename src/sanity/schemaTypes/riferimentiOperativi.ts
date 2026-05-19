import { Briefcase } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Singleton "Riferimenti operativi" — Allegato B del Codice Etico.
 *
 * Contiene tutti i dati istituzionali e i ruoli operativi del club che
 * accompagnano il Codice Etico: Direttivo, Responsabile Safeguarding,
 * referenti privacy/giovanile/prima-squadra, email segnalazioni e
 * versioning del Codice (corrente + archivio storico).
 *
 * Singleton: un solo documento con _id "riferimentiOperativi".
 * Gestito via desk structure (S.editor().documentId(...)) come
 * già fatto per "settings".
 *
 * Aggiornamento via Sanity senza nuova revisione del Codice (art. 12.8).
 *
 * Architettura: i dati del Direttivo vivono qui (non come reference a
 * `clubOfficial`) per separazione semantica — il Direttivo è organo
 * statutario, l'organigramma operativo è altra cosa. Il campo
 * opzionale `clubOfficialRef` su ogni membro permette in futuro (M9+)
 * di linkare le card "ricche" dell'organigramma senza migrazione.
 */
export const riferimentiOperativi = defineType({
  name: "riferimentiOperativi",
  title: "Riferimenti operativi (Codice Etico — Allegato B)",
  type: "document",
  icon: Briefcase,
  fieldsets: [
    {
      name: "istituzionali",
      title: "Dati istituzionali",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "direttivoFs",
      title: "Direttivo",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "ruoliOperativi",
      title: "Ruoli operativi",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "canali",
      title: "Canali di segnalazione",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "codice",
      title: "Codice Etico — versione corrente",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "archivio",
      title: "Codice Etico — archivio versioni precedenti",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ----- Istituzionali ---------------------------------------------------------------
    defineField({
      name: "sedeLegale",
      title: "Sede legale",
      description:
        "Indirizzo completo: via, numero civico, CAP, città (es. 'Via Ignazio Silone 4, 10043 Orbassano TO').",
      type: "string",
      fieldset: "istituzionali",
    }),
    defineField({
      name: "codiceFiscale",
      title: "Codice fiscale",
      type: "string",
      fieldset: "istituzionali",
    }),
    defineField({
      name: "partitaIva",
      title: "Partita IVA",
      type: "string",
      fieldset: "istituzionali",
    }),
    defineField({
      name: "affiliazioneFigc",
      title: "Affiliazione FIGC (matricola)",
      type: "string",
      fieldset: "istituzionali",
    }),
    defineField({
      name: "emailSegreteria",
      title: "Email segreteria",
      description: "Es. info@orbassanocalcio.com",
      type: "string",
      fieldset: "istituzionali",
      validation: (r) => r.email(),
    }),

    // ----- Direttivo -------------------------------------------------------------------
    defineField({
      name: "direttivo",
      title: "Membri del Direttivo",
      description:
        "Organo statutario a 4 ruoli: Presidente, Vice-Presidente, Segretario, Tesoriere. I dati sono separati dall'organigramma operativo /societa/organigramma per scelta architetturale (vedi spec governance).",
      type: "array",
      fieldset: "direttivoFs",
      of: [
        {
          type: "object",
          name: "membroDirettivo",
          title: "Membro del Direttivo",
          fields: [
            defineField({
              name: "ruolo",
              title: "Ruolo",
              type: "string",
              options: {
                list: [
                  { title: "Presidente", value: "Presidente" },
                  { title: "Vice-Presidente", value: "Vice-Presidente" },
                  { title: "Segretario", value: "Segretario" },
                  { title: "Tesoriere", value: "Tesoriere" },
                ],
                layout: "dropdown",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "nome",
              title: "Nome e cognome",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "email",
              title: "Email istituzionale",
              description:
                "Email dedicata al ruolo (es. presidente@orbassanocalcio.com), opzionale.",
              type: "string",
              validation: (r) => r.email(),
            }),
            defineField({
              name: "delega",
              title: "Delega specifica",
              description:
                "Eventuale delega operativa (es. 'Settore Giovanile', 'Sponsor & Partner').",
              type: "string",
            }),
            defineField({
              name: "clubOfficialRef",
              title: "Card organigramma (opzionale)",
              description:
                "Future-proof: link alla card ricca su /societa/organigramma quando in M9+ aggiungeremo foto/biografie. Lascia vuoto per ora.",
              type: "reference",
              to: [{ type: "clubOfficial" }],
            }),
          ],
          preview: {
            select: { title: "nome", subtitle: "ruolo" },
          },
        },
      ],
    }),

    // ----- Ruoli operativi -------------------------------------------------------------
    defineField({
      name: "responsabileSafeguarding",
      title: "Responsabile Safeguarding",
      description:
        "Tutela minori e segnalazioni in materia di Safeguarding (FIGC CU 87/A del 31/08/2023). Se posizione vacante, le segnalazioni vanno al Direttivo (art. 3.7 del Codice Etico).",
      type: "object",
      fieldset: "ruoliOperativi",
      fields: [
        defineField({
          name: "inCarica",
          title: "Posizione coperta",
          description:
            "Disattiva se la posizione è vacante: la pagina mostra il messaggio di transizione e indirizza al Direttivo.",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "nome",
          title: "Nome e cognome",
          type: "string",
          hidden: ({ parent }) =>
            !(parent as { inCarica?: boolean })?.inCarica,
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (r) => r.email(),
          hidden: ({ parent }) =>
            !(parent as { inCarica?: boolean })?.inCarica,
        }),
        defineField({
          name: "telefono",
          title: "Telefono (opzionale)",
          type: "string",
          hidden: ({ parent }) =>
            !(parent as { inCarica?: boolean })?.inCarica,
        }),
      ],
    }),
    defineField({
      name: "referenteData",
      title: "Referente protezione dati personali",
      description: "Persona di contatto per richieste GDPR (art. 9.6 Codice).",
      type: "object",
      fieldset: "ruoliOperativi",
      fields: [
        defineField({ name: "nome", title: "Nome e cognome", type: "string" }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (r) => r.email(),
        }),
      ],
    }),
    defineField({
      name: "responsabileGiovanile",
      title: "Responsabile Settore Giovanile",
      type: "object",
      fieldset: "ruoliOperativi",
      fields: [
        defineField({ name: "nome", title: "Nome e cognome", type: "string" }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (r) => r.email(),
        }),
      ],
    }),
    defineField({
      name: "responsabilePrimaSquadra",
      title: "Responsabile Prima Squadra",
      type: "object",
      fieldset: "ruoliOperativi",
      fields: [
        defineField({ name: "nome", title: "Nome e cognome", type: "string" }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (r) => r.email(),
        }),
      ],
    }),

    // ----- Canali segnalazione ---------------------------------------------------------
    defineField({
      name: "emailSegnalazioni",
      title: "Email per segnalazioni Codice Etico",
      description:
        "USARE MAIL DEDICATA (es. segnalazioni@orbassanocalcio.com), NON l'email segreteria. Riservatezza al Direttivo + Responsabile Safeguarding (art. 11.6 Codice). Configurare lato Workspace come gruppo con membership ristretta.",
      type: "string",
      fieldset: "canali",
      validation: (r) => r.email(),
    }),

    // ----- Codice Etico — versione corrente --------------------------------------------
    defineField({
      name: "codiceEticoVersione",
      title: "Versione Codice (es. '1.0')",
      type: "string",
      fieldset: "codice",
    }),
    defineField({
      name: "codiceEticoApprovatoIl",
      title: "Approvato dal Direttivo il",
      type: "date",
      fieldset: "codice",
    }),
    defineField({
      name: "codiceEticoInVigoreDal",
      title: "In vigore dal",
      type: "date",
      fieldset: "codice",
    }),
    defineField({
      name: "codiceEticoPdfUrl",
      title: "PDF Codice Etico (versione corrente)",
      description:
        "Carica il PDF della versione approvata dal Direttivo. Compare come CTA 'Scarica PDF' sulla pagina /societa/codice-etico.",
      type: "file",
      options: { accept: ".pdf" },
      fieldset: "codice",
    }),

    // ----- Codice Etico — archivio versioni --------------------------------------------
    defineField({
      name: "codiceEticoArchivio",
      title: "Versioni precedenti del Codice",
      description:
        "Art. 12.5: le versioni precedenti del Codice devono essere archiviate e consultabili. Quando si pubblica una nuova versione, spostare la precedente qui PRIMA di sostituire il PDF corrente.",
      type: "array",
      fieldset: "archivio",
      of: [
        {
          type: "object",
          name: "versioneArchiviata",
          title: "Versione archiviata",
          fields: [
            defineField({
              name: "versione",
              title: "Versione (es. '1.0')",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "approvatoIl",
              title: "Approvata il",
              type: "date",
            }),
            defineField({
              name: "sostituitoIl",
              title: "Sostituita il",
              type: "date",
            }),
            defineField({
              name: "pdf",
              title: "PDF archiviato",
              type: "file",
              options: { accept: ".pdf" },
            }),
            defineField({
              name: "note",
              title: "Cosa è cambiato vs precedente",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "versione", subtitle: "approvatoIl" },
          },
        },
      ],
    }),

    // ----- Tracking interno ------------------------------------------------------------
    defineField({
      name: "ultimoAggiornamento",
      title: "Ultimo aggiornamento",
      description:
        "Aggiornare manualmente quando si modificano i campi. La pagina /societa/codice-etico lo mostra come trasparenza al pubblico.",
      type: "datetime",
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Riferimenti operativi",
      subtitle: "Codice Etico — Allegato B (singleton)",
    }),
  },
});
