import { CookieBanner } from "@/components/cookie/CookieBanner";
import { AppShell } from "@/components/layout/AppShell";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";

/**
 * Layout del sito pubblico. Tutte le pagine sotto (site) ricevono
 * topbar + sidebar + drawer mobile via AppShell, piu' una sezione CTA
 * Newsletter sopra il footer. Il CookieBanner vive fuori dall'AppShell
 * (fixed z-60) cosi' resta visibile anche durante apertura drawer.
 *
 * SearchPromptCTA rimosso: la search del sito non e' implementata
 * (richiede indice + dialog + risultati). Tornera' come feature M9
 * post-launch quando avremo un volume di contenuti che la giustifica.
 *
 * /studio e /dev hanno i loro layout indipendenti (NON wrappati da AppShell).
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>
        {children}
        <NewsletterCTA />
      </AppShell>
      <CookieBanner />
    </>
  );
}
