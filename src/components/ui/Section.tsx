import { cn } from "@/lib/cn";

/**
 * Wrapper di sezione con eyebrow opzionale e titolo display.
 *
 * tone:
 * - "dark" (default): titolo bianco / subtitle grigio chiaro per body navy.
 * - "light": titolo navy / subtitle navy-medio per isole chiare (pattern
 *   juventus.com a bande, vedi NewsGrid e StoryNumbersGrid in homepage).
 */
type Tone = "dark" | "light";

export function Section({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  id,
  tone = "dark",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: Tone;
}) {
  const titleColor = tone === "light" ? "text-light-ink-hi" : "text-ink-hi";
  const subtitleColor = tone === "light" ? "text-light-ink-mid" : "text-ink-mid";
  return (
    <section id={id} className={cn("flex flex-col gap-6", className)}>
      {(eyebrow || title || subtitle) && (
        <header className="flex flex-col gap-2">
          {eyebrow && (
            <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2
              className={cn(
                "font-display text-4xl font-extrabold tracking-[0.01em] uppercase sm:text-5xl",
                titleColor,
              )}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={cn(
                "max-w-2xl text-base leading-relaxed",
                subtitleColor,
              )}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
