import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

/**
 * Configurazione Sanity Studio embedded su /studio.
 * Il client Studio (browser) leggera' projectId/dataset dalle env vars
 * NEXT_PUBLIC_SANITY_PROJECT_ID e NEXT_PUBLIC_SANITY_DATASET.
 */
export default defineConfig({
  name: "orbassano-calcio",
  title: "Orbassano Calcio · CMS",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // Vision: query GROQ live nello Studio (utile in dev e per l'admin del club)
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
