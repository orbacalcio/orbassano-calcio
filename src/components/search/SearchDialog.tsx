"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Delete, Loader2, Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Container } from "@/components/ui/Container";
import { Z } from "@/lib/z-indexes";

/**
 * Dialog di ricerca site-wide. Modal full-screen overlay con input
 * sticky in alto e risultati raggruppati per tipo (News, Squadre,
 * Giocatori, Sponsor) sotto.
 *
 * Comportamento:
 * - Auto-focus sull'input all'apertura
 * - Debounce 250ms sulle keystrokes prima del fetch a /api/search
 * - Esc chiude, click sullo sfondo chiude, click su un risultato
 *   chiude e naviga
 * - Body scroll lock durante apertura
 * - prefers-reduced-motion: niente fade/scale
 *
 * Scope: search basata su Sanity. Per ora cap 8 risultati per gruppo
 * (vedi /api/search). Indice incrementale o ranking smart sono follow-up
 * post-launch quando avremo volumi che lo giustificano.
 */
type Page = {
  id: string;
  title: string;
  path: string;
  section: string;
};

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

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchDialog({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Reset & focus on open. Le setState qui sono OK: sono one-shot al
  // toggle di `open` (sync con stato esterno controllato dal padre),
  // non un loop continuo di update.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ("");
      setResults(EMPTY);
      // Focus dopo l'animazione di apertura (~200ms)
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close + focus trap (Tab/Shift+Tab restano dentro il dialog).
  // Senza trap il focus uscirebbe sugli elementi sotto l'overlay, che
  // sono visivamente coperti ma ancora tabbabili → rotto a livello a11y.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        "a, button, input, [tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced fetch. setState qui sono guidate dal valore di `q`
  // (input testo controllato dall'utente): pattern legittimo di
  // sincronizzazione UI ↔ network state.
  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ ...EMPTY, q: trimmed });
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
        );
        const data = (await res.json()) as SearchResults;
        // Ignora risposte stale
        if (data.q === trimmed) {
          setResults(data);
        }
      } catch {
        setResults({ ...EMPTY, q: trimmed });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q, open]);

  const handleNavigate = useCallback(() => {
    onClose();
  }, [onClose]);

  const totalResults =
    results.pages.length +
    results.news.length +
    results.players.length +
    results.teams.length +
    results.sponsors.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-dialog"
          ref={dialogRef}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface-0/95 fixed inset-0 backdrop-blur-md"
          style={{ zIndex: Z.modal }}
          role="dialog"
          aria-modal="true"
          aria-label="Cerca nel sito"
          onClick={onClose}
        >
          <div
            className="border-border/50 sticky top-0 border-b backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Container size="wide">
              <div className="flex items-center gap-3 py-4">
                <SearchIcon
                  size={22}
                  className="text-brand-gold shrink-0"
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cerca tutti i contenuti…"
                  aria-label="Termine di ricerca"
                  autoComplete="off"
                  spellCheck={false}
                  className="text-ink-hi placeholder:text-ink-low font-display flex-1 bg-transparent text-2xl leading-none font-bold tracking-[0.005em] uppercase outline-none sm:text-3xl [&::-webkit-search-cancel-button]:appearance-none"
                />
                {loading && (
                  <Loader2
                    size={18}
                    className="text-ink-mid animate-spin"
                    aria-hidden
                  />
                )}
                {/* Cancella il testo digitato: icona backspace (NON una X,
                    per non confondersi col pulsante "Chiudi ricerca"). Il
                    clear nativo dell'input search è nascosto via CSS sopra. */}
                {q.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Cancella testo"
                    className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2"
                  >
                    <Delete size={20} aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Chiudi ricerca"
                  className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2"
                >
                  <X size={20} aria-hidden />
                </button>
              </div>
            </Container>
          </div>

          <div
            className="overflow-y-auto"
            style={{ height: "calc(100dvh - 70px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Container size="wide" className="py-8 lg:py-12">
              {q.trim().length < 2 ? (
                <p className="text-ink-mid text-center text-sm">
                  Inizia a scrivere (almeno 2 caratteri).
                </p>
              ) : !loading && totalResults === 0 ? (
                <p className="text-ink-mid text-center text-sm">
                  Nessun risultato per &laquo;{q}&raquo;.
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
                          onClick={handleNavigate}
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
                          onClick={handleNavigate}
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
                          onClick={handleNavigate}
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
                            onClick={handleNavigate}
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
                          onClick={handleNavigate}
                        />
                      ))}
                    </ResultGroup>
                  )}
                </div>
              )}
            </Container>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
      <h3 className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
        {title}
      </h3>
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
  onClick,
}: {
  href: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
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
