/**
 * Shell HTML condivisa per email transazionali (form contatti,
 * sponsor lead, whistleblowing, notifica admin newsletter).
 *
 * Design (richiesta utente 2026-06-03):
 * - Header navy `surface-0` con eyebrow oro + titolo bianco
 * - Body card bianca con testo navy scuro
 * - Footer grigio chiaro col branding minimal
 *
 * Layout table-based per massima compatibilita' coi client email
 * (Outlook desktop in particolare ignora display:flex/grid). Niente
 * @media queries: i client mobili scalano la table fluida.
 *
 * Niente <head> con <title> esplicito perche' i client email
 * ignorano <head> e mostrano l'oggetto del messaggio.
 */
export function renderEmailShell(opts: {
  /** Mini-tag in alto (es. "ASD ORBASSANO CALCIO"). Maiuscolo, tracking ampio. */
  eyebrow: string;
  /** Titolo H1 (es. "Nuovo messaggio dal sito"). */
  title: string;
  /** Sottotitolo opzionale sotto al titolo nel header navy (es. nome form). */
  subtitle?: string;
  /** HTML del contenuto principale (table di righe etichetta/valore + paragrafi). */
  contentHtml: string;
  /** Override footer (default: branding standard). */
  footerNote?: string;
}): string {
  const footer =
    opts.footerNote ??
    "ASD Orbassano Calcio · Dal 1930 · info@orbassanocalcio.com";
  const subtitleBlock = opts.subtitle
    ? `<p style="margin:6px 0 0;color:#a8b5cc;font-size:13px;line-height:1.4;">${opts.subtitle}</p>`
    : "";
  return `<!doctype html>
<html lang="it">
  <body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f2f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(10,20,40,0.08);">
            <tr>
              <td style="background:#0A1428;padding:28px 32px;">
                <p style="margin:0;color:#dfb16c;font-size:11px;font-weight:bold;letter-spacing:0.28em;text-transform:uppercase;">${opts.eyebrow}</p>
                <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:bold;line-height:1.25;">${opts.title}</h1>
                ${subtitleBlock}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;background:#ffffff;color:#0A1428;font-size:14px;line-height:1.6;">
${opts.contentHtml}
              </td>
            </tr>
            <tr>
              <td style="background:#f0f2f5;padding:16px 32px;border-top:1px solid #e1e6ee;">
                <p style="margin:0;color:#626f8d;font-size:11px;text-align:center;letter-spacing:0.05em;">${footer}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Helper per le righe etichetta/valore comuni in tutte le email.
 * Esempio: emailRow("Da", escapeHtml(name)) → <tr>...<td>DA</td><td>Mario Rossi</td></tr>
 */
export function emailRow(label: string, valueHtml: string): string {
  return `<tr>
  <td style="padding:8px 0;color:#626f8d;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;width:30%;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;color:#0A1428;font-size:14px;">${valueHtml}</td>
</tr>`;
}

/** Variante row per link (mailto/tel/url): colore rosso brand. */
export function emailLinkRow(label: string, href: string, text: string): string {
  return emailRow(
    label,
    `<a href="${href}" style="color:#e91f22;text-decoration:none;">${text}</a>`,
  );
}

/** Separatore orizzontale (hr) coerente col design shell. */
export const EMAIL_DIVIDER = `<hr style="border:none;border-top:1px solid #e1e6ee;margin:24px 0;" />`;

/** Wrapper paragrafo body preservando newline (white-space:pre-wrap). */
export function emailParagraph(textHtml: string): string {
  return `<p style="white-space:pre-wrap;line-height:1.6;color:#0A1428;font-size:14px;margin:0;">${textHtml}</p>`;
}

/** Sezione con titolo eyebrow + contenuto (usato dal whistleblowing per i blocchi). */
export function emailSection(title: string, contentHtml: string): string {
  return `<h2 style="font-size:12px;color:#626f8d;text-transform:uppercase;letter-spacing:0.12em;margin:24px 0 12px;font-weight:bold;border-bottom:1px solid #e1e6ee;padding-bottom:6px;">${title}</h2>
${contentHtml}`;
}
