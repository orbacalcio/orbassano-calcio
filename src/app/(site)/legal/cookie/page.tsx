import type { Metadata } from "next";
import Link from "next/link";
import { Ban, Eye, Shield } from "lucide-react";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  alternates: { canonical: "/legal/cookie" },
  title: "Cookie policy",
  description:
    "Cookie utilizzati da orbassanocalcio.com: tecnici sempre attivi, analytics e widget esterni solo con consenso. Conforme GDPR + Garante 10 giugno 2021.",
};

const LAST_UPDATE = "9 maggio 2026";

/**
 * Cookie policy "versione semplice": 3 card colorate (gold/blue/red)
 * spiegano in modo immediato cosa attiviamo. Il dettaglio legale resta
 * a fondo pagina (riferimenti GDPR, link policy dei terzi, browser
 * instructions, contatti). Conformita' GDPR + Provvedimento Garante
 * 10/06/2021: tutto cio' che serve c'e', ma scritto come parlerebbe
 * una persona, non un avvocato.
 */
export default function CookiePage() {
  return (
    <LegalLayout
      eyebrow="Cookie policy"
      title="Cookie usati su questo sito"
      intro="In sintesi: cookie tecnici sempre attivi, tutto il resto solo se accetti, mai pubblicità o profilazione."
      lastUpdate={LAST_UPDATE}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <CategoryCard
          variant="always"
          title="Sempre attivi"
          subtitle="Servono al sito"
          icon={<Shield size={32} aria-hidden />}
          items={[
            "Sessione di navigazione",
            "Sicurezza (anti-spam, anti-bot)",
            "Memoria della tua scelta su questo banner",
          ]}
        />
        <CategoryCard
          variant="optional"
          title="Solo se accetti"
          subtitle="Migliorano il sito"
          icon={<Eye size={32} aria-hidden />}
          items={[
            "Statistiche pagina anonime (Vercel Analytics)",
            "Widget Instagram nella sezione Vivi l'Orba (Behold)",
            "Video YouTube se embedded in news",
          ]}
        />
        <CategoryCard
          variant="never"
          title="Mai"
          subtitle="Non li useremo"
          icon={<Ban size={32} aria-hidden />}
          items={[
            "Pubblicità targetizzata",
            "Profilazione del comportamento",
            "Vendita dati a terzi",
          ]}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase">
          Cambia idea quando vuoi
        </h2>
        <p>
          Le tue scelte restano valide 6 mesi. Per modificarle prima:
          cancella i cookie del browser e ricarica il sito — il banner
          ricompare e puoi rifare la scelta. Oppure usa le impostazioni
          del browser:{" "}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            Chrome
          </a>
          ,{" "}
          <a
            href="https://support.mozilla.org/it/kb/Eliminare%20i%20cookie"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            Firefox
          </a>
          ,{" "}
          <a
            href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            Safari
          </a>
          ,{" "}
          <a
            href="https://support.microsoft.com/it-it/microsoft-edge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            Edge
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase">
          Chi tratta i tuoi dati
        </h2>
        <p>
          I cookie opzionali sono installati da servizi esterni con loro
          informativa privacy:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Vercel
            </a>{" "}
            — hosting e analytics anonime
          </li>
          <li>
            <a
              href="https://www.behold.so/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Behold
            </a>{" "}
            — widget Instagram (passa per Meta/Instagram)
          </li>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Google/YouTube
            </a>{" "}
            — video embedded nelle news (solo se presenti)
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase">
          Domande?
        </h2>
        <p>
          Scrivi a{" "}
          <a
            href="mailto:info@orbassanocalcio.com"
            className="text-brand-gold hover:underline"
          >
            info@orbassanocalcio.com
          </a>
          . Per i tuoi diritti completi (accesso, rettifica,
          cancellazione) leggi l&apos;
          <Link
            href="/legal/privacy"
            className="text-brand-gold hover:underline"
          >
            informativa privacy
          </Link>
          .
        </p>
        <p className="text-ink-low text-xs leading-relaxed">
          Riferimenti normativi: art. 122 D.lgs. 196/2003, Reg. UE 2016/679
          (GDPR), Provvedimento Garante Privacy 10 giugno 2021.
        </p>
      </section>
    </LegalLayout>
  );
}

/**
 * Card 3-stato (sempre attivi / opzionali / mai) — bordo colorato per
 * categoria + icona big + lista bullet plain. L'effetto wow vive qui:
 * non e' una pagina-prosa monolitica, e' una griglia che si scansiona
 * in 5 secondi.
 */
function CategoryCard({
  variant,
  title,
  subtitle,
  icon,
  items,
}: {
  variant: "always" | "optional" | "never";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: string[];
}) {
  // Token per variant: solo border + icon color cambiano. Body resta
  // neutro per leggibilita' (i 3 colori in pieno sarebbero rumore).
  const styles = {
    always: {
      border: "border-brand-gold/50",
      accent: "text-brand-gold",
      bg: "bg-brand-gold/[0.04]",
    },
    optional: {
      border: "border-brand-blue/50",
      accent: "text-brand-blue",
      bg: "bg-brand-blue/[0.04]",
    },
    never: {
      border: "border-brand-red/50",
      accent: "text-brand-red",
      bg: "bg-brand-red/[0.04]",
    },
  }[variant];

  return (
    <div
      className={`${styles.border} ${styles.bg} flex flex-col gap-4 rounded-2xl border p-6`}
    >
      <div className={`${styles.accent} flex items-center gap-3`}>
        {icon}
        <div className="flex flex-col">
          <span className="font-display text-ink-hi text-xl font-bold tracking-[0.005em] uppercase">
            {title}
          </span>
          <span className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
            {subtitle}
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-ink-mid flex items-start gap-2 text-sm leading-relaxed"
          >
            <span
              className={`${styles.accent} mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-current`}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
