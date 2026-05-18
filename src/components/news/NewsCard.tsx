import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { formatItalianDate } from "@/lib/date";
import type { NewsSummary } from "@/sanity/fetchers";
import { cn } from "@/lib/cn";

/**
 * Card editoriale per archivio /news. Diversa dalla card hover-zoom
 * della home: layout density piu' alta, focus su excerpt + meta.
 */
type Props = {
  news: NewsSummary;
  variant?: "default" | "featured";
};

export function NewsCard({ news, variant = "default" }: Props) {
  if (!news.slug?.current) return null;
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/news/${news.slug.current}`}
      className={cn(
        // Allineato alle card news della homepage: rounded molto
        // marcato (32-40px), niente border. Hover sfuma il bg verso
        // surface-2 (era hover:border-gold con border, ora non c'e'
        // piu' border quindi cambiamo affordance).
        "group bg-surface-1 hover:bg-surface-2 focus-visible:outline-brand-gold relative flex flex-col overflow-hidden rounded-[2rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 lg:rounded-[2.5rem]",
        isFeatured ? "lg:flex-row" : "",
      )}
    >
      <div
        className={cn(
          "from-surface-2 to-surface-1 relative overflow-hidden bg-gradient-to-br",
          isFeatured
            ? "aspect-[16/10] lg:aspect-auto lg:w-1/2 lg:shrink-0"
            : "aspect-[16/10]",
        )}
      >
        {news.cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={news.cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper size={56} className="text-surface-3" aria-hidden />
          </div>
        )}
        <div
          aria-hidden
          className="from-surface-0/85 absolute inset-0 bg-gradient-to-t to-transparent"
        />
        {news.isPinned && (
          <span className="bg-brand-gold text-surface-0 font-display absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase">
            In evidenza
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-6",
          isFeatured ? "lg:p-10" : "",
        )}
      >
        {news.category && (
          <span className="font-display text-brand-gold text-[10px] font-bold tracking-[0.2em] uppercase">
            {news.category}
          </span>
        )}
        <span className="text-ink-low font-mono text-[11px] tracking-wide uppercase">
          {news.publishedAt ? formatItalianDate(news.publishedAt) : "Senza data"}
        </span>
        <h3
          className={cn(
            "font-display text-ink-hi font-bold tracking-[0.01em] uppercase",
            isFeatured
              ? "text-3xl leading-[0.95] sm:text-4xl"
              : "text-xl leading-tight",
          )}
        >
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="text-ink-mid text-sm leading-relaxed">{news.excerpt}</p>
        )}
        <div className="text-ink-low border-border/40 mt-auto flex items-center justify-between border-t pt-4 text-xs">
          <span className="font-mono tracking-wide uppercase">
            {news.author ?? "Redazione"}
          </span>
          <ArrowUpRight
            size={14}
            className="text-brand-gold opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
          />
        </div>
      </div>
    </Link>
  );
}
