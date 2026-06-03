import { NextResponse, type NextRequest } from "next/server";
import { CLUB_EMAIL, sendTransactionalEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  escapeHtml,
  isEmail,
  looksLikeSpam,
  nonEmpty,
  trimToMax,
} from "@/lib/validation";

/**
 * Form contatti generico → email a CLUB_EMAIL via Brevo, con replyTo
 * sull'utente. In dev (senza BREVO_API_KEY) logga e simula success.
 *
 * Body atteso:
 * { name, email, phone?, subject, message, privacy }
 */
type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
  privacy?: unknown;
};

export async function POST(req: NextRequest) {
  const rl = checkRateLimit({
    req,
    bucket: "contact",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Troppe richieste. Riprova fra ${Math.ceil(rl.retryAfter / 60)} minuti.`,
      },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload JSON non valido." },
      { status: 400 },
    );
  }

  const name = trimToMax(String(body.name ?? ""), 120);
  const email = trimToMax(String(body.email ?? ""), 180);
  const phone = trimToMax(String(body.phone ?? ""), 40);
  const subject = trimToMax(String(body.subject ?? ""), 140);
  const message = trimToMax(String(body.message ?? ""), 2000);
  const privacy = body.privacy === true;

  if (!privacy) {
    return NextResponse.json(
      { ok: false, error: "Devi accettare l'informativa privacy." },
      { status: 400 },
    );
  }
  if (!nonEmpty(name) || !nonEmpty(subject) || !nonEmpty(message)) {
    return NextResponse.json(
      { ok: false, error: "Compila i campi obbligatori." },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Indirizzo email non valido." },
      { status: 400 },
    );
  }
  if (looksLikeSpam(message)) {
    return NextResponse.json(
      { ok: false, error: "Messaggio rifiutato dai filtri anti-spam." },
      { status: 400 },
    );
  }

  const html = renderEmail({
    name,
    email,
    phone,
    subject,
    message,
  });

  const result = await sendTransactionalEmail({
    to: CLUB_EMAIL,
    subject: `Contatto sito: ${subject}`,
    html,
    replyTo: email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function renderEmail(p: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): string {
  return `
    <!doctype html>
    <html lang="it">
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#0A1428; color:#F5F7FA;">
        <h1 style="font-size: 22px; color:#C9A35D; margin: 0 0 8px;">Nuovo messaggio dal sito</h1>
        <p style="color:#A8B5CC; font-size:13px; margin: 0 0 24px;">Form /contatti</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Da</td>
            <td style="padding: 8px 0; color:#F5F7FA;">${escapeHtml(p.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(p.email)}" style="color:#C9A35D;">${escapeHtml(p.email)}</a></td>
          </tr>
          ${
            p.phone
              ? `<tr>
                  <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Telefono</td>
                  <td style="padding: 8px 0;"><a href="tel:${escapeHtml(p.phone)}" style="color:#C9A35D;">${escapeHtml(p.phone)}</a></td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Oggetto</td>
            <td style="padding: 8px 0; color:#F5F7FA;">${escapeHtml(p.subject)}</td>
          </tr>
        </table>
        <hr style="border:none; border-top:1px solid #1F2F4D; margin: 24px 0;" />
        <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(p.message)}</p>
      </body>
    </html>
  `;
}
