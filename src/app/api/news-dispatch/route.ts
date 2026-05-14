import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@sanity/client";
import { parseBody } from "next-sanity/webhook";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { revalidateSecret, writeToken } from "@/sanity/env.server";

/**
 * Webhook Sanity → invio email newsletter (Brevo Email Campaign).
 *
 * Setup nello Studio Sanity (manage.sanity.io → API → Webhooks):
 * - URL: https://www.orbassanocalcio.com/api/news-dispatch
 * - Trigger: Create / Update
 * - Filter GROQ: `_type == "news" && sendToNewsletter == true && !defined(dispatchedAt)`
 * - Projection: `{_id, _type, sendToNewsletter, dispatchedAt}`
 * - Secret header: stesso `SANITY_REVALIDATE_SECRET`
 *
 * Logica:
 * 1. Verifica firma webhook (parseBody di next-sanity)
 * 2. Re-fetch della news per leggere title/cover/excerpt/body completi
 *    (la projection del webhook e' minimale per banda)
 * 3. Skip se: flag disattivato, dispatchedAt gia' valorizzato, body
 *    vuoto, slug mancante
 * 4. Crea Email Campaign Brevo + sendNow
 * 5. Patcha il documento con `dispatchedAt = now()` (idempotenza)
 *
 * Senza BREVO_API_KEY o SANITY_API_WRITE_TOKEN: log e ritorna 200
 * (graceful degradation in dev/preview, non rompe il webhook).
 */
type WebhookBody = {
  _id?: string;
  _type?: string;
  sendToNewsletter?: boolean | null;
  dispatchedAt?: string | null;
};

type FullNews = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string | null;
  cover?: string | null;
  publishedAt?: string | null;
  sendToNewsletter?: boolean | null;
  dispatchedAt?: string | null;
};

const SITE_URL = "https://www.orbassanocalcio.com";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_NEWSLETTER_LIST_ID;
const BREVO_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL ?? "noreply@orbassanocalcio.com";
const BREVO_SENDER_NAME =
  process.env.BREVO_SENDER_NAME ?? "Orbassano Calcio";

export async function POST(req: NextRequest) {
  if (!revalidateSecret) {
    return NextResponse.json(
      { ok: false, error: "SANITY_REVALIDATE_SECRET non configurato" },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<WebhookBody>(
    req,
    revalidateSecret,
  );
  if (!isValidSignature) {
    return NextResponse.json(
      { ok: false, error: "Firma webhook non valida" },
      { status: 401 },
    );
  }
  if (body?._type !== "news" || !body?._id) {
    return NextResponse.json({ ok: true, skipped: "non-news" });
  }

  const news = await fetchNewsForDispatch(body._id);
  if (!news) {
    return NextResponse.json({ ok: true, skipped: "news-not-found" });
  }
  if (news.sendToNewsletter !== true) {
    return NextResponse.json({ ok: true, skipped: "flag-off" });
  }
  if (news.dispatchedAt) {
    return NextResponse.json({ ok: true, skipped: "already-dispatched" });
  }
  if (!news.slug?.current || !news.title) {
    return NextResponse.json({ ok: true, skipped: "incomplete" });
  }

  // Brevo non configurato → log + skip senza errori
  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    console.warn(
      "[news-dispatch] BREVO_API_KEY o BREVO_NEWSLETTER_LIST_ID assenti — invio NON eseguito.",
      { newsId: news._id, title: news.title },
    );
    return NextResponse.json({ ok: true, skipped: "brevo-not-configured" });
  }

  const html = renderNewsletterEmail(news);

  // 1. Crea campagna
  let campaignId: number;
  try {
    const create = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        name: `News · ${news.slug.current}`,
        subject: news.title,
        type: "classic",
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        htmlContent: html,
        recipients: { listIds: [Number(BREVO_LIST_ID)] },
      }),
    });
    if (!create.ok) {
      const text = await create.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `Brevo create campaign HTTP ${create.status}: ${text}`,
        },
        { status: 502 },
      );
    }
    const data = (await create.json()) as { id: number };
    campaignId = data.id;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Brevo create failed",
      },
      { status: 502 },
    );
  }

  // 2. Invia subito
  try {
    const send = await fetch(
      `https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`,
      {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, accept: "application/json" },
      },
    );
    if (!send.ok) {
      const text = await send.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `Brevo sendNow HTTP ${send.status}: ${text}`,
          campaignId,
        },
        { status: 502 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Brevo sendNow failed",
        campaignId,
      },
      { status: 502 },
    );
  }

  // 3. Patcha la news con dispatchedAt per idempotenza
  await markDispatched(news._id);

  return NextResponse.json({
    ok: true,
    dispatched: true,
    campaignId,
    newsId: news._id,
  });
}

async function fetchNewsForDispatch(id: string): Promise<FullNews | null> {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    ...(writeToken ? { token: writeToken } : {}),
  });
  try {
    return await client.fetch<FullNews | null>(
      `*[_type == "news" && _id == $id][0]{
        _id, title, slug, excerpt, publishedAt,
        sendToNewsletter, dispatchedAt,
        "cover": cover.asset->url
      }`,
      { id },
    );
  } catch (err) {
    console.error("[news-dispatch] fetch news fallita", err);
    return null;
  }
}

async function markDispatched(id: string): Promise<void> {
  if (!writeToken) {
    console.warn(
      "[news-dispatch] SANITY_API_WRITE_TOKEN assente — dispatchedAt NON patchato. Idempotenza non garantita.",
    );
    return;
  }
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  });
  try {
    await client.patch(id).set({ dispatchedAt: new Date().toISOString() }).commit();
  } catch (err) {
    console.error("[news-dispatch] patch dispatchedAt fallito", err);
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderNewsletterEmail(news: FullNews): string {
  const url = `${SITE_URL}/news/${news.slug.current}`;
  const cover = news.cover
    ? `<img src="${escapeHtml(news.cover)}" alt="${escapeHtml(news.title)}" style="width:100%;height:auto;display:block;border-radius:12px;margin:0 0 24px;" />`
    : "";
  const excerpt = news.excerpt
    ? `<p style="color:#A8B5CC;font-size:16px;line-height:1.6;margin:0 0 24px;">${escapeHtml(news.excerpt)}</p>`
    : "";

  return `<!doctype html>
<html lang="it"><body style="margin:0;padding:0;background:#0A1428;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#F5F7FA;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#dfb16c;font-weight:bold;">A.S.D. Orbassano Calcio</span>
    </div>
    ${cover}
    <h1 style="font-size:28px;line-height:1.15;font-weight:900;letter-spacing:0.005em;text-transform:uppercase;color:#F5F7FA;margin:0 0 16px;">${escapeHtml(news.title)}</h1>
    ${excerpt}
    <a href="${escapeHtml(url)}" style="display:inline-block;background:#e91f22;color:#fefdfd;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;">Leggi l'articolo</a>
    <hr style="border:none;border-top:1px solid #1F2F4D;margin:40px 0 24px;" />
    <p style="color:#6B7A99;font-size:11px;line-height:1.6;margin:0;">
      Ricevi questa email perché sei iscritto alla newsletter di ASD Orbassano Calcio.<br />
      Per cancellarti, usa il link in calce all'email Brevo o scrivi a <a href="mailto:info@orbassanocalcio.com" style="color:#dfb16c;">info@orbassanocalcio.com</a>.
    </p>
  </div>
</body></html>`;
}
