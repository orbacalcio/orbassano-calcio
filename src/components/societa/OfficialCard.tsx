import Image from "next/image";
import type { ClubOfficial } from "@/sanity/fetchers";

/**
 * Card dirigente per la pagina /societa/organigramma.
 *
 * Layout: ritratto verticale (3:4) sopra, titolo + nome sotto. Quando
 * la foto manca (caso reale finche' lo shooting societario non avviene)
 * fallback a iniziali su gradient navy con accento oro, coerente col
 * pattern di PlayerPlaceholder.
 */
type Props = { official: ClubOfficial };

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function OfficialCard({ official }: Props) {
  const initials = getInitials(official.fullName);
  const displayName = official.title
    ? `${official.title} ${official.fullName}`
    : official.fullName;

  return (
    <article className="border-border bg-surface-1 hover:border-brand-gold/30 group flex flex-col overflow-hidden rounded-2xl border transition-colors">
      <div className="relative aspect-[3/4] overflow-hidden">
        {official.photo ? (
          <Image
            src={official.photo}
            alt={`Ritratto di ${displayName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            placeholder={official.photoLqip ? "blur" : "empty"}
            blurDataURL={official.photoLqip ?? undefined}
          />
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/40 absolute inset-0 flex items-center justify-center bg-gradient-to-br"
          >
            <span className="font-display text-brand-gold/70 text-7xl font-black tracking-[0.005em] uppercase">
              {initials}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="from-surface-0/80 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <span className="text-brand-gold font-mono text-[11px] tracking-[0.15em] uppercase">
          {official.role}
        </span>
        <h3 className="font-display text-ink-hi text-xl leading-tight font-bold tracking-[0.005em]">
          {displayName}
        </h3>
      </div>
    </article>
  );
}
