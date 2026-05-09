import { CookieBanner } from "@/components/cookie/CookieBanner";
import { AppShell } from "@/components/layout/AppShell";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import { SearchPromptCTA } from "@/components/sections/SearchPromptCTA";

/**
 * Layout del sito pubblico. Tutte le pagine sotto (site) ricevono
 * topbar + sidebar + drawer mobile via AppShell, piu' due sezioni CTA
 * fisse sopra il footer (newsletter + search prompt) come da pattern
 * juventus.com. Il CookieBanner vive fuori dall'AppShell (fixed
 * z-60) cosi' resta visibile anche durante apertura drawer.
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
        <SearchPromptCTA />
      </AppShell>
      <CookieBanner />
    </>
  );
}
