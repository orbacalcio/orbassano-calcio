import Link from "next/link";
import { ArrowRight, ArrowUpRight, Newspaper } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { latestNewsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

/**
 * Griglia news homepage — card uniformi (1/2/3 colonne responsive,
 * stesso aspect ratio, stessa typography, stessa height). Niente
 * gerarchia editoriale (no "1 grande + N piccole"): l'utente vede
 * blocchi visivamente equivalenti, piu' facile da scorrere.
 *
 * Hover: zoom della cover. Implementato con gruppi Tailwind
 * (group-hover:scale-[1.04]).
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

function NewsCard({ news }: { news: News }) {
  return (
    <Link
      href={`/news/${news.slug.current}`}
      className="group border-border bg-surface-1 hover:border-brand-gold/30 focus-visible:outline-brand-gold relative flex flex-col overflow-hidden rounded-2xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="from-surface-2 to-surface-1 relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br">
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
        <h3 className="font-display text-ink-hi line-clamp-3 text-xl leading-tight font-bold tracking-[0.01em] uppercase">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="text-ink-mid line-clamp-2 text-sm leading-relaxed">
            {news.excerpt}
          </p>
        )}
        {/* Pseudo-bottone (e' uno <span>, non un altro <a>: evita anchor
            nesting illegale dentro la card-Link). Il click sull'intera
            card naviga gia' all'articolo, lo span aggiunge solo l'affordance
            visiva richiesta. mt-auto ancora il bottone al fondo della card
            per uniformare l'altezza tra card con titoli/excerpt di lunghezza
            diversa. */}
        <span
          aria-hidden
          className="bg-brand-red text-brand-white font-display group-hover:bg-brand-red/90 mt-auto inline-flex w-fit items-center gap-2 rounded-full px-5 py-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors"
        >
          Leggi l&apos;articolo
          <ArrowRight size={12} aria-hidden />
        </span>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((n) => (
              <NewsCard key={n._id} news={n} />
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
