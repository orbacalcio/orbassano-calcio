/**
 * Feature flag client-safe per moduli del sito attivabili via env var
 * senza redeploy del codice. Tutti i flag sono `NEXT_PUBLIC_*` cosi'
 * funzionano sia su server components che client components.
 *
 * Default OFF per sicurezza: l'abilitazione richiede consenso esplicito
 * (delibera Direttivo per Governance, decisione operativa per
 * Turnstile, etc.) — nessun cambio di default senza decisione umana.
 *
 * Convenzione: il check e' `=== "true"` stringa, NON `Boolean(process.env.X)`,
 * perche' Next inietta le NEXT_PUBLIC_* come stringhe vuote quando
 * non valorizzate, e una stringa vuota e' truthy/falsy in JS solo per
 * `Boolean(...)`. Il check stringa esplicita evita ambiguita'.
 */
export const FEATURES = {
  /**
   * Sezione Governance: pagine /societa/codice-etico,
   * /societa/trasparenza, /societa/segnalazioni + endpoint
   * /api/whistleblowing.
   *
   * Disattivato finche' il Direttivo non approva formalmente il
   * Codice Etico (art. 12.6). Quando off:
   *   - le 3 pagine ritornano notFound() (404)
   *   - l'API route ritorna 404
   *   - sitemap esclude le 3 URL
   *   - footer + hub cards condizionano visibilita'
   *
   * Per abilitare: setta NEXT_PUBLIC_FEATURE_GOVERNANCE=true in
   * Vercel env vars + redeploy.
   */
  governanceSection: process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE === "true",

  /**
   * Cloudflare Turnstile su WhistleblowingForm.
   *
   * Pianificato per M9 dopo il cutover live, quando avremo dati su
   * bot reali. Fino a quel momento, l'anti-bot e' garantito da:
   *   - Honeypot field (sempre attivo)
   *   - Rate limit IP-based in-memory (sempre attivo)
   *
   * TODO: enable Turnstile in M9
   *   1. Account Cloudflare → Turnstile widget → site/secret keys
   *   2. NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY in env
   *   3. NEXT_PUBLIC_FEATURE_TURNSTILE=true
   *   4. Implementazione: <script async> + verifica server-side
   *      challenges.cloudflare.com/turnstile/v0/siteverify
   */
  turnstileEnabled: process.env.NEXT_PUBLIC_FEATURE_TURNSTILE === "true",
} as const;

export type Features = typeof FEATURES;
