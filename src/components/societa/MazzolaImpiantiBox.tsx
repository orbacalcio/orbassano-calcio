import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";

/**
 * Box "Il Mazzola" — sezione speciale della pagina Impianti.
 *
 * Lo stadio Valentino Mazzola, ex impianto Sisport Fiat, ha ospitato
 * gli allenamenti di Torino (alterni dal 1979 alla meta' degli anni
 * 2000) e Juventus (1990-1994). Il box racconta la storia + lista dei
 * campioni passati di li'.
 *
 * Tutti i testi sono modificabili dall'admin via Sanity Studio
 * (singleton settings → fieldset "Box Il Mazzola"). I fallback
 * editoriali sotto si attivano se l'admin non ha popolato il CMS.
 *
 * Layout: heading + paragrafo a sinistra, grid nomi 2 colonne a
 * destra. Senza numerazione (richiesta utente, era "01/02/..." nella
 * versione precedente in pagina Storia).
 */

type MazzolaSettings = {
  mazzolaEyebrow?: string | null;
  mazzolaTitle?: string | null;
  mazzolaBody?: string | null;
  mazzolaPlayers?: string[] | null;
};

const FALLBACK_EYEBROW = "Il Mazzola";
const FALLBACK_TITLE = "Sul nostro stadio si sono allenati i campioni";
const FALLBACK_BODY =
  "Nella sua storia l'Orbassano ha giocato le proprie gare interne tra il centro sportivo comunale Aldo Porta, il centro sportivo comunale di Tetti Francesi (durante le stagioni giocate come Aurora Sporting Orbassano) e lo stadio intitolato a Valentino Mazzola oggi situato all'interno del centro sportivo Sporting Orbassano, ex impianto Sisport Fiat che nel passato ha ospitato a più riprese gli allenamenti del Torino Calcio (a periodi alterni tra il 1979 e la metà degli anni 2000) e della Juventus (tra il 1990 ed il 1994), anni in cui hanno solcato quel prato campioni del calibro di:";
const FALLBACK_PLAYERS = [
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

async function fetchMazzolaSettings(): Promise<MazzolaSettings> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    return (data ?? {}) as MazzolaSettings;
  } catch {
    return {};
  }
}

export async function MazzolaImpiantiBox() {
  const settings = await fetchMazzolaSettings();
  const eyebrow = settings.mazzolaEyebrow?.trim() || FALLBACK_EYEBROW;
  const title = settings.mazzolaTitle?.trim() || FALLBACK_TITLE;
  const body = settings.mazzolaBody?.trim() || FALLBACK_BODY;
  const players =
    settings.mazzolaPlayers && settings.mazzolaPlayers.length > 0
      ? settings.mazzolaPlayers.filter((p) => p && p.trim().length > 0)
      : FALLBACK_PLAYERS;

  return (
    <section
      aria-labelledby="mazzola-impianti-title"
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

      <Container
        className="relative grid items-start gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:py-28"
        size="wide"
      >
        <div className="flex flex-col gap-6">
          <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            <Sparkles size={16} aria-hidden />
            {eyebrow}
          </span>
          <h2
            id="mazzola-impianti-title"
            className="font-display text-ink-hi text-4xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-5xl lg:text-6xl"
          >
            {title.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="text-ink-mid max-w-xl text-base leading-relaxed whitespace-pre-line sm:text-lg">
            {body}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {players.map((name) => (
            <li
              key={name}
              className="border-border/60 bg-surface-1/70 hover:border-brand-gold/40 group flex items-center rounded-xl border p-5 backdrop-blur-sm transition-colors"
            >
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
