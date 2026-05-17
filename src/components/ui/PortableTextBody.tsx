import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/cn";
import { isSafeUrl, safeUrlOr } from "@/lib/validation";

/**
 * Renderer minimal per i campi PortableText di Sanity (descrizione team,
 * bio giocatore, articoli storici, corpo news). Override stilistici
 * editoriali sui marks principali.
 *
 * variant:
 * - "dark" (default): testo chiaro per sfondo navy del body (ink-*).
 * - "light": testo scuro per banda chiara (es. corpo news su
 *   bg-light-bg-0). Usa il set light-ink-* + brand-gold scurito.
 */
type Variant = "dark" | "light";

type Props = {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
  variant?: Variant;
};

type Tokens = {
  body: string;
  heading: string;
  strong: string;
  blockquote: string;
  link: string;
  linkDisabled: string;
};

const TOKENS: Record<Variant, Tokens> = {
  dark: {
    body: "text-ink-mid",
    heading: "text-ink-hi",
    strong: "text-ink-hi",
    blockquote: "text-ink-hi",
    link: "text-brand-gold hover:text-brand-gold/80",
    linkDisabled: "text-ink-mid",
  },
  light: {
    body: "text-light-ink-mid",
    heading: "text-light-ink-hi",
    strong: "text-light-ink-hi",
    blockquote: "text-light-ink-hi",
    // brand-red sul testo del corpo news (banda chiara): contrasto
    // forte vs il light-ink-mid del body e differenziazione netta
    // dal testo normale. Underline al hover per riconoscibilita'.
    link: "text-brand-red hover:text-brand-red/80",
    linkDisabled: "text-light-ink-mid",
  },
};

export function PortableTextBody({ value, className, variant = "dark" }: Props) {
  if (!value || value.length === 0) return null;
  const t = TOKENS[variant];
  return (
    <div
      className={cn(
        t.body,
        "flex flex-col gap-4 text-base leading-relaxed",
        className,
      )}
    >
      <PortableText
        value={value}
        components={{
          block: {
            normal: ({ children }) => <p>{children}</p>,
            h2: ({ children }) => (
              <h2
                className={cn(
                  "font-display mt-6 text-3xl font-extrabold tracking-[0.01em] uppercase",
                  t.heading,
                )}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className={cn(
                  "font-display mt-4 text-2xl font-bold tracking-[0.01em] uppercase",
                  t.heading,
                )}
              >
                {children}
              </h3>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className={cn(
                  "border-brand-gold border-l-2 pl-5 text-lg leading-relaxed italic",
                  t.blockquote,
                )}
              >
                {children}
              </blockquote>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong className={cn("font-semibold", t.strong)}>{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            link: ({ value: linkValue, children }) => {
              // Sanitize href: rifiuta javascript:/data:/vbscript: anche se
              // un admin riuscisse a salvarli forzando la validation Studio.
              const rawHref =
                typeof linkValue?.href === "string" ? linkValue.href : "";
              if (!isSafeUrl(rawHref)) {
                // Link non navigabile: rende come <span>, niente href eseguibile.
                return <span className={t.linkDisabled}>{children}</span>;
              }
              const href = safeUrlOr(rawHref);
              const isExternal = /^https?:\/\//i.test(href);
              return (
                <a
                  href={href}
                  className={cn(
                    "underline-offset-2 hover:underline",
                    t.link,
                  )}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              );
            },
          },
          list: {
            bullet: ({ children }) => (
              <ul className="ml-5 flex list-disc flex-col gap-2">{children}</ul>
            ),
            number: ({ children }) => (
              <ol className="ml-5 flex list-decimal flex-col gap-2">
                {children}
              </ol>
            ),
          },
        }}
      />
    </div>
  );
}
