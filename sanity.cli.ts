import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "@/sanity/env";

/**
 * Configurazione del CLI di Sanity (e dello Studio embedded).
 *
 * `autoUpdates: false` — disattiva il check automatico della versione
 * Sanity contro npm registry, che produceva un errore TypeError
 * "Failed to fetch version for package 'sanity'" quando il browser
 * non riesce a raggiungere registry.npmjs.org (firewall, adblocker,
 * connessione instabile). L'errore era cosmetico ma rumoroso. Gli
 * aggiornamenti restano gestiti manualmente via `pnpm up sanity`.
 */
export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  autoUpdates: false,
});
