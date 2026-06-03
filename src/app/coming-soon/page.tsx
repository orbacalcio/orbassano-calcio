import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CountdownTimer } from "@/components/coming-soon/CountdownTimer";

/**
 * Pagina "coming soon" servita finche' la env `COMING_SOON_MODE=true`
 * e' attiva su Vercel. Il proxy (`/proxy.ts`) reindirizza tutte le
 * rotte pubbliche (eccetto /studio, /api/*, asset statici, sitemap,
 * robots) verso /coming-soon, mantenendo l'URL originale visibile in
 * barra (rewrite, non redirect).
 *
 * Una volta cambiata la env a `false` (o cancellata) e fatto un
 * redeploy, il proxy lascia passare tutto e il sito reale torna live
 * istantaneamente. Vedi docs/POST_GOLIVE_CHECKLIST.md.
 *
 * Robots: noindex/nofollow esplicito qui + sitemap vuoto +
 * robots.txt che blocca tutto durante la modalita' coming soon (vedi
 * src/app/robots.ts e src/app/sitemap.ts).
 */
const GO_LIVE_ISO = "2026-06-06T08:00:00+02:00";

export const metadata: Metadata = {
  title: "Stiamo per partire — ASD Orbassano Calcio",
  description:
    "Il nuovo sito ufficiale di ASD Orbassano Calcio sarà online il 6 giugno 2026 alle 08:00.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ComingSoonPage() {
  return (
    <main className="bg-surface-0 relative flex min-h-dvh flex-col overflow-hidden">
      {/* Blob radiali brand (stesso linguaggio degli header pagina) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="bg-brand-blue/25 absolute -top-40 -left-32 h-[44rem] w-[44rem] rounded-full blur-[160px]" />
        <div className="bg-brand-red/15 absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        <div className="bg-brand-gold/[0.08] absolute -bottom-32 left-1/4 h-[32rem] w-[32rem] rounded-full blur-[160px]" />
      </div>

      {/* Pitch motif: linee diagonali sottilissime in oro */}
      <svg
        aria-hidden
        className="text-brand-gold/[0.05] pointer-events-none absolute inset-0 -z-10 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <line
          x1="-200"
          y1="900"
          x2="1640"
          y2="-200"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="-200"
          y1="1100"
          x2="1640"
          y2="0"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="-200"
          y1="700"
          x2="1640"
          y2="-400"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Contenuto centrato */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
        <Image
          src="/Logo_Orbassano_2K.png"
          alt="ASD Orbassano Calcio"
          width={140}
          height={197}
          priority
          className="mb-7 h-auto w-28 opacity-95 sm:w-32 lg:w-36"
        />

        <span className="text-brand-gold font-display text-[11px] font-bold tracking-[0.32em] uppercase sm:text-sm">
          ASD Orbassano Calcio · Dal 1930
        </span>

        <h1 className="font-display text-ink-hi mt-5 text-4xl leading-[0.92] font-black tracking-[0.005em] uppercase sm:text-6xl lg:text-7xl">
          Una nuova era
          <br />
          <span className="text-brand-red">sta per partire.</span>
        </h1>

        <p className="text-ink-mid mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
          Il sito ufficiale del club rossoblù sarà online il{" "}
          <span className="text-ink-hi font-mono font-semibold">
            06.06.2026
          </span>{" "}
          alle{" "}
          <span className="text-ink-hi font-mono font-semibold">ore 08:00</span>
          .
        </p>

        <div className="mt-10 w-full max-w-2xl sm:mt-12">
          <CountdownTimer targetIso={GO_LIVE_ISO} />
        </div>

        <Link
          href="https://linktr.ee/orbassanocalcio"
          target="_blank"
          rel="noopener noreferrer"
          className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-surface-0 focus-visible:outline-brand-gold mt-12 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.18em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-[13px]"
        >
          Intanto seguici sui social
          <ExternalLink size={13} aria-hidden />
        </Link>
      </div>

      {/* Footer minimal */}
      <footer className="border-border/30 text-ink-low relative z-10 border-t py-5 text-center font-mono text-[10px] tracking-[0.18em] uppercase">
        ASD Orbassano Calcio · P.IVA 12100640015
      </footer>
    </main>
  );
}
