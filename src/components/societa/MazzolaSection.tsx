import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * "Il Mazzola — i campioni che si sono allenati qui": sezione speciale
 * della pagina Storia (DATA_ORBASSANO §2 + §7). Lo stadio Valentino
 * Mazzola, ex impianto Sisport Fiat, ha ospitato gli allenamenti di:
 * - Torino, alterni dal 1979 alla meta' degli anni 2000
 * - Juventus, 1990-1994
 *
 * I nomi dei campioni sono fatti, non opinioni: hardcoded sostenibile.
 * Layout: heading editoriale a sinistra, marquee statico nominativi a
 * destra (no auto-scroll, e' una lista d'onore non un teaser).
 */
const CAMPIONI = [
  "Roberto Baggio",
  "Gianluca Vialli",
  "Alessandro Del Piero",
  "Fabrizio Ravanelli",
  "Angelo Peruzzi",
  "Gianluigi Lentini",
  "Francesco Graziani",
  "Paolo Pulici",
  "Claudio Sala",
  "Roberto Cravero",
];

export function MazzolaSection() {
  return (
    <section
      aria-labelledby="mazzola-title"
      className="bg-surface-2 border-border/40 relative overflow-hidden border-y"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-brand-gold/10 absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        <div className="bg-brand-blue/30 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        <div className="absolute inset-0 flex items-center justify-end opacity-[0.04]">
          <Image
            src="/Logo_Orbassano_2K.png"
            alt=""
            width={700}
            height={984}
            className="object-contain"
          />
        </div>
      </div>

      <Container className="relative grid items-start gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:py-28" size="wide">
        <div className="flex flex-col gap-6">
          <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            <Sparkles size={16} aria-hidden />
            Il Mazzola
          </span>
          <h2
            id="mazzola-title"
            className="font-display text-ink-hi text-4xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-5xl lg:text-6xl"
          >
            Sul nostro stadio
            <br />
            si sono allenati
            <br />
            <span className="text-brand-gold">i campioni</span>
          </h2>
          <p className="text-ink-mid max-w-xl text-base leading-relaxed sm:text-lg">
            Lo stadio Valentino Mazzola — oggi nel centro Sporting Orbassano
            (ex Sisport Fiat) — ha ospitato gli allenamenti del{" "}
            <strong className="text-ink-hi">Torino</strong> a periodi
            alterni dal 1979 alla metà degli anni 2000, e della{" "}
            <strong className="text-ink-hi">Juventus</strong> dal 1990 al
            1994. Su quel prato hanno mosso i tacchetti generazioni di
            campioni che hanno fatto la storia del calcio italiano.
          </p>
          <div className="border-border/60 text-ink-mid font-mono flex flex-col gap-1 border-l-2 pl-4 text-xs tracking-wide">
            <span>· Torino · 1979 → anni 2000</span>
            <span>· Juventus · 1990 → 1994</span>
            <span>· Amichevoli con Juventus di Trapattoni e Lippi</span>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {CAMPIONI.map((name, i) => (
            <li
              key={name}
              className="border-border/60 bg-surface-1/70 hover:border-brand-gold/40 group flex items-center gap-4 rounded-xl border p-5 backdrop-blur-sm transition-colors"
            >
              <span className="font-display text-brand-gold/80 text-2xl leading-none font-black tracking-[0.005em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-ink-hi text-base leading-tight font-bold tracking-[0.005em] uppercase sm:text-lg">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
