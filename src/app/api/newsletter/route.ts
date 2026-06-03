import { NextResponse, type NextRequest } from "next/server";
import {
  emailLinkRow,
  emailRow,
  renderEmailShell,
} from "@/lib/email-shell";
import { CLUB_EMAIL, sendTransactionalEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  escapeHtml,
  isEmail,
  nonEmpty,
  trimToMax,
} from "@/lib/validation";

/**
 * Newsletter subscribe → 3 step:
 *  1. Validation lato server (email, privacy)
 *  2. Se BREVO_API_KEY presente: aggiunge il contatto alla lista Brevo
 *     in modalità double opt-in (Brevo invia il template di conferma).
 *  3. Notifica admin via Brevo transazionale con riepilogo del nuovo iscritto.
 *
 * Senza BREVO_API_KEY: fallback graceful — l'email viene comunque
 * notificata all'admin che la aggiungerà manualmente, e l'utente
 * riceve un thank-you con istruzioni.
 *
 * Body atteso: { firstName?, email, privacy }
 */
type Payload = {
  firstName?: unknown;
  email?: unknown;
  privacy?: unknown;
};

const BREVO_LIST_ID = process.env.BREVO_NEWSLETTER_LIST_ID;
const BREVO_DOI_TEMPLATE_ID = process.env.BREVO_DOI_TEMPLATE_ID;
const BREVO_REDIRECT_URL =
  process.env.BREVO_DOI_REDIRECT_URL ?? "https://orbassanocalcio.com/newsletter";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit({
    req,
    bucket: "newsletter",
    limit: 3,
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

  const firstName = trimToMax(String(body.firstName ?? ""), 80);
  const email = trimToMax(String(body.email ?? ""), 180);
  const privacy = body.privacy === true;

  if (!privacy) {
    return NextResponse.json(
      { ok: false, error: "Devi accettare l'informativa privacy." },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Indirizzo email non valido." },
      { status: 400 },
    );
  }

  // Step 2: Brevo double opt-in (best effort, non bloccante)
  const brevoResult = await brevoDoubleOptIn({ firstName, email });

  // Step 3: notify admin via Resend
  await sendTransactionalEmail({
    to: CLUB_EMAIL,
    subject: `Newsletter: nuova iscrizione (${email})`,
    html: renderAdminEmail({ firstName, email, brevoResult }),
  });

  return NextResponse.json({ ok: true });
}

type BrevoResult =
  | { kind: "skipped"; reason: string }
  | { kind: "ok" }
  | { kind: "error"; message: string };

async function brevoDoubleOptIn(p: {
  firstName: string;
  email: string;
}): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !BREVO_LIST_ID || !BREVO_DOI_TEMPLATE_ID) {
    return {
      kind: "skipped",
      reason: "Brevo non configurato (BREVO_API_KEY/LIST_ID/DOI_TEMPLATE_ID mancanti).",
    };
  }

  if (!nonEmpty(p.email)) {
    return { kind: "error", message: "Email vuota." };
  }

  try {
    const res = await fetch(
      "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
      {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email: p.email,
          attributes: p.firstName ? { FIRSTNAME: p.firstName } : undefined,
          includeListIds: [Number(BREVO_LIST_ID)],
          templateId: Number(BREVO_DOI_TEMPLATE_ID),
          redirectionUrl: BREVO_REDIRECT_URL,
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        kind: "error",
        message: `Brevo HTTP ${res.status}: ${text || "no body"}`,
      };
    }
    return { kind: "ok" };
  } catch (err) {
    return {
      kind: "error",
      message: err instanceof Error ? err.message : "Brevo fetch failed",
    };
  }
}

function renderAdminEmail(p: {
  firstName: string;
  email: string;
  brevoResult: BrevoResult;
}): string {
  const status =
    p.brevoResult.kind === "ok"
      ? "Confirmation email inviata da Brevo (double opt-in attivo)."
      : p.brevoResult.kind === "skipped"
        ? `Brevo non configurato: ${p.brevoResult.reason} — aggiungi manualmente alla lista.`
        : `Brevo errore: ${p.brevoResult.message} — verifica configurazione.`;

  const rows = [
    emailRow("Nome", escapeHtml(p.firstName || "—")),
    emailLinkRow(
      "Email",
      `mailto:${escapeHtml(p.email)}`,
      escapeHtml(p.email),
    ),
    emailRow("Stato Brevo", escapeHtml(status)),
  ].join("\n");
  return renderEmailShell({
    eyebrow: "ASD Orbassano Calcio",
    title: "Nuova iscrizione newsletter",
    subtitle: "Form /newsletter",
    contentHtml: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
${rows}
</table>`,
  });
}
