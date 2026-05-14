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

/**
 * Verifica che una URL sia sicura da usare in attributi `href`/`src`.
 *
 * Accetta solo schemi safe (http/https/mailto/tel) e percorsi relativi
 * (`/`, `#`, `?`). Rifiuta `javascript:`, `data:`, `vbscript:` etc.
 * che possono eseguire codice quando l'utente clicca il link.
 *
 * Difesa contro:
 *  - XSS via campo `linkValue.href` in PortableText (admin Studio)
 *  - XSS via campo `website` nel form sponsor-lead (utente esterno)
 *  - XSS via campo `externalLink`/`mapsUrl`/`websiteUrl` in CMS
 *
 * Sanity validation `Rule.uri({ scheme: ['http','https'] })` blocca
 * questi schemi a livello editor, ma e' UI-only (un admin determinato
 * puo' bypassare con "Pubblica forzato"). Defense-in-depth lato render.
 */
export function isSafeUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  // Percorsi relativi e fragment-only sono sempre safe.
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) {
    return true;
  }
  // Schemi assoluti consentiti. Case-insensitive + tollera spazi/tab
  // prima dello schema (es. browser tipo strip whitespace).
  return /^(https?|mailto|tel):/i.test(trimmed);
}

/** Helper render-side: ritorna `value` se safe, altrimenti `fallback` (default "#"). */
export function safeUrlOr(
  value: string | null | undefined,
  fallback = "#",
): string {
  return isSafeUrl(value) ? value!.trim() : fallback;
}
