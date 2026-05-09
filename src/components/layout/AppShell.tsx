import {
  fetchActiveTeamSlugs,
  fetchHasActivePartners,
  fetchMainSponsors,
} from "@/sanity/fetchers";
import { ClientShell } from "./ClientShell";
import { Footer } from "./Footer";
import { MobileSponsorStrip } from "./MobileSponsorStrip";
import { SkipLink } from "./SkipLink";

/**
 * Shell del sito pubblico.
 *
 * Server async: fetcha una sola volta i main sponsor (cache tag
 * 'sponsor' per webhook revalidate) e li passa al ClientShell come
 * data plain serializzabile. ClientShell importa Topbar / TopbarScrolled
 * / SidebarLeft / SidebarRight / MobileTopbar / NavigationDrawer
 * direttamente — le funzioni-prop tra server e client component non
 * sono ammesse in App Router.
 *
 * Pattern desktop (≥lg) — scroll switch via ClientShell:
 * - Hero visibile: Topbar 44px + SidebarLeft 88px + SidebarRight 80px
 * - Scrollato oltre hero: TopbarScrolled 64px (orizzontale full)
 * - Transizione fade 250ms con Framer Motion
 *
 * Mobile (<lg):
 * - MobileTopbar sempre presente (no switch)
 * - MobileSponsorStrip sticky sotto la topbar
 * - NavigationDrawer condiviso (apre da hamburger mobile o TopbarScrolled)
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const [sponsors, hasPartners, activeTeamSlugs] = await Promise.all([
    fetchMainSponsors(),
    fetchHasActivePartners(),
    fetchActiveTeamSlugs(),
  ]);

  return (
    <>
      <SkipLink />
      <ClientShell
        sponsors={sponsors}
        hasPartners={hasPartners}
        activeTeamSlugs={activeTeamSlugs}
      />
      <MobileSponsorStrip />
      <main
        id="main-content"
        tabIndex={-1}
        className="pt-[84px] lg:pt-16 lg:pr-[80px] lg:pl-[88px]"
      >
        {children}
      </main>
      <div className="lg:pr-[80px] lg:pl-[88px]">
        <Footer />
      </div>
    </>
  );
}
