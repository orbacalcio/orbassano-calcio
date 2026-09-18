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
 * 4. Filter: _type in ['sponsor', 'news', 'match', 'player', 'team', 'heroSlide', 'settings', 'clubOfficial', 'technicalStaff', 'facility', 'timelineEvent', 'club', 'competition', 'opponent', 'riferimentiOperativi', 'trasparenza5x1000', 'gallery', 'openDay', 'tournament', 'academyHome', 'academyIscriviti', 'academyProgramma', 'academyInformazioni']
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

/**
 * Propagazione tag: un documento modificato non invalida solo il tag
 * omonimo, ma tutti i tag delle query che lo leggono via reference.
 *
 * Serve perche' le query sono taggate sul documento "principale" che
 * interrogano, non su quelli che joinano. Le MatchCard ad esempio
 * partono da `match` ma risolvono opponent → club (nome e logo
 * dell'avversario) e competition (nome del campionato): la query e'
 * taggata "match", quindi senza propagazione modificare un `club`
 * invalidava il tag "club", che nessuna query usa. Risultato: pagine
 * dinamiche aggiornate e pagine in cache (homepage) ferme al vecchio
 * contenuto — vedi il caso Nichelino del 2026-09-18.
 *
 * `opponent` e `club` NON compaiono come tag in nessuna query: senza
 * questa mappa le loro modifiche non rigenerano mai nulla.
 *
 * Ogni tipo non elencato invalida il proprio tag e basta.
 */
const TAG_FANOUT: Record<string, readonly string[]> = {
  opponent: ["opponent", "match"],
  club: ["club", "match"],
  competition: ["competition", "match"],
  team: ["team", "match", "player"],
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

  const type = body._type;
  const tags = TAG_FANOUT[type] ?? [type];
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  return NextResponse.json({ ok: true, revalidated: tags, now: Date.now() });
}
