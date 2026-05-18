import { ShieldAlert } from "lucide-react";
import Link from "next/link";

/**
 * CTA in cima alla pagina Codice Etico.
 *
 * NB (2026-05-17): rimossa l'esportazione PDF su richiesta utente.
 * Il bottone "Scarica PDF" / placeholder "PDF in preparazione" non
 * vengono piu' renderizzati. Per riabilitare in futuro: passare un
 * pdfUrl come prop e riaggiungere il blocco <a href>.
 */
export function DownloadCTA() {
  return (
    <div className="flex flex-wrap gap-3">
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
