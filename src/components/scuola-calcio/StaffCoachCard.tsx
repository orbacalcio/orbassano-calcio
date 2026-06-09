import Image from "next/image";
import type { ScuolaCalcioCoach } from "@/sanity/fetchers";

/**
 * Card singolo coach Scuola Calcio: foto ritratto (o fallback navy
 * con iniziali), nome, ruolo, qualifiche FIGC, bio breve.
 *
 * Layout: foto verticale 3:4 in alto + dati sotto, navy card.
 */
export function StaffCoachCard({ coach }: { coach: ScuolaCalcioCoach }) {
  const initials = coach.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <article className="border-border bg-surface-1 flex flex-col overflow-hidden rounded-2xl border">
      <div className="relative aspect-[3/4] overflow-hidden">
        {coach.photo ? (
          <Image
            src={coach.photo}
            alt={coach.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            placeholder={coach.photoLqip ? "blur" : "empty"}
            blurDataURL={coach.photoLqip ?? undefined}
          />
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 flex items-center justify-center bg-gradient-to-br"
          >
            <span className="font-display text-brand-gold/40 text-7xl font-black tracking-[0.005em]">
              {initials || "—"}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="from-surface-0/85 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <span className="text-brand-gold font-mono text-[10px] tracking-[0.18em] uppercase">
          {coach.role}
        </span>
        <h3 className="font-display text-ink-hi text-xl leading-tight font-extrabold tracking-[0.005em] uppercase">
          {coach.name}
        </h3>
        {coach.qualifications && (
          <span className="text-ink-mid text-xs leading-snug">
            {coach.qualifications}
          </span>
        )}
        {coach.bio && (
          <p className="text-ink-mid border-border/40 mt-2 border-t pt-3 text-sm leading-relaxed">
            {coach.bio}
          </p>
        )}
      </div>
    </article>
  );
}
