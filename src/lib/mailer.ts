/**
 * Wrapper Resend lazy: l'import del client e' fatto solo se la API
 * key e' presente. Cosi' in dev/build (senza .env.local con
 * RESEND_API_KEY) il modulo non esplode e i form rispondono con un
 * errore tracciabile invece di un crash 500.
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
  process.env.RESEND_FROM_EMAIL ?? "Orbassano Calcio <onboarding@resend.dev>";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendTransactionalEmail(
  args: SendArgs,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev mode: log e simula success cosi' la pipeline form non si
    // blocca, ma logga il payload nel server console per debug.
    console.warn(
      "[mailer] RESEND_API_KEY assente — email NON inviata. Payload:",
      {
        to: args.to,
        subject: args.subject,
        replyTo: args.replyTo,
      },
    );
    return { ok: true, id: "dev-skip" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM_DEFAULT,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    if (error) return { ok: false, error: error.message ?? "Resend error" };
    return { ok: true, id: data?.id ?? "unknown" };
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
 * via NEXT_PUBLIC_CLUB_EMAIL se in test si vuole indirizzare altrove.
 */
export const CLUB_EMAIL =
  process.env.CLUB_INBOX_EMAIL ?? "info@orbassanocalcio.com";
