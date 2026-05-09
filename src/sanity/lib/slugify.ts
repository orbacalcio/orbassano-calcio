/**
 * Slugifier condiviso fra schema (`options.slugify` del bottone Genera)
 * e custom input AutoSlugInput. Tenuto qui DRY cosi' il bottone manuale
 * e l'auto-fill producono ESATTAMENTE lo stesso risultato.
 *
 * Strategia:
 * - normalize NFD + strip diacritici (à -> a, è -> e)
 * - tutto lowercase
 * - sequenze non-alfanumeriche → "-"
 * - trim trattini iniziali/finali
 * - cap 96 caratteri (limite slug Sanity)
 */
export function slugifyTitle(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
