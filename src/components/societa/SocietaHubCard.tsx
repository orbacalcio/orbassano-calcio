import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Card di accesso alle 4 sotto-pagine della sezione Società. Stessa
 * grammatica visiva di TeamCard ma senza immagine: layout dense con
 * numero in big display + icona Lucide + freccia hover.
 */
type Props = {
  number: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function SocietaHubCard({
  number,
  title,
  description,
  href,
  icon: Icon,
}: Props) {
  return (
    <Link
      href={href}
      className="group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col gap-6 overflow-hidden rounded-2xl border p-8 transition-all focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-brand-gold/30 text-6xl leading-none font-black tracking-[0.005em] sm:text-7xl">
          {number}
        </span>
        <Icon
          size={28}
          className="text-brand-gold/70 group-hover:text-brand-gold mt-2 transition-colors"
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
          {title}
        </h3>
        <p className="text-ink-mid text-sm leading-relaxed">{description}</p>
      </div>
      <div className="text-ink-low border-border/40 mt-auto flex items-center justify-between border-t pt-5 text-xs">
        <span className="font-mono tracking-wide uppercase">Approfondisci</span>
        <ArrowUpRight
          size={16}
          className="text-brand-gold opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}
