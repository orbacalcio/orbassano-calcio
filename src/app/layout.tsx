import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  // NB: niente `alternates.canonical` qui. Un canonical "/" nel root
  // layout verrebbe EREDITATO da tutte le pagine figlie che non lo
  // sovrascrivono → ogni pagina dichiarerebbe canonical = homepage
  // (duplicate content per Google). Ogni page.tsx setta il proprio
  // canonical esplicito (relativo, risolto via metadataBase).
  // NB: niente `openGraph.url` qui. Stesso ragionamento del canonical
  // sopra: un `url` ereditato dal root layout farebbe sì che ogni share
  // (WhatsApp, Facebook, Threads, LinkedIn, Telegram) di una pagina
  // figlia trasmetta come og:url la homepage invece dell'URL effettivo
  // della pagina, mandando il click sempre alla home. Senza default,
  // Next.js usa automaticamente il canonical della pagina.
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "ASD Orbassano Calcio",
    title: "ASD Orbassano Calcio — Dal 1930 il calcio di Orbassano",
    description:
      "Sito ufficiale del club rossoblù: Prima Squadra, Settore Giovanile e Scuola Calcio. News, calendario, sponsor.",
    // images: gestite da src/app/opengraph-image.tsx (ImageResponse 1200x630)
  },
  // Twitter Card metadata: il club non presidia piu' X (2026-05-17), ma
  // teniamo `card`/`title`/`description` perche' generano i meta tag
  // `twitter:*` letti anche da Discord/Slack/Telegram per renderizzare
  // le anteprime quando qualcuno incolla un link. Rimossi `site` /
  // `creator` che linkavano l'@handle X non piu' attivo.
  twitter: {
    card: "summary_large_image",
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
  // viewport-fit=cover: la pagina si estende sotto le safe-area dei
  // device con notch/home-indicator (iPhone), così gli env(safe-area-
  // inset-*) usati dal CookieBanner diventano effettivi e il banner
  // resta sopra l'home-indicator invece di sfiorarlo.
  viewportFit: "cover",
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
        {/* Vercel Web Analytics + Speed Insights: first-party, no
            cookie, GDPR-compliant. No consent banner richiesto.
            Activazione dashboard Vercel (tab Analytics + Speed Insights). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
