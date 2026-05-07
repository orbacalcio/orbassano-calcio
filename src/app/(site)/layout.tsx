import { AppShell } from "@/components/layout/AppShell";

/**
 * Layout del sito pubblico. Tutte le pagine sotto (site) ricevono
 * topbar + sidebar + drawer mobile via AppShell.
 *
 * /studio e /dev hanno i loro layout indipendenti (NON wrappati da AppShell).
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
