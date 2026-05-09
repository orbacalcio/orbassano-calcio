import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { NewsGallery } from "@/components/news/NewsGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import { Container } from "@/components/ui/Container";
import { formatItalianDate } from "@/lib/date";
import {
  buildBreadcrumbLd,
  buildNewsArticleLd,
} from "@/lib/json-ld";
import { fetchAllNewsSlugs, fetchNewsBySlug } from "@/sanity/fetchers";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await fetchAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const news = await fetchNewsBySlug(slug);
  if (!news) return { title: "Articolo non trovato" };
  return {
    title: news.title,
    description: news.excerpt ?? undefined,
    openGraph: news.cover
      ? { images: [{ url: news.cover }] }
      : undefined,
  };
}

export default async function NewsDetailPage(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const news = await fetchNewsBySlug(slug);
  if (!news) notFound();

  return (
    <article>
      <JsonLd
        data={buildNewsArticleLd({
          title: news.title,
          slug: news.slug,
          excerpt: news.excerpt,
          image: news.cover,
          publishedAt: news.publishedAt,
          author: news.author,
          category: news.category,
        })}
      />
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "News", url: "/news" },
          { name: news.title, url: `/news/${news.slug}` },
        ])}
      />
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-12 lg:py-16" size="wide">
          <Link
            href="/news"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Archivio news
          </Link>
          <div className="flex max-w-3xl flex-col gap-5">
            {news.category && (
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                {news.category}
              </span>
            )}
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              {news.title}
            </h1>
            {news.excerpt && (
              <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
                {news.excerpt}
              </p>
            )}
            <div className="text-ink-low border-border/40 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-xs">
              {news.publishedAt && (
                <span className="flex items-center gap-2">
                  <Calendar size={12} aria-hidden />
                  <span className="font-mono tracking-wide uppercase">
                    {formatItalianDate(news.publishedAt)}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-2">
                <User size={12} aria-hidden />
                <span className="font-mono tracking-wide uppercase">
                  {news.author ?? "Redazione"}
                </span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {news.cover && (
        <div className="border-border/50 border-b">
          <Container size="wide">
            <div className="relative -mt-px aspect-[16/9] w-full overflow-hidden">
              <Image
                src={news.cover}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
                placeholder={news.coverLqip ? "blur" : "empty"}
                blurDataURL={news.coverLqip ?? undefined}
                priority
              />
            </div>
          </Container>
        </div>
      )}

      <Container className="py-16 lg:py-20" size="narrow">
        {news.body ? (
          <PortableTextBody
            value={news.body}
            className="text-base lg:text-lg"
          />
        ) : (
          <p className="text-ink-mid italic">
            Articolo senza corpo testuale.
          </p>
        )}
      </Container>

      {news.gallery && news.gallery.length > 0 && (
        <Container className="border-border/40 border-t py-16" size="wide">
          <div className="mb-8 flex flex-col gap-2">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
              Galleria foto
            </span>
            <p className="text-ink-mid text-sm">
              Click su una foto per ingrandire.
            </p>
          </div>
          <NewsGallery images={news.gallery} />
        </Container>
      )}

      <Container className="border-border/40 border-t py-10" size="wide">
        <Link
          href="/news"
          className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
        >
          <ArrowLeft size={14} aria-hidden />
          Torna all&apos;archivio news
        </Link>
      </Container>
    </article>
  );
}
