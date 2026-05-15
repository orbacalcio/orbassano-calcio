import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { ClearGalleryAction } from "@/sanity/actions/clearGalleryAction";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

/**
 * Configurazione Sanity Studio embedded su /studio.
 * Il client Studio (browser) leggera' projectId/dataset dalle env vars
 * NEXT_PUBLIC_SANITY_PROJECT_ID e NEXT_PUBLIC_SANITY_DATASET.
 *
 * `schema.templates`: registriamo template parametrici riusati dalle
 * viste "Partite per squadra" / "Avversari per squadra" per
 * pre-compilare i campi reference quando l'admin clicca "+ Create" da
 * una vista filtrata. Senza questi template l'admin dovrebbe
 * ri-selezionare manualmente la squadra (doppio lavoro).
 */
export default defineConfig({
  name: "orbassano-calcio",
  title: "Orbassano Calcio · CMS",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: "match-by-team",
        title: "Partita (squadra preselezionata)",
        description:
          "Crea una partita con la squadra Orbassano gia' impostata dal contesto.",
        schemaType: "match",
        parameters: [{ name: "teamId", type: "string" }],
        value: ({ teamId }: { teamId: string }) => ({
          team: { _type: "reference", _ref: teamId },
        }),
      },
    ],
  },
  plugins: [
    structureTool({ structure }),
    // Vision: query GROQ live nello Studio (utile in dev e per l'admin del club)
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Document Actions custom. Le actions standard (Publish, Discard,
    // Duplicate, Unpublish, Delete) restano via `prev`; aggiungiamo
    // azioni mirate per schema type. ClearGalleryAction svuota in un
    // colpo l'array images di un album gallery (alternativa al delete
    // manuale di N foto una a una).
    actions: (prev, context) => {
      if (context.schemaType === "gallery") {
        return [...prev, ClearGalleryAction];
      }
      return prev;
    },
  },
});
