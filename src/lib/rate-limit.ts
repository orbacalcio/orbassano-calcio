import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Rate limit IP-based in-memory per le API route pubbliche.
 *
 * Limitazioni:
 *  - Map module-level: persiste tra richieste sulla stessa istanza
 *    serverless ma si azzera al cold start. Su Vercel le istanze sono
 *    sharded → un attaccante distribuito su piu' istanze vede limiti
 *    moltiplicati. Per il volume di un club dilettantistico e' OK come
 *    MVP. Per upgrade futuro: Upstash Redis con BUCKETS condivisi.
 *  - Niente coordinamento cross-region.
 *
 * Privacy:
 *  - L'IP non viene mai memorizzato in chiaro. Hashiamo /24 (IPv4) o
 *    /64 (IPv6) con SHA-256 + truncate. Lo stesso hash usato per
 *    correlation in audit log (whistleblowing, consent).
 *
 * Uso:
 *   const rl = checkRateLimit({ req, bucket: "contact", limit: 5, windowMs: 3600_000 });
 *   if (!rl.ok) return rateLimitedResponse(rl.retryAfter);
 */

type Entry = { count: number; resetAt: number };
const stores = new Map<string, Map<string, Entry>>();

function bucketStore(bucket: string): Map<string, Entry> {
  let s = stores.get(bucket);
  if (!s) {
    s = new Map();
    stores.set(bucket, s);
  }
  return s;
}

export function getClientIpHash(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const raw = fwd?.split(",")[0]?.trim() ?? real?.trim() ?? "unknown";
  let normalized = raw;
  const v4 = raw.match(/^(\d+)\.(\d+)\.(\d+)\.\d+$/);
  if (v4) {
    normalized = `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  } else if (raw.includes(":")) {
    normalized = raw.split(":").slice(0, 4).join(":") + "::/64";
  }
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

type Args = {
  req: NextRequest;
  /** Nome bucket: contact / newsletter / sponsor-lead / consent / search. */
  bucket: string;
  /** Numero massimo di richieste per window. */
  limit: number;
  /** Durata della finestra in ms. */
  windowMs: number;
};

type Result =
  | { ok: true; ipHash: string }
  | { ok: false; ipHash: string; retryAfter: number };

export function checkRateLimit({ req, bucket, limit, windowMs }: Args): Result {
  const ipHash = getClientIpHash(req);
  const store = bucketStore(bucket);
  const now = Date.now();
  const entry = store.get(ipHash);
  if (!entry || now >= entry.resetAt) {
    store.set(ipHash, { count: 1, resetAt: now + windowMs });
    return { ok: true, ipHash };
  }
  if (entry.count >= limit) {
    return {
      ok: false,
      ipHash,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { ok: true, ipHash };
}
