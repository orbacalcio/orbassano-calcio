"use client";

import { Loader2, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";


/**
 * Client component della pagina /ricerca: gestisce input controllato +
 * fetch a /api/search ad ogni cambio di `?q=...` nell'URL. Submit del
 * form aggiorna l'URL via router.push, cosi' lo state e' sempre
 * shareable/bookmarkable (utile per link condivisi).
 *
 * Display: 5 sezioni (Pagine, News, Squadre, Giocatori, Sponsor),
 * ciascuna mostrata solo se ha risultati. Pattern identico al
 * SearchDialog modale ma su pagina full-width.
 */
type Page = { id: string; title: string; path: string; section: string };
type News = {
  _id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  publishedAt: string | null;
};
type Player = {
  _id: string;
  firstName: string;
  lastName: string;
  slug: string;
  teamSlug: string | null;
  role: string | null;
};
type Team = {
  _id: string;
  name: string;
  slug: string;
  category: string | null;
};
type Sponsor = {
  _id: string;
  name: string;
  tier: string | null;
  website: string | null;
};

type SearchResults = {
  q: string;
  pages: Page[];
  news: News[];
  players: Player[];
  teams: Team[];
  sponsors: Sponsor[];
};

const EMPTY: SearchResults = {
  q: "",
  pages: [],
  news: [],
  players: [],
  teams: [],
  sponsors: [],
};

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  // Sincronizza input con URL su browser back/forward o link interno
  // con ?q=... Pattern "derive state during render" raccomandato
  // React 19: meno cascading rispetto a useEffect+setState.
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setInputValue(urlQ);
  }

  // Fetch ad ogni cambio di urlQ. Niente debounce qui: la pagina
  // ricarica solo sul submit del form, quindi la query e' gia'
  // "consolidata" dall'utente.
  useEffect(() => {
    const trimmed = urlQ.trim();
    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ ...EMPTY, q: trimmed });
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
      .then((r) => r.json() as Promise<SearchResults>)
      .then((data) => {
        if (cancelled) return;
        if (data.q === trimmed) setResults(data);
      })
      .catch(() => {
        if (!cancelled) setResults({ ...EMPTY, q: trimmed });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [urlQ]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) return;
    router.push(`/ricerca?q=${encodeURIComponent(trimmed)}`);
  }

  const totalResults =
    results.pages.length +
    results.news.length +
    results.players.length +
    results.teams.length +
    results.sponsors.length;

  const hasQuery = urlQ.trim().length >= 2;

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {/* Header + barra ricerca persistente sulla pagina */}
      <header className="flex flex-col gap-4">
        <span className="font-display text-brand-gold text-sm font-bold tracking-[0.2em] uppercase md:text-base">
          Ricerca
        </span>
        <h1 className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-4xl lg:text-5xl">
          Cerca nel sito
        </h1>
        <p className="text-ink-mid max-w-2xl text-base">
          News, squadre, giocatori, sponsor, pagine informative del club.
          Scrivi almeno 2 caratteri.
        </p>
        <form
          onSubmit={onSubmit}
          role="search"
          aria-label="Cerca nel sito"
          className="border-border bg-surface-1 focus-within:border-brand-gold/60 mt-2 flex items-center gap-3 rounded-md border p-3 md:p-4"
        >
          <SearchIcon
            size={22}
            className="text-brand-gold shrink-0"
            aria-hidden
          />
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Es. 5x1000, settore giovanile, Rossi, news…"
            aria-label="Termine di ricerca"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            className="text-ink-hi placeholder:text-ink-low font-display min-w-0 flex-1 bg-transparent text-xl leading-none font-bold tracking-[0.005em] uppercase outline-none md:text-2xl"
          />
          {loading && (
            <Loader2
              size={18}
              className="text-ink-mid shrink-0 animate-spin"
              aria-hidden
            />
          )}
          <button
            type="submit"
            aria-label="Avvia ricerca"
            disabled={inputValue.trim().length < 2}
            className="bg-brand-red text-brand-white hover:bg-brand-blue focus-visible:outline-brand-gold shrink-0 rounded-full px-5 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerca
          </button>
        </form>
      </header>

      {/* Risultati / stati vuoti */}
      {!hasQuery ? (
        <p className="text-ink-mid text-center text-sm md:text-base">
          Scrivi il tuo termine di ricerca nel campo qui sopra e premi Invio.
        </p>
      ) : loading && totalResults === 0 ? (
        <p className="text-ink-mid text-center text-sm md:text-base">
          Caricamento risultati…
        </p>
      ) : totalResults === 0 ? (
        <p className="text-ink-mid text-center text-sm md:text-base">
          Nessun risultato per &laquo;{urlQ}&raquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {results.pages.length > 0 && (
            <ResultGroup title="Pagine">
              {results.pages.map((p) => (
                <ResultItem
                  key={p.id}
                  href={p.path}
                  title={p.title}
                  subtitle={p.section}
                />
              ))}
            </ResultGroup>
          )}
          {results.news.length > 0 && (
            <ResultGroup title="News">
              {results.news.map((n) => (
                <ResultItem
                  key={n._id}
                  href={`/news/${n.slug}`}
                  title={n.title}
                  subtitle={n.category ?? "News"}
                />
              ))}
            </ResultGroup>
          )}
          {results.teams.length > 0 && (
            <ResultGroup title="Squadre">
              {results.teams.map((t) => (
                <ResultItem
                  key={t._id}
                  href={`/squadre/${t.slug}`}
                  title={t.name}
                  subtitle={t.category ?? "Squadra"}
                />
              ))}
            </ResultGroup>
          )}
          {results.players.length > 0 && (
            <ResultGroup title="Giocatori">
              {results.players.map((p) => {
                if (!p.teamSlug) return null;
                return (
                  <ResultItem
                    key={p._id}
                    href={`/squadre/${p.teamSlug}/${p.slug}`}
                    title={`${p.firstName} ${p.lastName}`}
                    subtitle={p.role ?? "Giocatore"}
                  />
                );
              })}
            </ResultGroup>
          )}
          {results.sponsors.length > 0 && (
            <ResultGroup title="Sponsor">
              {results.sponsors.map((s) => (
                <ResultItem
                  key={s._id}
                  href="/sponsor"
                  title={s.name}
                  subtitle={s.tier ?? "Sponsor"}
                />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
        {title}
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </ul>
    </section>
  );
}

function ResultItem({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2 group flex flex-col gap-1 rounded-xl border p-4 transition-colors"
      >
        <span className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
          {subtitle}
        </span>
        <span className="font-display text-ink-hi text-base leading-tight font-bold tracking-[0.005em] uppercase">
          {title}
        </span>
      </Link>
    </li>
  );
}
