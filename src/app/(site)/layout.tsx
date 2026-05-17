import { CookieBanner } from "@/components/cookie/CookieBanner";
import { AppShell } from "@/components/layout/AppShell";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import { SearchPromptCTA } from "@/components/sections/SearchPromptCTA";
import { SiteFooterCTAs } from "@/components/sections/SiteFooterCTAs";

/**
 * Layout del sito pubblico. Tutte le pagine sotto (site) ricevono
 * topbar + sidebar + drawer mobile via AppShell, piu' due sezioni CTA
 * sopra il footer: barra di ricerca grande (SearchPromptCTA, pattern
 * juventus.com) e iscrizione newsletter. Il CookieBanner vive fuori
 * dall'AppShell (fixed z-60) cosi' resta visibile anche durante
 * apertura drawer.
 *
 * Le 2 CTA vengono mostrate ovunque TRANNE sulle pagine rosa di
 * squadra (/squadre/<slug>): la gate client `SiteFooterCTAs` decide
 * in base alla pathname corrente. Le CTA stesse restano server-side
 * (passate come children), niente runtime cost su rotte che le
 * nascondono.
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
        <SiteFooterCTAs>
          <NewsletterCTA />
          <SearchPromptCTA />
        </SiteFooterCTAs>
      </AppShell>
      <CookieBanner />
    </>
  );
}
