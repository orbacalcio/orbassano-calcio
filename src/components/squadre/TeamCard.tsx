import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { TeamSummary } from "@/sanity/fetchers";

type Props = { team: TeamSummary };

export function TeamCard({ team }: Props) {
  const subtitle =
    team.subcategory && team.subcategory !== team.name ? team.subcategory : null;
  const showCount = team.playerCount > 0;
  return (
    <Link
      href={`/squadre/${team.slug}`}
      aria-label={`Pagina ${team.name}`}
      className="group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col overflow-hidden rounded-2xl border transition-all focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {team.heroImage ? (
          <Image
            src={team.heroImage}
            alt={team.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/40 absolute inset-0 flex items-end bg-gradient-to-br p-6"
          >
            <span className="font-display text-surface-3/70 text-6xl leading-[0.85] font-black tracking-[0.005em] uppercase lg:text-7xl">
              {subtitle ?? team.name}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="from-surface-0/85 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>
      <div className="flex flex-col gap-2 p-6">
        <span className="text-brand-gold font-mono text-[11px] tracking-[0.12em] uppercase">
          {team.category}
        </span>
        <h3 className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.01em] uppercase">
          {team.name}
        </h3>
        {subtitle && <span className="text-ink-mid text-sm">{subtitle}</span>}
        <div className="text-ink-low mt-2 flex items-center justify-between text-xs">
          <span className="font-mono tracking-wide">
            {team.season ?? "—"}
            {showCount ? ` · ${team.playerCount} atleti` : ""}
          </span>
          <ArrowUpRight
            size={16}
            className="text-brand-gold opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </Link>
  );
}
