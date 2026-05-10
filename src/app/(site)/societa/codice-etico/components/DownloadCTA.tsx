import { FileDown, ShieldAlert } from "lucide-react";
import Link from "next/link";

/**
 * Bottoni CTA in cima alla pagina Codice Etico:
 *  - Scarica PDF (visibile solo se pdfUrl valorizzato dal singleton
 *    riferimentiOperativi.codiceEticoPdfUrl)
 *  - Vai a Segnalazioni (sempre presente, link interno)
 */
export function DownloadCTA({ pdfUrl }: { pdfUrl: string | null }) {
  return (
    <div className="flex flex-wrap gap-3">
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-gold text-surface-0 hover:bg-brand-gold/90 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
        >
          <FileDown size={16} aria-hidden />
          Scarica PDF
        </a>
      ) : (
        <span className="border-border/40 bg-surface-2 text-ink-low inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold">
          <FileDown size={16} aria-hidden />
          PDF in preparazione
        </span>
      )}
      <Link
        href="/societa/segnalazioni"
        className="border-border bg-surface-2 text-ink-mid hover:border-brand-gold hover:text-ink-hi inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors"
      >
        <ShieldAlert size={16} aria-hidden />
        Segnalazioni
      </Link>
    </div>
  );
}
