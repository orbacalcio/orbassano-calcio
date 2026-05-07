import { MobileShell } from "./MobileDrawer";
import { MobileSponsorStrip } from "./MobileSponsorStrip";
import { SidebarLeft } from "./SidebarLeft";
import { SidebarRight } from "./SidebarRight";
import { SkipLink } from "./SkipLink";
import { Topbar } from "./Topbar";

/**
 * Shell del sito pubblico.
 *
 * Layout responsive:
 * - Desktop (≥ lg): topbar 44px + sidebar sx 72px + sidebar dx 56px,
 *   il content prende il resto (margine pl-[72px] pr-[56px] pt-11)
 * - Mobile (<lg): topbar 44px + sponsor strip 40px sticky + drawer
 *   apribile via hamburger, content full width sotto (pt-[84px])
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Topbar />
      <MobileShell />
      <MobileSponsorStrip />
      <SidebarLeft />
      <SidebarRight />
      <main
        id="main-content"
        tabIndex={-1}
        className="pt-[84px] lg:pt-11 lg:pr-[56px] lg:pl-[72px]"
      >
        {children}
      </main>
    </>
  );
}
