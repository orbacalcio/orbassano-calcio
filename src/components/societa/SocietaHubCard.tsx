import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Card di accesso alle sotto-pagine della sezione Società. Stessa
 * identica grammatica visiva di TeamsCards (homepage):
 *  - border 90°, bg-surface-1 → surface-2 al hover
 *  - numero gold/40 grande in alto-sx (→ gold pieno al hover)
 *  - titolo display extrabold uppercase
 *  - descrizione body ink-mid
 *  - "Esplora" + freccia in fondo, fade-in al hover
 *
 * Niente icona Lucide (versione precedente): il numero gigante e' il
 * carattere visivo dominante. Niente rounded: 90° come tutti gli
 * altri box del sito (convenzione fissata in homepage).
 */
type Props = {
  number: string;
  title: string;
  description: string;
  href: string;
};

export function SocietaHubCard({ number, title, description, href }: Props) {
  return (
    <Link
      href={href}
      className="group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col gap-6 overflow-hidden border p-8 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 lg:p-10"
    >
      <span className="font-display text-brand-gold/40 group-hover:text-brand-gold text-5xl leading-none font-black transition-colors sm:text-6xl lg:text-8xl">
        {number}
      </span>
      <h3 className="font-display text-ink-hi text-2xl font-extrabold tracking-[0.01em] uppercase sm:text-3xl lg:text-4xl">
        {title}
      </h3>
      <p className="text-ink-mid text-sm leading-relaxed lg:text-base">
        {description}
      </p>
      <div className="text-brand-gold mt-auto inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
        Esplora
        <ArrowUpRight size={16} />
      </div>
    </Link>
  );
}
