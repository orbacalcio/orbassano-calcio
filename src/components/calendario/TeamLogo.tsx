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
  /** Lato del box quadrato in px (default 32). */
  size?: number;
  interactive?: boolean;
  href?: string | null;
  primaryColor?: string | null;
  className?: string;
  ariaLabel?: string;
  /** Logo adattivo: riempie la colonna (w-full) fino a `size` px di max,
   *  mantenendo il box quadrato. Si rimpicciolisce nelle griglie strette
   *  invece di sforare. Default false = dimensione fissa size×size. */
  adaptive?: boolean;
};

// Box quadrato 1:1 + object-contain: aspect universale che accoglie
// loghi quadrati (1:1), portrait (3:4, 4:5) e landscape (4:3) senza
// schiacciamenti. Eventuale padding laterale o verticale e' deciso
// dall'aspect ratio del singolo logo. Stesso pattern usato da
// tuttocampo / sprintsport / siti LND ufficiali.

export function TeamLogo({
  src,
  name,
  size = 32,
  interactive = true,
  href = null,
  primaryColor = null,
  className,
  ariaLabel,
  adaptive = false,
}: Props) {
  const isClickable = interactive && href !== null && href.length > 0;
  const boxHeight = size;
  const boxWidth = size;

  // adaptive: box quadrato w-full con max-width=size → il logo riempie la
  // colonna fino a `size` px e si rimpicciolisce se la colonna e' piu'
  // stretta (niente overflow nelle griglie dense). fixed: size×size.
  const inner = src ? (
    adaptive ? (
      <span
        className="relative block aspect-square w-full"
        style={{ maxWidth: boxWidth }}
      >
        <Image
          src={src}
          alt={ariaLabel ?? name}
          fill
          sizes={`${size}px`}
          className="rounded-sm bg-white p-0.5 object-contain"
        />
      </span>
    ) : (
      <Image
        src={src}
        alt={ariaLabel ?? name}
        width={boxWidth}
        height={boxHeight}
        className="rounded-sm bg-white p-0.5 object-contain"
        style={{ width: boxWidth, height: boxHeight }}
      />
    )
  ) : (
    <span
      aria-hidden
      className={cn(
        "border-border/40 text-ink-mid font-display flex items-center justify-center rounded-sm border font-bold uppercase",
        adaptive && "aspect-square w-full",
      )}
      style={{
        width: adaptive ? undefined : boxWidth,
        height: adaptive ? undefined : boxHeight,
        maxWidth: adaptive ? boxWidth : undefined,
        fontSize: Math.max(10, Math.floor(size * 0.4)),
        backgroundColor: primaryColor ?? undefined,
        color: primaryColor ? "#fff" : undefined,
      }}
    >
      {monogramma(name)}
    </span>
  );

  const baseClass = adaptive
    ? cn("flex w-full justify-center", className)
    : cn("inline-flex shrink-0 items-center", className);

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
