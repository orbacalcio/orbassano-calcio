import { NextResponse, type NextRequest } from "next/server";

/**
 * Endpoint per ricevere CSP violation report.
 *
 * Configurato in next.config.mjs come `report-uri /api/csp-report` +
 * `report-to csp-endpoint` nella Content-Security-Policy-Report-Only
 * (e poi Content-Security-Policy quando passeremo a enforcement).
 *
 * I browser inviano report quando una risorsa viene bloccata dalla
 * CSP (script da host non whitelisted, font esterno, ecc.). Senza un
 * endpoint che li riceve, il passaggio Report-Only → enforcement
 * sarebbe cieco: non sapremmo cosa rompe in produzione prima di
 * bloccarlo davvero.
 *
 * Strategia logging: console.warn -> visibile nei Logs Vercel
 * (Functions tab). Niente persistenza su DB / Sanity: lo scopo e'
 * solo osservare la fase Report-Only e validare l'enforcement.
 * Dopo qualche giorno post-enforcement possiamo dismettere l'endpoint
 * (o mantenerlo come safety net).
 *
 * Due formati standardizzati di report:
 * - Legacy `report-uri`: body JSON con `csp-report` wrapper
 * - Moderno `Reporting-Endpoints` (report-to): body JSON array di
 *   oggetti `{ type: "csp-violation", body: {...} }`
 * Accettiamo entrambi.
 *
 * NB: nessuna autenticazione. Il body e' anonimizzato lato browser
 * (no IP/user agent dell'utente, solo metadata del violation).
 * Rate limit non necessario: violation report sono per natura
 * sparse (1 per pagina caricata in caso di problema).
 */
export const dynamic = "force-dynamic";

type LegacyCspReport = {
  "csp-report"?: {
    "document-uri"?: string;
    "violated-directive"?: string;
    "blocked-uri"?: string;
    "source-file"?: string;
    "line-number"?: number;
  };
};

type ModernCspReport = {
  type?: string;
  body?: {
    documentURL?: string;
    blockedURL?: string;
    effectiveDirective?: string;
    sourceFile?: string;
    lineNumber?: number;
  };
};

export async function POST(req: NextRequest) {
  try {
    // I browser inviano content-type `application/csp-report` (legacy)
    // o `application/reports+json` (moderno). req.json() funziona con
    // entrambi.
    const body = (await req.json()) as
      | LegacyCspReport
      | ModernCspReport[]
      | ModernCspReport;

    const reports = Array.isArray(body)
      ? body
      : "csp-report" in (body as LegacyCspReport)
        ? [
            {
              type: "csp-violation",
              body: {
                documentURL: (body as LegacyCspReport)["csp-report"]?.[
                  "document-uri"
                ],
                blockedURL: (body as LegacyCspReport)["csp-report"]?.[
                  "blocked-uri"
                ],
                effectiveDirective: (body as LegacyCspReport)["csp-report"]?.[
                  "violated-directive"
                ],
                sourceFile: (body as LegacyCspReport)["csp-report"]?.[
                  "source-file"
                ],
                lineNumber: (body as LegacyCspReport)["csp-report"]?.[
                  "line-number"
                ],
              },
            },
          ]
        : [body as ModernCspReport];

    for (const r of reports) {
      const v = r.body ?? {};
      console.warn("[csp-violation]", {
        directive: v.effectiveDirective,
        blockedURL: v.blockedURL,
        documentURL: v.documentURL,
        sourceFile: v.sourceFile,
        lineNumber: v.lineNumber,
      });
    }

    // 204 No Content: pratica raccomandata per endpoint report-only.
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[csp-report parse error]", err);
    return new NextResponse(null, { status: 204 });
  }
}
