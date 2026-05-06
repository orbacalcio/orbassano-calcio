import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orbassanocalcio.com"),
  title: {
    default: "ASD Orbassano Calcio — Dal 1930 il calcio di Orbassano",
    template: "%s · ASD Orbassano Calcio",
  },
  description:
    "Sito ufficiale dell'A.S.D. Orbassano Calcio. Promozione Piemonte VdA, Settore Giovanile e Scuola Calcio. Dal 1930 il rossoblù di Orbassano.",
  applicationName: "ASD Orbassano Calcio",
  authors: [{ name: "ASD Orbassano Calcio" }],
  category: "sports",
  keywords: [
    "Orbassano Calcio",
    "ASD Orbassano",
    "Promozione Piemonte",
    "Serie D Piemonte",
    "Settore Giovanile Orbassano",
    "Scuola Calcio Orbassano",
    "Centro Sportivo Aldo Porta",
    "Stadio Mazzola Orbassano",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0A1428",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="bg-surface-0 text-ink-hi flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
