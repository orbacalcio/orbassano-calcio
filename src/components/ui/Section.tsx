import { cn } from "@/lib/cn";

/**
 * Wrapper di sezione con eyebrow opzionale e titolo display.
 */
export function Section({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  id,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
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
            <h2 className="font-display text-ink-hi text-4xl font-extrabold tracking-[0.01em] uppercase sm:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-ink-mid max-w-2xl text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
