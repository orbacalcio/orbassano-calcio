/**
 * Layout dedicato per /studio. Lo Studio Sanity ha il suo CSS interno
 * e occupa tutto il viewport: qui resettiamo bg/font del sito pubblico,
 * segnaliamo `noindex` per i motori e riusiamo metadata/viewport del
 * pacchetto next-sanity (theme color, mobile zoom, ecc.).
 *
 * La metadata vive QUI e non in page.tsx perche' page.tsx e' un client
 * component (use client + dynamic import) e i client component non
 * possono esportare metadata.
 */
import type { Metadata } from "next";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";

export const metadata: Metadata = {
  ...studioMetadata,
  robots: { index: false, follow: false, nocache: true },
};

export const viewport = studioViewport;

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="text-black antialiased">{children}</div>;
}
