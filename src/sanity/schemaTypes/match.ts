import { Trophy } from "lucide-react";
import { defineField, defineType, type Reference } from "sanity";

/**
 * Schema match — refactor M5a:
 *
 * - `competition` (reference, required): pilota tab/JSON-LD/info strip.
 *   Filtro Studio: solo competition attive con targetTeam == match.team.
 * - `opponent` (reference, required UNLESS isOpponentTbd): join club +
 *   competition. Filtro Studio: solo opponent attivi della stessa
 *   competition gia' selezionata.
 * - `team` (reference): ridondante con competition.targetTeam ma utile
 *   per query veloci. Validazione async cross-field assicura coerenza.
 * - status: aggiunto `cancelled` (annullata, non recuperabile, distinta
 *   da `postponed` che e' rinviata).
 * - flag: isOpponentTbd (sorteggio coppa non avvenuto), isDateTbd (data
 *   da definire), isClosedDoors (porte chiuse).
 * - legacyOpponent / legacyOpponentLogo: hidden + readOnly. Servono solo
 *   come safety net per eventuali doc gia' in CMS prima di questo
 *   refactor (in produzione non ce ne sono — verificato pre-merge).
 */
export const match = defineType({
  name: "match",
  title: "Partita",
  type: "document",
  icon: Trophy,
  fieldsets: [
    {
      name: "details",
      title: "Dettagli incontro",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "result",
      title: "Risultato (a partita conclusa)",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "extras",
      title: "Link esterni & flag",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "legacy",
      title: "Campi legacy (deprecati)",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "team",
      title: "Squadra Orbassano",
      description: "La nostra squadra che gioca questa partita.",
      type: "reference",
      to: [{ type: "team" }],
      options: { filter: "isActive != false" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "competition",
      title: "Competizione",
      description:
        "Filtra automaticamente sulle competition della squadra selezionata.",
      type: "reference",
      to: [{ type: "competition" }],
      options: {
        filter: ({ document }) => {
          const teamRef = (document as { team?: Reference })?.team?._ref;
          if (!teamRef) return { filter: "isActive == true" };
          return {
            filter: "isActive == true && targetTeam._ref == $teamId",
            params: { teamId: teamRef },
          };
        },
      },
      validation: (r) =>
        r.required().custom(async (value, context) => {
          const ref = (value as Reference | undefined)?._ref;
          if (!ref) return true;
          const teamRef = (context.document as { team?: Reference })?.team
            ?._ref;
          if (!teamRef) return true;
          const client = context.getClient({ apiVersion: "2024-01-01" });
          const comp = await client.fetch<{ targetTeamRef?: string } | null>(
            `*[_id == $id][0]{ "targetTeamRef": targetTeam._ref }`,
            { id: ref },
          );
          if (comp?.targetTeamRef && comp.targetTeamRef !== teamRef) {
            return "La competizione selezionata e' di un'altra squadra.";
          }
          return true;
        }),
    }),
    defineField({
      name: "matchday",
      title: "Giornata",
      type: "number",
      fieldset: "details",
    }),
    defineField({
      name: "date",
      title: "Data e ora",
      description:
        "Se la data esatta e' incerta, valorizza una data nominale e attiva 'Data da definire' qui sotto.",
      type: "datetime",
      fieldset: "details",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isDateTbd",
      title: "Data da definire",
      description:
        "Spunta se la data o l'orario non sono ancora ufficiali. La UI mostra 'Da definire' al posto dell'orario.",
      type: "boolean",
      initialValue: false,
      fieldset: "details",
    }),
    defineField({
      name: "home",
      title: "In casa",
      description:
        "Spunta se Orbassano gioca in casa. Influenza la lettura di scoreHome/scoreAway.",
      type: "boolean",
      initialValue: true,
      fieldset: "details",
    }),
    defineField({
      name: "venue",
      title: "Stadio",
      description:
        "Lascia vuoto per usare 'Centro Sportivo Aldo Porta' (default casa). Specifica per trasferte e campi neutri.",
      type: "string",
      fieldset: "details",
    }),
    defineField({
      name: "isOpponentTbd",
      title: "Avversario da definire",
      description:
        "Sorteggio coppa non ancora avvenuto. Se attivo, il campo Avversario diventa opzionale e la card mostra '?' al posto del logo.",
      type: "boolean",
      initialValue: false,
      fieldset: "details",
    }),
    defineField({
      name: "opponent",
      title: "Avversario",
      description:
        "Filtra automaticamente sugli opponent registrati per la competition selezionata sopra.",
      type: "reference",
      to: [{ type: "opponent" }],
      options: {
        filter: ({ document }) => {
          const compRef = (document as { competition?: Reference })
            ?.competition?._ref;
          if (!compRef) return { filter: "isActive == true" };
          return {
            filter: "isActive == true && competition._ref == $compId",
            params: { compId: compRef },
          };
        },
      },
      validation: (r) =>
        r.custom((value, context) => {
          const isTbd = (context.document as { isOpponentTbd?: boolean })
            ?.isOpponentTbd;
          if (!value && !isTbd) {
            return "Avversario obbligatorio (oppure spunta 'Avversario da definire').";
          }
          return true;
        }),
    }),
    defineField({
      name: "status",
      title: "Stato",
      type: "string",
      options: {
        list: [
          { title: "Programmata", value: "scheduled" },
          { title: "In corso", value: "live" },
          { title: "Terminata", value: "finished" },
          { title: "Rinviata (recuperabile)", value: "postponed" },
          { title: "Annullata (non recuperabile)", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "scheduled",
    }),
    defineField({
      name: "scoreHome",
      title: "Gol in casa",
      type: "number",
      fieldset: "result",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "scoreAway",
      title: "Gol in trasferta",
      type: "number",
      fieldset: "result",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "reportLink",
      title: "Tabellino esterno",
      description:
        "URL Tuttocampo / Sprintsport con tabellino specifico di questa partita. Se vuoto, la MatchCard usa competition.defaultReportLink come fallback (cascata: match.reportLink batte competition.defaultReportLink).",
      type: "url",
      fieldset: "extras",
    }),
    defineField({
      name: "highlightsUrl",
      title: "Highlights YouTube",
      type: "url",
      fieldset: "extras",
    }),
    defineField({
      name: "isClosedDoors",
      title: "Porte chiuse",
      description:
        "Match disputato a porte chiuse (squalifica campo, ordine pubblico). Mostra icona dedicata sulla card.",
      type: "boolean",
      initialValue: false,
      fieldset: "extras",
    }),
    defineField({
      name: "notes",
      title: "Note",
      description:
        "Visibili al pubblico sotto la card (es. 'Recupero del 15/12', 'Avversaria ritirata').",
      type: "text",
      rows: 2,
      fieldset: "extras",
    }),
    defineField({
      name: "season",
      title: "Stagione (legacy)",
      description:
        "[Deprecato] Letta da competition.season. Mantenuto solo per backward compat.",
      type: "string",
      fieldset: "legacy",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "legacyOpponent",
      title: "Avversario (legacy stringa)",
      description:
        "[Deprecato] Sostituito da reference opponent. Visibile solo per ispezione su doc pre-refactor.",
      type: "string",
      fieldset: "legacy",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "legacyOpponentLogo",
      title: "Logo avversario (legacy embedded)",
      description:
        "[Deprecato] Sostituito da club.logo via reference. Visibile solo per ispezione.",
      type: "image",
      fieldset: "legacy",
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      home: "home",
      date: "date",
      status: "status",
      scoreHome: "scoreHome",
      scoreAway: "scoreAway",
      teamName: "team.name",
      opponentName: "opponent.club.shortName",
      opponentLogo: "opponent.club.logo",
      isOpponentTbd: "isOpponentTbd",
      compName: "competition.shortName",
    },
    prepare({
      home,
      date,
      status,
      scoreHome,
      scoreAway,
      teamName,
      opponentName,
      opponentLogo,
      isOpponentTbd,
      compName,
    }) {
      const opp = isOpponentTbd ? "(da definire)" : (opponentName ?? "—");
      const where = home ? "vs" : "@";
      const score =
        typeof scoreHome === "number" && typeof scoreAway === "number"
          ? ` · ${scoreHome}-${scoreAway}`
          : "";
      const when = date ? new Date(date).toLocaleDateString("it-IT") : "TBD";
      const team = teamName ?? "—";
      const comp = compName ? ` · ${compName}` : "";
      return {
        title: `${team} ${where} ${opp}${score}`,
        subtitle: `${when}${comp} · ${status ?? "scheduled"}`,
        media: opponentLogo,
      };
    },
  },
  orderings: [
    {
      title: "Data (più recenti)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Data (cronologica)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
});
