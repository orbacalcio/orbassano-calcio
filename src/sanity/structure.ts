import {
  Archive,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  Coins,
  Cog,
  GraduationCap,
  Handshake,
  Image as ImageIcon,
  Images,
  MapPin,
  Milestone,
  Newspaper,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

/**
 * Desk Structure custom per lo Studio.
 *
 * Riorganizzata in M5a per supportare l'anagrafica calendario:
 * - Stagione corrente: tutto cio' che riguarda l'attuale 2026/27
 * - Archivio: stagioni passate (competition + match con season diversa)
 * - Sistema: log consensi cookie
 *
 * Lista squadre hardcoded per slug stabili. Quando le squadre cambiano,
 * basta aggiornare TEAM_ITEMS qui sotto. Quando cambia la stagione,
 * basta aggiornare CURRENT_SEASON.
 *
 * Singletons:
 * - 'settings': impostazioni globali del sito
 * - 'riferimentiOperativi': Allegato B Codice Etico (Direttivo, ruoli,
 *   email segnalazioni, versioning Codice)
 *
 * Sezione "Governance" raccoglie tutto quello che pertiene al Codice
 * Etico e alla trasparenza statutaria (Allegati B/C).
 */

// Stagione di riferimento per il filtro "stagione corrente vs archivio".
// Quando cambia, basta aggiornare questa costante (es. ad agosto 2027).
const CURRENT_SEASON = "2026/2027";

// Squadre attive (slug + label) per le viste filtrate "Partite per
// squadra" e "Avversari per squadra". L'ordine determina l'elenco.
// Macro-categorie: Prima Squadra (Prima Categoria) → Juniores (U19) →
// Settore Giovanile (U17/U16/U15/U14) → Scuola Calcio.
const TEAM_ITEMS: Array<{ slug: string; label: string }> = [
  { slug: "prima-squadra", label: "Prima Squadra" },
  { slug: "juniores", label: "Juniores" },
  { slug: "under-17", label: "Under 17" },
  { slug: "under-16", label: "Under 16" },
  { slug: "under-15", label: "Under 15" },
  { slug: "under-14", label: "Under 14" },
  { slug: "scuola-calcio", label: "Scuola Calcio" },
];

function buildMatchesByTeam(S: StructureBuilder) {
  return S.list()
    .title("Partite per squadra")
    .items(
      TEAM_ITEMS.map((t) =>
        S.listItem()
          .id(`matches-${t.slug}`)
          .title(t.label)
          .icon(CalendarDays)
          .child(
            S.documentList()
              .title(`Partite ${t.label}`)
              .schemaType("match")
              .filter('_type == "match" && team->slug.current == $slug')
              .params({ slug: t.slug })
              .defaultOrdering([{ field: "date", direction: "desc" }])
              // "+ Create" da questa vista crea un match con team gia'
              // pre-compilato. Il filter del campo competition (lato schema)
              // gli si appoggia immediatamente.
              .initialValueTemplates([
                S.initialValueTemplateItem("match-by-team", {
                  teamId: `team.${t.slug}`,
                }),
              ])
              .canHandleIntent(
                (intentName, params) =>
                  intentName === "edit" && params.type === "match",
              ),
          ),
      ),
    );
}

function buildArchivedMatchesByTeam(S: StructureBuilder) {
  return S.list()
    .title("Partite archiviate per squadra")
    .items(
      TEAM_ITEMS.map((t) =>
        S.listItem()
          .id(`archived-matches-${t.slug}`)
          .title(t.label)
          .icon(CalendarDays)
          .child(
            S.documentList()
              .title(`Partite archiviate ${t.label}`)
              .schemaType("match")
              .filter(
                '_type == "match" && team->slug.current == $slug && competition->season != $season',
              )
              .params({ slug: t.slug, season: CURRENT_SEASON })
              .defaultOrdering([{ field: "date", direction: "desc" }])
              .canHandleIntent(
                (intentName, params) =>
                  intentName === "edit" && params.type === "match",
              ),
          ),
      ),
    );
}

function buildOpponentsByTeam(S: StructureBuilder) {
  return S.list()
    .title("Avversari per squadra")
    .items(
      TEAM_ITEMS.map((t) =>
        S.listItem()
          .id(`opponents-${t.slug}`)
          .title(t.label)
          .icon(Swords)
          .child(
            S.documentList()
              .title(`Avversari ${t.label}`)
              .schemaType("opponent")
              .filter(
                '_type == "opponent" && competition->targetTeam->slug.current == $slug',
              )
              .params({ slug: t.slug })
              .defaultOrdering([
                { field: "club.name", direction: "asc" },
              ])
              .canHandleIntent(
                (intentName, params) =>
                  intentName === "edit" && params.type === "opponent",
              ),
          ),
      ),
    );
}

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title("Orbassano Calcio")
    .items([
      // ----- IMPOSTAZIONI ------------------------------------------------
      S.listItem()
        .title("Impostazioni globali")
        .icon(Cog)
        .child(
          S.editor()
            .id("settings")
            .schemaType("settings")
            .documentId("settings"),
        ),

      S.divider(),

      // ----- STAGIONE CORRENTE ------------------------------------------
      S.listItem()
        .title("Stagione corrente")
        .icon(CalendarDays)
        .child(
          S.list()
            .title(`Stagione ${CURRENT_SEASON}`)
            .items([
              S.listItem()
                .title("Squadre")
                .icon(Users)
                .child(
                  S.list()
                    .title("Squadre")
                    .items([
                      S.listItem()
                        .title("Anagrafica squadre")
                        .icon(Users)
                        .child(
                          S.documentTypeList("team")
                            .title("Squadre")
                            .defaultOrdering([
                              { field: "order", direction: "asc" },
                            ]),
                        ),
                      // Staff tecnico club-wide (direttore sportivo,
                      // direttore tecnico, etc.) renderizzato in fondo
                      // alla pagina /squadre con la stessa grafica
                      // della YouthStaffSection (watermark gold +
                      // griglia ruolo/nome).
                      S.listItem()
                        .title("Staff tecnico")
                        .icon(Briefcase)
                        .child(
                          S.documentTypeList("technicalStaff")
                            .title("Staff tecnico")
                            .defaultOrdering([
                              { field: "order", direction: "asc" },
                            ]),
                        ),
                      // Shortcut diretto al fieldset "Pagina /squadre"
                      // del singleton settings: l'utente edita eyebrow
                      // + titolo h2 delle 3 sezioni (Prima Squadra /
                      // Juniores / Settore Giovanile) senza scendere
                      // a Impostazioni globali e cercare il fieldset.
                      S.listItem()
                        .title("Impostazioni pagina /squadre")
                        .icon(Cog)
                        .child(
                          S.editor()
                            .id("settings-squadre-page")
                            .schemaType("settings")
                            .documentId("settings"),
                        ),
                    ]),
                ),
              S.listItem()
                .title("Competizioni")
                .icon(Trophy)
                .child(
                  S.documentList()
                    .title(`Competizioni ${CURRENT_SEASON}`)
                    .schemaType("competition")
                    .filter(
                      '_type == "competition" && season == $season',
                    )
                    .params({ season: CURRENT_SEASON }),
                ),
              S.listItem()
                .title("Avversari per squadra")
                .icon(Swords)
                .child(buildOpponentsByTeam(S)),
              S.listItem()
                .title("Partite per squadra")
                .icon(CalendarDays)
                .child(buildMatchesByTeam(S)),
              S.listItem()
                .title("Giocatori")
                .icon(Users)
                .child(S.documentTypeList("player").title("Giocatori")),
            ]),
        ),

      S.divider(),

      // ----- ANAGRAFICHE TRASVERSALI -----------------------------------
      S.listItem()
        .title("Club avversari")
        .icon(Shield)
        .child(
          S.documentTypeList("club")
            .title("Club avversari (anagrafica)")
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),

      // ----- SETTORE GIOVANILE -----------------------------------------
      // Open Days (sessioni di prova pre-stagione) + Tornei (eventi
      // organizzati o ospitati). Vivono fuori da "Stagione corrente"
      // perche' la stagione e' un field del singolo documento.
      S.listItem()
        .title("Settore Giovanile")
        .icon(GraduationCap)
        .child(
          S.list()
            .title("Settore Giovanile")
            .items([
              S.documentTypeListItem("openDay")
                .title("Open Days")
                .icon(CalendarCheck),
              S.documentTypeListItem("tournament")
                .title("Tornei")
                .icon(Trophy),
            ]),
        ),

      // ----- AREE EDITORIALI -------------------------------------------
      S.listItem()
        .title("Società")
        .icon(Building2)
        .child(
          S.list()
            .title("Società")
            .items([
              S.documentTypeListItem("clubOfficial").title("Organigramma"),
              S.documentTypeListItem("facility")
                .title("Impianti sportivi")
                .icon(MapPin),
              S.documentTypeListItem("timelineEvent")
                .title("Eventi storici (timeline)")
                .icon(Milestone),
            ]),
        ),
      S.listItem()
        .title("Governance & trasparenza")
        .icon(Briefcase)
        .child(
          S.list()
            .title("Governance & trasparenza")
            .items([
              S.listItem()
                .title("Riferimenti operativi (Codice Etico)")
                .icon(Briefcase)
                .child(
                  S.editor()
                    .id("riferimentiOperativi")
                    .schemaType("riferimentiOperativi")
                    .documentId("riferimentiOperativi"),
                ),
              S.documentTypeListItem("trasparenza5x1000")
                .title("Rendicontazione 5×1000")
                .icon(Coins),
              S.documentTypeListItem("segnalazione")
                .title("Segnalazioni (RISERVATE)")
                .icon(ShieldAlert),
            ]),
        ),
      S.documentTypeListItem("news").title("News").icon(Newspaper),
      S.documentTypeListItem("gallery")
        .title("Gallery (album foto)")
        .icon(Images),
      S.documentTypeListItem("sponsor")
        .title("Sponsor & partner")
        .icon(Handshake),
      S.documentTypeListItem("heroSlide")
        .title("Slide hero homepage")
        .icon(ImageIcon),

      S.divider(),

      // ----- ARCHIVIO ---------------------------------------------------
      S.listItem()
        .title("Archivio")
        .icon(Archive)
        .child(
          S.list()
            .title("Archivio stagioni passate")
            .items([
              S.listItem()
                .title("Competizioni archiviate")
                .icon(Trophy)
                .child(
                  S.documentList()
                    .title("Competizioni stagioni passate")
                    .schemaType("competition")
                    .filter(
                      '_type == "competition" && season != $season',
                    )
                    .params({ season: CURRENT_SEASON })
                    .defaultOrdering([
                      { field: "season", direction: "desc" },
                    ]),
                ),
              S.listItem()
                .title("Partite archiviate")
                .icon(CalendarDays)
                .child(buildArchivedMatchesByTeam(S)),
              S.listItem()
                .title("Club inattivi")
                .icon(Shield)
                .child(
                  S.documentList()
                    .title("Club inattivi")
                    .schemaType("club")
                    .filter('_type == "club" && isActive == false')
                    .defaultOrdering([{ field: "name", direction: "asc" }]),
                ),
            ]),
        ),

      S.divider(),

      // ----- SISTEMA ----------------------------------------------------
      S.documentTypeListItem("consentLog")
        .title("Log consensi cookie")
        .icon(ShieldCheck),
    ]);
