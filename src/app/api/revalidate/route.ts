import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { revalidateSecret } from "@/sanity/env.server";

/**
 * Webhook Sanity → revalidate on-demand.
 *
 * Sanity Studio chiama questa route quando un documento viene
 * pubblicato/aggiornato. Il payload contiene il tipo di documento
 * (`_type`) e noi rivalidiamo il tag corrispondente.
 *
 * Setup su manage.sanity.io:
 * 1. Project Settings → API → Webhooks → Add webhook
 * 2. URL: https://www.orbassanocalcio.com/api/revalidate
 * 3. Trigger: Create / Update / Delete
 * 4. Filter: _type in ['sponsor', 'news', 'match', 'player', 'team', 'heroSlide', 'settings', 'clubOfficial', 'technicalStaff', 'facility', 'timelineEvent', 'club', 'competition', 'opponent', 'riferimentiOperativi', 'trasparenza5x1000', 'gallery', 'openDay', 'tournament']
 *    NB: 'segnalazione' NON deve essere nella whitelist webhook
 *        (privacy + non viene letto dal sito pubblico).
 * 5. Secret: copiare in env var SANITY_REVALIDATE_SECRET
 *
 * In Next 16 `revalidateTag` richiede un secondo argomento `cacheLife`:
 * usiamo 'max' (stale-while-revalidate, l'utente vede contenuti
 * leggermente stale per pochi secondi mentre si rigenerano).
 */
type SanityWebhookBody = {
  _type?: string;
  _id?: string;
};

export async function POST(req: NextRequest) {
  if (!revalidateSecret) {
    return NextResponse.json(
      { ok: false, error: "SANITY_REVALIDATE_SECRET non configurato" },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<SanityWebhookBody>(
    req,
    revalidateSecret,
  );

  if (!isValidSignature) {
    return NextResponse.json(
      { ok: false, error: "Firma non valida" },
      { status: 401 },
    );
  }

  if (!body?._type) {
    return NextResponse.json(
      { ok: false, error: "Payload senza _type" },
      { status: 400 },
    );
  }

  const tag = body._type;
  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, revalidated: tag, now: Date.now() });
}
