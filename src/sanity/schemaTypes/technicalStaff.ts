import { Briefcase } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Membro dello "Staff tecnico" club-wide (direttore sportivo,
 * direttore tecnico, responsabile settore giovanile, preparatore
 * atletico, etc.) — distinto da:
 * - `clubOfficial` (organigramma societario: presidenza, consiglio,
 *   tesoreria, vivibile su /societa/organigramma)
 * - `staffMember` (object inline DENTRO un singolo `team`: allenatore
 *   + staff della squadra, visibile su /squadre/[slug])
 *
 * Lo Staff tecnico vive nella pagina /squadre come sezione finale
 * (sotto le card squadre). Stessa grafica di YouthStaffSection:
 * watermark gold gigante "Staff tecnico" + griglia con ruolo
 * mono + nome display extrabold.
 */
export const technicalStaff = defineType({
  name: "technicalStaff",
  title: "Staff tecnico",
  type: "document",
  icon: Briefcase,
  fields: [
    defineField({
      name: "isActive",
      title: "Visibile sulla pagina /squadre",
      description:
        "Attiva/disattiva la voce senza cancellarla. Disattivato = nascosto dal sito ma resta in archivio (utile per ex-collaboratori, cambi in corso).",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "role",
      title: "Ruolo",
      description:
        "Es. 'Direttore sportivo', 'Direttore tecnico', 'Responsabile settore giovanile', 'Preparatore atletico'.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Nome e cognome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Ordine di visualizzazione",
      description:
        "Numero che decide la posizione nella griglia (più basso = prima). Riordinabili con drag-and-drop nella lista Studio.",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      isActive: "isActive",
    },
    prepare({ title, subtitle, isActive }) {
      const active = isActive !== false;
      return {
        title: active ? title : `(disattivato) ${title ?? ""}`,
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Ordine manuale",
      name: "manual",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
