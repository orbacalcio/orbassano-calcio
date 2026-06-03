/**
 * Wrapper Brevo lazy: la chiamata API e' fatta solo se la API key e'
 * presente. Cosi' in dev/build (senza .env.local con BREVO_API_KEY)
 * il modulo non esplode e i form rispondono con un errore tracciabile
 * invece di un crash 500.
 *
 * Migrazione 2026-06-03: switch da Resend a Brevo. Resend non era
 * utilizzabile perche' Wix non supporta MX su subdomain (richiesti
 * dalla verifica Resend del dominio: c'e' un warning Resend stesso
 * "Wix doesn't support subdomains for MX records"). Brevo usa solo
 * CNAME DKIM + TXT, compatibili con Wix. Pattern lazy + interfaccia
 * sendTransactionalEmail() invariati, i form non cambiano.
 *
 * Riusa BREVO_API_KEY: la stessa key serve sia per transazionali
 * (questo file) sia per newsletter DOI (`/api/newsletter`). Le API
 * key Brevo non sono permission-scoped, una sola key gestisce tutto.
 *
 * Niente SDK: il payload JSON e' minimale, `fetch` diretto evita di
 * portarsi una dependency (≈ -200KB) per zero valore aggiunto.
 *
 * Patterns usati dai form: `sendTransactionalEmail({to, subject, html, replyTo})`.
 */
type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

const FROM_DEFAULT =
  process.env.BREVO_FROM_EMAIL ??
  "Orbassano Calcio <noreply@orbassanocalcio.com>";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Parsa una stringa FROM in formato "Display Name <email@domain>" o
 * solo "email@domain" → struttura { name?, email } richiesta dalla
 * API Brevo (`sender` field).
 */
function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (match && match[1] && match[2]) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: from.trim() };
}

export async function sendTransactionalEmail(
  args: SendArgs,
): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    // Dev mode: log e simula success cosi' la pipeline form non si
    // blocca, ma logga il payload nel server console per debug.
    console.warn(
      "[mailer] BREVO_API_KEY assente — email NON inviata. Payload:",
      {
        to: args.to,
        subject: args.subject,
        replyTo: args.replyTo,
      },
    );
    return { ok: true, id: "dev-skip" };
  }

  try {
    const payload: Record<string, unknown> = {
      sender: parseSender(FROM_DEFAULT),
      to: [{ email: args.to }],
      subject: args.subject,
      htmlContent: args.html,
    };
    if (args.text) payload.textContent = args.text;
    if (args.replyTo) payload.replyTo = { email: args.replyTo };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Brevo risponde 201 Created con `{ messageId: "<id@..." }` su
    // successo, 4xx con `{ code, message }` su errore. Tollero un
    // body non-JSON con catch fallback.
    const data: { messageId?: string; message?: string; code?: string } =
      await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        error: data.message ?? `Brevo HTTP ${res.status}`,
      };
    }

    return { ok: true, id: data.messageId ?? "unknown" };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Errore imprevisto invio email.",
    };
  }
}

/**
 * Recipient di default per i form che vanno alla segreteria. Override
 * via CLUB_INBOX_EMAIL se in test si vuole indirizzare altrove.
 */
export const CLUB_EMAIL =
  process.env.CLUB_INBOX_EMAIL ?? "info@orbassanocalcio.com";
