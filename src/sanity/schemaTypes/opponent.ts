import { Swords } from "lucide-react";
import { defineField, defineType, type Reference } from "sanity";

/**
 * Join tra `club` e `competition`. Indica che un dato club partecipa a
 * una data competizione (e quindi puo' essere selezionato come avversario
 * dei match in quella competition).
 *
 * Targeting (squadra nostra) e stagione sono derivati da `competition`,
 * non duplicati qui — evita stati incoerenti.
 *
 * Esempio: "ASD Esempio Calcio" partecipa a "Prima Categoria 2026/27" →
 * un opponent doc. Se la stessa squadra partecipa anche a "Coppa Italia
 * 2026/27" → un secondo opponent doc.
 */
export const opponent = defineType({
  name: "opponent",
  title: "Avversario",
  type: "document",
  icon: Swords,
  fields: [
    defineField({
      name: "club",
      title: "Club",
      description:
        "Anagrafica del club avversario (logo, sito, social). Il dropdown nasconde i club gia' registrati come avversari della stessa competizione, per evitare duplicati.",
      type: "reference",
      to: [{ type: "club" }],
      options: {
        filter: ({ document }) => {
          const compRef = (document as { competition?: Reference })?.competition
            ?._ref;
          if (!compRef) return { filter: "isActive == true" };
          // Escludi i club gia' presi da altri opponent per la stessa
          // competition. `selfPub`/`selfDraft` escludono il documento
          // corrente (sia che lo stiamo modificando come draft sia come
          // published), altrimenti l'opponent corrente toglierebbe dalla
          // dropdown il suo stesso club selezionato.
          const docId = document?._id ?? "";
          const selfPub = docId.replace(/^drafts\./, "");
          const selfDraft = `drafts.${selfPub}`;
          return {
            filter:
              'isActive == true && !(_id in *[_type == "opponent" && competition._ref == $compId && !(_id in [$selfPub, $selfDraft])].club._ref)',
            params: { compId: compRef, selfPub, selfDraft },
          };
        },
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "competition",
      title: "Competizione",
      description:
        "La squadra nostra avversaria di questo club in questa competition. Implicitamente definisce stagione e squadra Orbassano coinvolta.",
      type: "reference",
      to: [{ type: "competition" }],
      options: {
        filter: "isActive == true",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "notes",
      title: "Note",
      description:
        "Eventuali appunti per l'admin (storico contro di noi, particolarita', etc.).",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "isActive",
      title: "Attivo",
      description:
        "Disattiva se la squadra si e' ritirata o squalificata. I match esistenti restano, ma la voce non e' piu' selezionabile per nuovi match.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      clubName: "club.name",
      clubLogo: "club.logo",
      competition: "competition.shortName",
      season: "competition.season",
      isActive: "isActive",
    },
    prepare: ({ clubName, clubLogo, competition, season, isActive }) => ({
      title: isActive === false
        ? `${clubName ?? "—"} (inattivo)`
        : (clubName ?? "—"),
      subtitle:
        competition && season
          ? `${competition} ${season}`
          : "Competition mancante",
      media: clubLogo,
    }),
  },
  orderings: [
    {
      title: "Club (A→Z)",
      name: "clubAsc",
      by: [{ field: "club.name", direction: "asc" }],
    },
  ],
});
