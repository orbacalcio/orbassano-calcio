import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PlayerPlaceholder } from "./PlayerPlaceholder";
import type { PlayerSummary } from "@/sanity/fetchers";

type Props = {
  player: PlayerSummary;
  teamSlug: string;
  className?: string;
};

export function PlayerCard({ player, teamSlug, className }: Props) {
  const fullName = `${player.firstName} ${player.lastName}`;
  const hasNumber =
    player.shirtNumber !== null && player.shirtNumber !== undefined;
  return (
    <Link
      href={`/squadre/${teamSlug}/${player.slug}`}
      aria-label={`Scheda di ${fullName}`}
      className={cn(
        "group border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col overflow-hidden rounded-2xl border transition-all focus-visible:outline-2 focus-visible:outline-offset-4",
        className,
      )}
    >
      <div className="relative">
        {player.photo ? (
          <Image
            src={player.photo}
            alt={fullName}
            width={400}
            height={500}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <PlayerPlaceholder
            firstName={player.firstName}
            lastName={player.lastName}
          />
        )}
        {hasNumber && (
          <span className="font-mono text-brand-gold bg-surface-0/75 absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider backdrop-blur-sm">
            #{player.shirtNumber}
          </span>
        )}
        {player.isCaptain && (
          <span
            aria-label="Capitano"
            title="Capitano"
            className="font-display text-surface-0 bg-brand-gold absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold tracking-[0.05em] uppercase"
          >
            C
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span className="text-ink-low font-mono text-[11px] tracking-[0.12em] uppercase">
          {player.role ?? "Ruolo da definire"}
        </span>
        <span className="font-display text-ink-hi text-base leading-tight font-bold tracking-[0.01em] uppercase">
          {player.lastName}
        </span>
        <span className="text-ink-mid text-sm">{player.firstName}</span>
      </div>
    </Link>
  );
}
