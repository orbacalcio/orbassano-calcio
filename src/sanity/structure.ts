import {
  Building2,
  Cog,
  Handshake,
  Image as ImageIcon,
  MapPin,
  Milestone,
  Newspaper,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

/**
 * Desk Structure custom per lo Studio.
 *
 * Organizza i contenuti per area logica del sito anziche' come elenco
 * piatto di document type. L'admin del club non deve cercare 'sponsor'
 * tra 'team' e 'news', li trova subito sotto 'Sponsor & Partner'.
 *
 * Singleton 'settings': accessibile come item unico in cima.
 */
export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title("Orbassano Calcio")
    .items([
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
      S.listItem()
        .title("Squadre & rosa")
        .icon(Users)
        .child(
          S.list()
            .title("Squadre & rosa")
            .items([
              S.documentTypeListItem("team").title("Squadre"),
              S.documentTypeListItem("player").title("Giocatori"),
            ]),
        ),
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
      S.documentTypeListItem("news").title("News").icon(Newspaper),
      S.documentTypeListItem("match").title("Partite").icon(Trophy),
      S.documentTypeListItem("sponsor")
        .title("Sponsor & partner")
        .icon(Handshake),
      S.documentTypeListItem("heroSlide")
        .title("Slide hero homepage")
        .icon(ImageIcon),
      S.divider(),
      S.documentTypeListItem("consentLog")
        .title("Log consensi cookie")
        .icon(ShieldCheck),
    ]);
