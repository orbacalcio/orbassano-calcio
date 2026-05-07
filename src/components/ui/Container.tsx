import { cn } from "@/lib/cn";

/**
 * Gabbia editoriale standard. Usa Container per ogni blocco di
 * contenuto NON full-bleed. Per hero e immagini full-bleed, monta
 * direttamente senza Container.
 */
export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  size?: "narrow" | "default" | "wide";
}) {
  const max =
    size === "narrow"
      ? "max-w-3xl"
      : size === "wide"
        ? "max-w-screen-2xl"
        : "max-w-7xl";
  return (
    <Tag className={cn("mx-auto w-full px-6 lg:px-10", max, className)}>
      {children}
    </Tag>
  );
}
