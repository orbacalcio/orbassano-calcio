import { NextResponse, type NextRequest } from "next/server";
import {
  EMAIL_DIVIDER,
  emailParagraph,
  emailRow,
  emailLinkRow,
  renderEmailShell,
} from "@/lib/email-shell";
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
  const rows = [
    emailRow("Da", escapeHtml(p.name)),
    emailLinkRow(
      "Email",
      `mailto:${escapeHtml(p.email)}`,
      escapeHtml(p.email),
    ),
    p.phone
      ? emailLinkRow(
          "Telefono",
          `tel:${escapeHtml(p.phone)}`,
          escapeHtml(p.phone),
        )
      : "",
    emailRow("Oggetto", escapeHtml(p.subject)),
  ]
    .filter(Boolean)
    .join("\n");
  return renderEmailShell({
    eyebrow: "ASD Orbassano Calcio",
    title: "Nuovo messaggio dal sito",
    subtitle: "Form /contatti",
    contentHtml: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
${rows}
</table>
${EMAIL_DIVIDER}
${emailParagraph(escapeHtml(p.message))}`,
  });
}
