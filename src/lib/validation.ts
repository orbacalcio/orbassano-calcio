/**
 * Validatori puri per i form. Niente dipendenze su zod (dimensione
 * bundle): regex/length checks + helper di sanitizzazione.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function trimToMax(v: string, max: number): string {
  return v.trim().slice(0, max);
}

export function nonEmpty(v: string): boolean {
  return v.trim().length > 0;
}

export function minLength(v: string, n: number): boolean {
  return v.trim().length >= n;
}

export function isInList<T extends string>(v: string, list: readonly T[]): v is T {
  return (list as readonly string[]).includes(v);
}

/**
 * Verifica formato ISO date "YYYY-MM-DD" + valida che sia una data
 * reale (es. 2026-13-40 fallisce).
 */
export function isIsoDate(v: string): boolean {
  if (!ISO_DATE_RE.test(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
}

/**
 * Soglia anti-spam molto basica: rifiuta payload con > N link o con
 * sequenza di caratteri non-latino-1 (cyrillic spam) eccessiva. Non e'
 * sostituto di un captcha, ma evita il 90% del bot scraping.
 */
export function looksLikeSpam(message: string): boolean {
  const linkCount = (message.match(/https?:\/\//gi) ?? []).length;
  if (linkCount > 4) return true;
  const cyrillic = (message.match(/[Ѐ-ӿ]/g) ?? []).length;
  if (cyrillic > 20) return true;
  return false;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
