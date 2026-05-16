import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { latestNewsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

/**
 * Griglia news homepage — pattern juventus.com: ogni card e'
 * UN'IMMAGINE intera con overlay testuale in basso (categoria gold +
 * titolo bianco bold + pseudo-bottone "Leggi l'articolo"). Niente
 * card "split image + text below": tutto vive dentro la foto, e
 * leggibilita' affidata al gradient bottom-up.
 *
 * Aspect ratio 16:9 fisso su tutte le card per uniformita' visiva.
 * Hover: zoom della cover (group-hover:scale).
 *
 * Sotto la grid: link "Tutti i contenuti" con cornicetta (cerchio
 * bordato attorno alla freccia) — affordance secondaria a freddo
 * archivio, separato visivamente dalle card.
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

function NewsCard({ news }: { news: News }) {
  return (
    <Link
      href={`/news/${news.slug.current}`}
      className="group focus-visible:outline-brand-gold relative block aspect-[16/9] overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {news.cover ? (
        <Image
          src={news.cover}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="from-surface-2 to-surface-1 flex h-full w-full items-center justify-center bg-gradient-to-br">
          <Newspaper size={64} className="text-surface-3" aria-hidden />
        </div>
      )}

      {/* Gradient bottom-up: scurisce il fondo dove vivono titolo +
          bottone, lascia respirare la parte alta della foto. */}
      <div
        aria-hidden
        className="from-dark-bg-0/95 via-dark-bg-0/55 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      {/* Categoria top-left (gold piccolo uppercase) */}
      {news.category && (
        <span className="font-display text-brand-gold absolute top-4 left-4 text-[10px] font-semibold tracking-[0.2em] uppercase md:text-xs">
          {news.category}
        </span>
      )}

      {/* Overlay testuale in basso: titolo + pseudo-bottone */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 md:p-6">
        <h3 className="font-display text-dark-ink-hi line-clamp-3 text-lg leading-tight font-bold tracking-[0.01em] uppercase md:text-xl">
          {news.title}
        </h3>
        <span
          aria-hidden
          className="bg-brand-red text-brand-white font-display group-hover:bg-brand-red/90 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors md:text-[11px]"
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

/**
 * Link "Tutti i contenuti" sotto la grid: stile juventus.com — freccia
 * dentro un cerchio bordato (cornicetta) + label in maiuscolo a destra.
 * Su hover: il cerchio si tinge gold e la freccia trasla a destra.
 */
function AllContentLink() {
  return (
    <div className="mt-8 flex justify-end md:mt-10">
      <Link
        href="/news"
        className="group focus-visible:outline-brand-gold inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="border-ink-mid/40 group-hover:border-brand-gold group-hover:bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300">
          <ArrowRight
            size={16}
            className="text-ink-hi group-hover:text-brand-gold transition-all duration-300 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
        <span className="font-display text-ink-hi group-hover:text-brand-gold text-sm font-bold tracking-[0.15em] uppercase transition-colors">
          Tutti i contenuti
        </span>
      </Link>
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
        {news.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((n) => (
                <NewsCard key={n._id} news={n} />
              ))}
            </div>
            <AllContentLink />
          </>
        )}
      </Section>
    </Container>
  );
}
