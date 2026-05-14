import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@sanity/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { writeToken } from "@/sanity/env.server";

/**
 * Audit log dei consensi cookie. Riceve POST dal CookieBanner client
 * e crea un document `consentLog` su Sanity. Lo schema e' read-only
 * in Studio per evitare manomissioni.
 *
 * Senza SANITY_API_WRITE_TOKEN il log e' best-effort: l'endpoint
 * risponde 200 ma non scrive (eviterebbe di rompere la UX in dev).
 *
 * Privacy: l'IP non viene mai salvato in chiaro. Hashiamo solo il /24
 * (primi 3 ottetti per IPv4, primi 64 bit per IPv6) per
 * pseudo-anonimizzare a livello di rete senza poter risalire al
 * singolo dispositivo.
 */
type Payload = {
  consentId?: unknown;
  timestamp?: unknown;
  action?: unknown;
  categories?: unknown;
  policyVersion?: unknown;
};

const VALID_ACTIONS = new Set([
  "accept-all",
  "reject-all",
  "save-preferences",
  "withdrawn",
]);

const VALID_CATEGORIES = new Set([
  "necessary",
  "analytics",
  "marketing",
  "embed-social",
]);

export async function POST(req: NextRequest) {
  // Rate limit aggressivo: il consent log non deve crescere a dismisura
  // da spam bot. 10 req/min/IP basta per cambi legittimi di preferenze.
  const rl = checkRateLimit({
    req,
    bucket: "consent",
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const consentId = String(body.consentId ?? "");
  const timestamp = String(body.timestamp ?? new Date().toISOString());
  const action = String(body.action ?? "");
  const policyVersion = String(body.policyVersion ?? "");
  const categories = Array.isArray(body.categories)
    ? body.categories
        .map(String)
        .filter((c) => VALID_CATEGORIES.has(c))
    : [];

  if (!consentId || !VALID_ACTIONS.has(action)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Senza write token, simuliamo success ma logghiamo per debug
  if (!writeToken) {
    console.warn(
      "[consent] SANITY_API_WRITE_TOKEN assente — log NON scritto. Action:",
      action,
      "Categories:",
      categories,
    );
    return NextResponse.json({ ok: true, persisted: false });
  }

  const userAgent = req.headers.get("user-agent") ?? "";
  const ipHash = await hashClientIp(req);

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  });

  try {
    await client.create({
      _type: "consentLog",
      consentId,
      timestamp,
      action,
      categories,
      userAgent,
      ipHash,
      policyVersion,
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[consent] Sanity write failed", err);
    return NextResponse.json({ ok: true, persisted: false });
  }
}

async function hashClientIp(req: NextRequest): Promise<string> {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim();
  if (!ip) return "";
  // Riduce IPv4 a /24 (primi 3 ottetti) o IPv6 a /64
  const reduced = ip.includes(".")
    ? ip.split(".").slice(0, 3).join(".") + ".0"
    : ip.split(":").slice(0, 4).join(":") + "::";
  return createHash("sha256").update(reduced).digest("hex").slice(0, 32);
}
