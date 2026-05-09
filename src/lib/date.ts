/**
 * Helper di formattazione data in italiano. Centralizzato per
 * evitare lo spread di `toLocaleDateString` con opzioni
 * leggermente diverse in mezza app.
 */

export function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatItalianShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getYearFromIso(iso: string): number {
  return new Date(iso).getFullYear();
}
