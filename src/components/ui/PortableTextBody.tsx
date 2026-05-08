import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/cn";

/**
 * Renderer minimal per i campi PortableText di Sanity (descrizione team,
 * bio giocatore, articoli storici). Override stilistici editoriali sui
 * marks principali; estendere quando arrivano news con embed media.
 */
type Props = {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
};

export function PortableTextBody({ value, className }: Props) {
  if (!value || value.length === 0) return null;
  return (
    <div
      className={cn(
        "text-ink-mid flex flex-col gap-4 text-base leading-relaxed",
        className,
      )}
    >
      <PortableText
        value={value}
        components={{
          block: {
            normal: ({ children }) => <p>{children}</p>,
            h2: ({ children }) => (
              <h2 className="font-display text-ink-hi mt-6 text-3xl font-extrabold tracking-[0.01em] uppercase">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-ink-hi mt-4 text-2xl font-bold tracking-[0.01em] uppercase">
                {children}
              </h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-brand-gold text-ink-hi border-l-2 pl-5 text-lg leading-relaxed italic">
                {children}
              </blockquote>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong className="text-ink-hi font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            link: ({ value: linkValue, children }) => {
              const href =
                typeof linkValue?.href === "string" ? linkValue.href : "#";
              const isExternal = /^https?:\/\//.test(href);
              return (
                <a
                  href={href}
                  className="text-brand-gold hover:text-brand-gold/80 underline-offset-2 hover:underline"
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
