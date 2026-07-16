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
  title: "Staff tecnico club (pagina Squadre)",
  type: "document",
  icon: Briefcase,
  description:
    "Staff club-wide (DS, DT, responsabile SGS, preparatore atletico ecc.) mostrato in fondo alla pagina /squadre, sotto le card squadre. Per l'allenatore + collaboratori di UNA singola squadra usa invece il campo 'Staff della squadra' dentro il documento della squadra.",
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
      name: "tier",
      title: "Livello / Gruppo",
      description:
        "Sezione in cui appare sulla pagina /squadre. I gruppi vuoti non vengono mostrati. Il prefisso numerico nel valore serve solo a ordinare le sezioni; nel sito si vede solo il titolo del gruppo.",
      type: "string",
      options: {
        list: [
          { title: "Direzione tecnica", value: "1-direzione" },
          { title: "Allenatori", value: "2-allenatori" },
          { title: "Preparatori", value: "3-preparatori" },
          { title: "Staff medico", value: "4-medico" },
          { title: "Logistica e magazzino", value: "5-logistica" },
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
      initialValue: "1-direzione",
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
      title: "Ordine entro il gruppo",
      description:
        "Numero che decide la posizione nella griglia del proprio gruppo (più basso = prima). Riordinabili con drag-and-drop nella lista Studio.",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      tier: "tier",
      isActive: "isActive",
    },
    prepare({ title, subtitle, tier, isActive }) {
      const active = isActive !== false;
      const tierLabel =
        tier === "1-direzione"
          ? "Direzione"
          : tier === "2-allenatori"
            ? "Allenatori"
            : tier === "3-preparatori"
              ? "Preparatori"
              : tier === "4-medico"
                ? "Staff medico"
                : tier === "5-logistica"
                  ? "Logistica"
                  : "—";
      return {
        title: active ? title : `(disattivato) ${title ?? ""}`,
        subtitle: `${tierLabel} · ${subtitle ?? "—"}`,
      };
    },
  },
  orderings: [
    {
      title: "Gruppo + ordine",
      name: "tierThenOrder",
      by: [
        { field: "tier", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Ordine manuale",
      name: "manual",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
