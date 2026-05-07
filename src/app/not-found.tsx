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
        height={120}
        priority
        className="mb-8 opacity-90"
      />
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
        className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold mt-10 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Torna alla home
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
