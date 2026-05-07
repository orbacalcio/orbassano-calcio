import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Banner 5×1000 — sezione scura con foto in background a bassa
 * opacita', titolo grosso, codice fiscale in mono, due CTA.
 *
 * Per ora "background" e' il logo stilizzato + gradient brand-red, in
 * attesa delle foto del club. Peso visivo molto preciso: il CF deve
 * stare sotto al titolo, in mono, evidenziato in oro.
 */
export function Banner5x1000() {
  return (
    <section
      aria-label="Sostieni Orbassano Calcio con il 5x1000"
      className="bg-surface-2 relative overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-brand-red/30 absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        <div className="bg-brand-blue/40 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        <div className="absolute inset-0 flex items-center justify-end opacity-[0.06]">
          <Image
            src="/Logo_Orbassano_2K.png"
            alt=""
            width={700}
            height={984}
            className="object-contain"
          />
        </div>
      </div>

      <Container className="relative grid items-center gap-12 py-24 lg:grid-cols-2 lg:py-32" size="wide">
        <div className="flex flex-col gap-6">
          <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            5×1000 · senza costi per te
          </span>
          <h2 className="font-display text-ink-hi text-5xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-6xl lg:text-7xl">
            Una firma
            <br />
            che cambia
            <br />
            <span className="text-brand-red">una stagione</span>
          </h2>
          <p className="text-ink-mid max-w-xl text-base leading-relaxed sm:text-lg">
            Donare il 5×1000 ad ASD Orbassano Calcio non costa nulla: è una
            quota della tua dichiarazione dei redditi che diversamente
            resterebbe allo Stato. Per noi diventa nuovi materiali per il
            settore giovanile, manutenzione dei campi, trasferte.
          </p>
        </div>

        <div className="border-brand-gold/30 bg-surface-1/70 flex flex-col gap-6 rounded-3xl border p-8 backdrop-blur-sm sm:p-10">
          <div className="flex flex-col gap-2">
            <span className="text-ink-mid font-display text-sm font-bold tracking-[0.2em] uppercase">
              Codice fiscale
            </span>
            <span className="text-brand-gold font-mono text-5xl font-medium tracking-[0.05em] sm:text-6xl">
              95634370019
            </span>
            <span className="text-ink-mid text-sm">
              A.S.D. Orbassano Calcio · Centro Sportivo Aldo Porta · Orbassano
              (TO)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/5x1000"
              className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Heart size={16} />
              Come donare
            </Link>
            <Link
              href="/contatti"
              className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
            >
              Contattaci
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
