import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist_Mono, Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganizationLd, buildWebsiteLd } from "@/lib/json-ld";
import "./globals.css";

/**
 * Sistema tipografico a 3 famiglie (vedi docs/TYPOGRAPHY.md):
 * - Display: Big Shoulders Display (industrial signage americano)
 * - Body:    Inter (latin-ext per accenti italiani perfetti)
 * - Mono:    Geist Mono (dati tecnici: CF, IBAN, score, P.IVA)
 *
 * Le tre variable CSS (--font-display / --font-body / --font-mono) sono
 * poi aliasate in app/globals.css dentro @theme con i fallback.
 */
const display = Big_Shoulders({
  variable: "--font-display",
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const mono = Geist_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orbassanocalcio.com"),
  title: {
    default: "ASD Orbassano Calcio — Dal 1930 il calcio di Orbassano",
    template: "%s · ASD Orbassano Calcio",
  },
  description:
    "Sito ufficiale dell'A.S.D. Orbassano Calcio. Prima Categoria Piemonte VdA e Settore Giovanile. Dal 1930 il rossoblù di Orbassano.",
  applicationName: "ASD Orbassano Calcio",
  authors: [{ name: "ASD Orbassano Calcio" }],
  category: "sports",
  keywords: [
    "Orbassano Calcio",
    "ASD Orbassano",
    "Prima Categoria Piemonte",
    "Promozione Piemonte",
    "Serie D Piemonte",
    "Settore Giovanile Orbassano",
    "Centro Sportivo Aldo Porta",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://www.orbassanocalcio.com",
    siteName: "ASD Orbassano Calcio",
    title: "ASD Orbassano Calcio — Dal 1930 il calcio di Orbassano",
    description:
      "Sito ufficiale del club rossoblù: Prima Squadra, Settore Giovanile e Scuola Calcio. News, calendario, sponsor.",
    // images: gestite da src/app/opengraph-image.tsx (ImageResponse 1200x630)
  },
  twitter: {
    card: "summary_large_image",
    site: "@orbassanocalcio",
    creator: "@orbassanocalcio",
    title: "ASD Orbassano Calcio",
    description:
      "Sito ufficiale del club rossoblù di Orbassano. Dal 1930 il calcio di Orbassano.",
    // images: stesse di OG (twitter-image.tsx eredita da opengraph-image.tsx)
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1428",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Niente maximumScale ne' userScalable=no: bloccare lo zoom utente
  // viola WCAG 1.4.4 (Resize text). L'utente DEVE poter zoomare.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="bg-surface-0 text-ink-hi font-body flex min-h-full flex-col">
        {children}
        <JsonLd data={buildOrganizationLd()} />
        <JsonLd data={buildWebsiteLd()} />
      </body>
    </html>
  );
}
