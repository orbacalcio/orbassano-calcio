/**
 * Layout dedicato per /studio. Lo Studio Sanity ha il suo CSS interno
 * e occupa tutto il viewport: qui stoppiamo la classe `font-body` e i
 * colori del sito pubblico, e segnaliamo `noindex` per i motori.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="text-black antialiased">{children}</div>;
}
