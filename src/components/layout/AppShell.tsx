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
 * data plain serializzabile. ClientShell importa Topbar / SidebarLeft
 * / SidebarRight / MobileTopbar / NavigationDrawer direttamente — le
 * funzioni-prop tra server e client component non sono ammesse in App
 * Router.
 *
 * Pattern desktop (≥lg) — la Topbar e' UNA sola e cambia forma:
 * - Hero visibile: Topbar 78px tra SidebarLeft 88px e SidebarRight 80px
 * - Scrollato oltre hero: Topbar si allarga full-width, sidebar svaniscono
 * - Transizione 450ms con Framer Motion (cubic-bezier 0.4,0,0.2,1)
 *
 * Mobile (<lg):
 * - MobileTopbar sempre presente (no switch)
 * - MobileSponsorStrip sticky sotto la topbar
 * - NavigationDrawer condiviso (apre da hamburger mobile o Topbar scrolled)
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
        className="pt-[100px] lg:pt-[78px] lg:pr-[80px] lg:pl-[88px]"
      >
        {children}
      </main>
      <div className="lg:pr-[80px] lg:pl-[88px]">
        <Footer />
      </div>
    </>
  );
}
