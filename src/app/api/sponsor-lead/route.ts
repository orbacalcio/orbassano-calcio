import { NextResponse, type NextRequest } from "next/server";
import {
  EMAIL_DIVIDER,
  emailLinkRow,
  emailParagraph,
  emailRow,
  renderEmailShell,
} from "@/lib/email-shell";
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

  // Honeypot anti-bot: vedi commento /api/contact. 200 OK fake.
  if (typeof body._honeypot === "string" && body._honeypot.length > 0) {
    return NextResponse.json({ ok: true });
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
  const refValue = p.role
    ? `${escapeHtml(p.contactName)} &middot; ${escapeHtml(p.role)}`
    : escapeHtml(p.contactName);
  const rows = [
    emailRow("Azienda", escapeHtml(p.company)),
    emailRow("Referente", refValue),
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
    p.website
      ? emailLinkRow("Sito", escapeHtml(p.website), escapeHtml(p.website))
      : "",
    emailRow("Pacchetto", escapeHtml(p.packageLabel)),
  ]
    .filter(Boolean)
    .join("\n");
  return renderEmailShell({
    eyebrow: "ASD Orbassano Calcio",
    title: "Nuova richiesta sponsor",
    subtitle: "Form /sponsor/opportunita",
    contentHtml: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
${rows}
</table>
${EMAIL_DIVIDER}
${emailParagraph(escapeHtml(p.message))}`,
  });
}
