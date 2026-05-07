import type { Metadata } from "next";

/**
 * Layout per le pagine dev/specimen. NON wrappato da AppShell:
 * sono pagine di riferimento interno, niente sidebar/topbar pubbliche.
 *
 * Bloccate da robots.txt (M7) e marcate noindex qui.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
