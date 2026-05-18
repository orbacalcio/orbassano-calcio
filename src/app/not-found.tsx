import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-surface-0 relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="bg-brand-blue/30 absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full blur-[140px]" />
        <div className="bg-brand-red/20 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
      </div>
      <Image
        src="/Logo_Orbassano_2K.png"
        alt=""
        width={120}
        height={169}
        priority
        className="mb-6 opacity-90"
      />
      {/* SVG decorativo: pallone in fallo laterale, traiettoria che esce dal campo */}
      <svg
        aria-hidden
        viewBox="0 0 240 80"
        className="text-brand-gold/60 mb-8 h-16 w-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <line x1="0" y1="64" x2="240" y2="64" strokeDasharray="4 6" />
        <path
          d="M 20 60 Q 90 -10 180 28"
          strokeDasharray="3 5"
          className="text-brand-gold/80"
          stroke="currentColor"
        />
        <circle cx="180" cy="28" r="9" fill="currentColor" className="text-ink-hi" />
        <circle cx="180" cy="28" r="9" stroke="currentColor" className="text-surface-0" strokeWidth="1.2" />
        <path
          d="M 173 23 L 187 33 M 173 33 L 187 23"
          stroke="currentColor"
          strokeWidth="1"
          className="text-surface-0"
        />
        <text
          x="190"
          y="54"
          fill="currentColor"
          className="font-mono text-brand-gold/70 text-[8px]"
          fontSize="8"
        >
          OUT
        </text>
      </svg>
      <span className="text-brand-gold font-display text-xs font-semibold tracking-[0.3em] uppercase">
        Errore 404
      </span>
      <h1 className="font-display text-ink-hi mt-3 text-center text-7xl leading-[0.92] font-black tracking-[0.005em] uppercase sm:text-9xl">
        Pallone
        <br />
        in fallo laterale
      </h1>
      <p className="text-ink-mid mt-6 max-w-xl text-center text-base leading-relaxed sm:text-lg">
        La pagina che cercavi non esiste o è stata spostata. Torna alla home,
        vediamo se ti riportiamo dentro al campo.
      </p>
      <Link
        href="/"
        className="bg-brand-red btn-wow-sweep text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold mt-10 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Torna alla home
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
