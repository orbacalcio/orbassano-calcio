import { NextResponse, type NextRequest } from "next/server";
import { CLUB_EMAIL, sendTransactionalEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  escapeHtml,
  isEmail,
  isSafeUrl,
  looksLikeSpam,
  nonEmpty,
  trimToMax,
} from "@/lib/validation";

/**
 * Form lead-gen sponsor → email a CLUB_EMAIL (in futuro mirata
 * direttamente al direttore generale via env CLUB_SPONSOR_INBOX).
 *
 * Body atteso:
 * { company, contactName, role?, email, phone?, website?, packageType?, message, privacy }
 */
type Payload = Record<string, unknown>;

const TARGET_EMAIL = process.env.CLUB_SPONSOR_INBOX ?? CLUB_EMAIL;

const PACKAGE_LABELS: Record<string, string> = {
  main: "Main Sponsor",
  official: "Official Sponsor",
  partner: "Corporate Partner",
  evento: "Sponsorizzazione evento singolo",
  other: "Altro / da definire",
};

export async function POST(req: NextRequest) {
  const rl = checkRateLimit({
    req,
    bucket: "sponsor-lead",
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

  const company = trimToMax(String(body.company ?? ""), 140);
  const contactName = trimToMax(String(body.contactName ?? ""), 120);
  const role = trimToMax(String(body.role ?? ""), 120);
  const email = trimToMax(String(body.email ?? ""), 180);
  const phone = trimToMax(String(body.phone ?? ""), 40);
  // website: sanitize per evitare XSS via `javascript:` URI nella mail
  // admin (l'utente puo' compilare il campo con qualsiasi cosa). Se non
  // safe, droppiamo il campo dalla mail invece di rifiutare l'intero
  // form: la lead resta utile, l'admin la contatta via email.
  const websiteRaw = trimToMax(String(body.website ?? ""), 240);
  const website = isSafeUrl(websiteRaw) ? websiteRaw : "";
  const packageType = trimToMax(String(body.packageType ?? ""), 32);
  const message = trimToMax(String(body.message ?? ""), 2000);
  const privacy = body.privacy === true;

  if (!privacy) {
    return NextResponse.json(
      { ok: false, error: "Devi accettare l'informativa privacy." },
      { status: 400 },
    );
  }
  if (
    !nonEmpty(company) ||
    !nonEmpty(contactName) ||
    !nonEmpty(message)
  ) {
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

  const packageLabel = PACKAGE_LABELS[packageType] ?? "non specificato";

  const html = renderEmail({
    company,
    contactName,
    role,
    email,
    phone,
    website,
    packageLabel,
    message,
  });

  const result = await sendTransactionalEmail({
    to: TARGET_EMAIL,
    subject: `Sponsor lead: ${company} (${packageLabel})`,
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
  company: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  website: string;
  packageLabel: string;
  message: string;
}): string {
  return `
    <!doctype html>
    <html lang="it">
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#0A1428; color:#F5F7FA;">
        <h1 style="font-size: 22px; color:#C9A35D; margin: 0 0 8px;">Nuova richiesta sponsor</h1>
        <p style="color:#A8B5CC; font-size:13px; margin: 0 0 24px;">Form /sponsor/opportunita</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Azienda</td>
            <td style="padding: 8px 0; color:#F5F7FA;">${escapeHtml(p.company)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Referente</td>
            <td style="padding: 8px 0; color:#F5F7FA;">${escapeHtml(p.contactName)}${p.role ? ` &middot; ${escapeHtml(p.role)}` : ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(p.email)}" style="color:#C9A35D;">${escapeHtml(p.email)}</a></td>
          </tr>
          ${
            p.phone
              ? `<tr><td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Telefono</td><td style="padding: 8px 0;"><a href="tel:${escapeHtml(p.phone)}" style="color:#C9A35D;">${escapeHtml(p.phone)}</a></td></tr>`
              : ""
          }
          ${
            p.website
              ? `<tr><td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Sito</td><td style="padding: 8px 0;"><a href="${escapeHtml(p.website)}" style="color:#C9A35D;">${escapeHtml(p.website)}</a></td></tr>`
              : ""
          }
          <tr>
            <td style="padding: 8px 0; color:#A8B5CC; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Pacchetto</td>
            <td style="padding: 8px 0; color:#F5F7FA;">${escapeHtml(p.packageLabel)}</td>
          </tr>
        </table>
        <hr style="border:none; border-top:1px solid #1F2F4D; margin: 24px 0;" />
        <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(p.message)}</p>
      </body>
    </html>
  `;
}
