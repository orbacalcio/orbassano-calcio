import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Logo + nome squadra renderizzato uniformemente nelle MatchCard.
 *
 * Comportamento:
 *  - `src` valorizzato → <Image> Next con bg-white di fallback
 *    (molti loghi LND sono PNG trasparenti, leggibili solo su sfondo
 *    chiaro; con bg dark del sito sparirebbero dettagli)
 *  - `src` null → tile colorato (primaryColor o surface-2) con
 *    monogramma 2 lettere derivate dal nome
 *
 * Hyperlink:
 *  - `interactive=true` (default) + `href` valorizzato → <a> con
 *    hover (opacity 0.85). Per Orbassano linka /squadre/[slug]
 *    interno; per avversario linka club.websiteUrl o tuttocampoUrl
 *    (la cascata e' decisa dal MatchCard).
 *  - `interactive=false` → <span>: usato quando la MatchCard e' gia'
 *    una <a> esterna (variante Finished con reportLink) — niente
 *    nesting <a> illegale.
 */
const ACRONYM_RE = /^(asd|usd|ssd|ac|fc|us|ss|cs|gs|gsd|cd|polisportiva|pol)\.?$/i;

function monogramma(name: string): string {
  const words = name
    .replace(/[''`""]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !ACRONYM_RE.test(w.replace(/\./g, "")));
  const first = (words[0] ?? "").charAt(0).toUpperCase();
  const second = (words[1] ?? "").charAt(0).toUpperCase();
  const result = (first + second).replace(/[^A-ZÀ-ÝÄ]/g, "");
  return result.length > 0 ? result : "—";
}

type Props = {
  src: string | null;
  name: string;
  size?: number;
  interactive?: boolean;
  href?: string | null;
  primaryColor?: string | null;
  className?: string;
  ariaLabel?: string;
};

export function TeamLogo({
  src,
  name,
  size = 32,
  interactive = true,
  href = null,
  primaryColor = null,
  className,
  ariaLabel,
}: Props) {
  const isClickable = interactive && href !== null && href.length > 0;

  const inner = src ? (
    <Image
      src={src}
      alt={ariaLabel ?? name}
      width={size}
      height={size}
      className="rounded-sm bg-white p-0.5 object-contain"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="border-border/40 text-ink-mid font-display flex items-center justify-center rounded-sm border font-bold uppercase"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.floor(size * 0.4)),
        backgroundColor: primaryColor ?? undefined,
        color: primaryColor ? "#fff" : undefined,
      }}
    >
      {monogramma(name)}
    </span>
  );

  const baseClass = cn("inline-flex shrink-0 items-center", className);

  if (isClickable) {
    const isExternal = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel ?? `Apri ${name}`}
        className={cn(
          baseClass,
          "transition-opacity hover:opacity-85 focus-visible:outline-brand-gold focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm",
        )}
      >
        {inner}
      </a>
    );
  }

  return (
    <span aria-label={ariaLabel ?? name} className={baseClass}>
      {inner}
    </span>
  );
}
