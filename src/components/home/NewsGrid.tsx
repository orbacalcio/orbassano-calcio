import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { latestNewsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

/**
 * Griglia editoriale 2x2 sulla homepage:
 * 1 card grande a sinistra + 3 card piccole a destra.
 *
 * Hover: zoom della cover + reveal del kicker. Implementato con
 * gruppi Tailwind (group-hover:scale-[1.04]).
 */
type News = {
  _id: string;
  title: string;
  slug: { current: string };
  category: string | null;
  publishedAt: string;
  excerpt: string | null;
  cover: string | null;
  isPinned: boolean | null;
};

async function fetchLatestNews(): Promise<News[]> {
  try {
    const data = await sanityClient.fetch(
      latestNewsQuery,
      {},
      { next: { tags: ["news"] } },
    );
    return (data ?? []) as News[];
  } catch {
    return [];
  }
}

function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function NewsCard({
  news,
  size,
}: {
  news: News;
  size: "large" | "small";
}) {
  return (
    <Link
      href={`/news/${news.slug.current}`}
      className={cn(
        "group border-border bg-surface-1 hover:border-brand-gold/30 focus-visible:outline-brand-gold relative flex flex-col overflow-hidden rounded-2xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
        size === "large" ? "row-span-2 sm:col-span-2 lg:col-span-1" : "",
      )}
    >
      <div
        className={cn(
          "from-surface-2 to-surface-1 relative w-full overflow-hidden bg-gradient-to-br",
          size === "large" ? "aspect-[16/11]" : "aspect-[16/10]",
        )}
      >
        {news.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={news.cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper size={64} className="text-surface-3" aria-hidden />
          </div>
        )}
        <div className="from-surface-0/95 via-surface-0/40 absolute inset-0 bg-gradient-to-t to-transparent" />
        {news.category && (
          <span className="font-display text-brand-gold absolute top-4 left-4 text-[10px] font-semibold tracking-[0.2em] uppercase">
            {news.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-ink-low font-mono text-[11px] tracking-wide uppercase">
          {formatItalianDate(news.publishedAt)}
        </span>
        <h3
          className={cn(
            "font-display text-ink-hi font-bold tracking-[0.01em] uppercase",
            size === "large" ? "text-3xl leading-[0.95]" : "text-xl leading-tight",
          )}
        >
          {news.title}
        </h3>
        {size === "large" && news.excerpt && (
          <p className="text-ink-mid text-sm leading-relaxed">
            {news.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border-border bg-surface-1/40 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
      <Newspaper size={48} className="text-ink-low" aria-hidden />
      <h3 className="font-display text-ink-hi text-2xl font-bold tracking-[0.01em] uppercase">
        Le news arrivano qui
      </h3>
      <p className="text-ink-mid max-w-md text-sm leading-relaxed">
        Appena la redazione del club pubblica un articolo dal CMS, lo trovi in
        questa sezione e nell&apos;archivio completo /news.
      </p>
    </div>
  );
}

export async function NewsGrid() {
  const news = await fetchLatestNews();

  return (
    <Container className="py-20" size="wide">
      <Section
        eyebrow="In primo piano"
        title="Le ultime dal club"
        subtitle="Risultati, dietro le quinte, comunicati ufficiali. Tutto quello che esce dalla redazione di Orbassano Calcio."
      >
        <div className="mt-4 flex items-center justify-end">
          <Link
            href="/news"
            className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            Archivio completo
            <ArrowUpRight size={14} />
          </Link>
        </div>
        {news.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            {news[0] && <NewsCard news={news[0]} size="large" />}
            {news.slice(1, 4).map((n) => (
              <NewsCard key={n._id} news={n} size="small" />
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
