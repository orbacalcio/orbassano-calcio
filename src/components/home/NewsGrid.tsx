import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { latestNewsQuery } from "@/sanity/queries";
import { Container } from "@/components/ui/Container";

/**
 * Griglia news homepage — pattern juventus.com: ogni card e'
 * UN'IMMAGINE intera (formato portrait 4:5) con overlay testuale in
 * basso (categoria gold + titolo bianco bold + pseudo-bottone
 * "Leggi l'articolo"). Niente header eyebrow/title/subtitle sopra
 * la grid: le card stesse parlano, lo stacco editoriale e' dato
 * dalla banda chiara di sfondo (light-bg-0).
 *
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
      className="group focus-visible:outline-brand-gold relative block aspect-[4/5] overflow-hidden rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-4 lg:rounded-[2.5rem]"
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
          <Newspaper size={80} className="text-surface-3" aria-hidden />
        </div>
      )}

      {/* Gradient bottom-up: scurisce il fondo dove vivono titolo +
          bottone, lascia respirare la parte alta della foto. */}
      <div
        aria-hidden
        className="from-surface-0/95 via-surface-0/55 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      {/* Categoria top-left: pill oro allineata al badge "In evidenza"
          dell'archivio /news (NewsCard.tsx). Stesso bg-brand-gold +
          text-surface-0 navy → identita' visiva coerente fra homepage e
          archivio. Su sfondo immagine il pill ha lettura forte anche
          quando la foto e' chiara. */}
      {news.category && (
        <span className="bg-brand-gold text-surface-0 font-display absolute top-5 left-5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase md:top-7 md:left-7 md:px-3.5 md:py-1.5 md:text-xs">
          {news.category}
        </span>
      )}

      {/* Overlay testuale in basso: titolo + pseudo-bottone.
          Padding piu' generoso (formato portrait 4:5) e titolo
          piu' grande per allinearsi al peso visivo delle card
          juventus.com. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:gap-5 md:p-8">
        <h3 className="font-display text-ink-hi line-clamp-3 text-xl leading-tight font-bold tracking-[0.01em] uppercase md:text-2xl lg:text-[1.7rem] lg:leading-[1.05]">
          {news.title}
        </h3>
        <span
          aria-hidden
          className="bg-brand-red btn-wow-sweep text-brand-white font-display group-hover:bg-brand-blue inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 md:text-xs"
        >
          Leggi l&apos;articolo
          <ArrowRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border-light-border bg-light-bg-1 flex flex-col items-center gap-3 rounded-[2rem] border p-12 text-center lg:rounded-[2.5rem]">
      <Newspaper size={48} className="text-light-ink-low" aria-hidden />
      <h3 className="font-display text-light-ink-hi text-2xl font-bold tracking-[0.01em] uppercase">
        Le news arrivano qui
      </h3>
      <p className="text-light-ink-mid max-w-md text-sm leading-relaxed">
        Appena la redazione del club pubblica un articolo dal CMS, lo trovi in
        questa sezione e nell&apos;archivio completo /news.
      </p>
    </div>
  );
}

/**
 * Link "Tutti i contenuti" sotto la grid: stile juventus.com — label
 * uppercase con freccia a destra incorniciata da due righe orizzontali
 * sottili (sopra + sotto). Niente hover state per scelta editoriale.
 */
function AllContentLink() {
  return (
    <div className="mt-8 flex justify-end md:mt-10">
      <Link
        href="/news"
        className="focus-visible:outline-brand-gold inline-flex flex-col items-stretch gap-2.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span
          aria-hidden
          className="bg-light-ink-mid/40 block h-px"
        />
        <span className="font-display text-light-ink-hi flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase">
          <span>Tutti i contenuti</span>
          <ArrowRight size={14} aria-hidden />
        </span>
        <span
          aria-hidden
          className="bg-light-ink-mid/40 block h-px"
        />
      </Link>
    </div>
  );
}

export async function NewsGrid() {
  const news = await fetchLatestNews();

  // Isola chiara su body navy (pattern juventus.com a bande): wrapper
  // bg-light-bg-0 + border-y per stacco netto. Niente header testuale
  // (eyebrow/title/subtitle rimossi): le card portrait grandi parlano
  // da sole. Le card news interne restano foto+overlay scuro+titolo
  // bianco (sub-isole scure su banda chiara).
  // Banda chiara con card portrait grandi (no header testuale).
  return (
    <section aria-label="Ultime news" className="bg-light-bg-0">
      <Container className="py-16 lg:py-20" size="wide">
        {news.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {news.slice(0, 3).map((n) => (
                <NewsCard key={n._id} news={n} />
              ))}
            </div>
            <AllContentLink />
          </>
        )}
      </Container>
    </section>
  );
}
