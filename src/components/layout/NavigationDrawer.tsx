"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { cn } from "@/lib/cn";
import { FEATURES } from "@/lib/features";
import { Z } from "@/lib/z-indexes";
import { sidebarOverflowItems } from "./SidebarLeft.items";

/**
 * Drawer di navigazione full-screen aperto via hamburger.
 *
 * Riusato da:
 * - MobileTopbar (mobile <lg, drawer 88vw)
 * - Topbar in modalita' scrolled (desktop ≥lg scrollato oltre hero)
 * - SidebarLeft tasto "ALTRO" (desktop ≥lg sopra hero)
 *
 * Pattern: slide da sinistra 250ms, focus trap, ESC dismiss,
 * click-outside dismiss, body scroll lock mentre aperto.
 *
 * Le 4 voci principali sono accordion: click toggle expand/collapse
 * delle sottosezioni. Solo una sezione aperta per volta. Per
 * navigare al INDEX della sezione, l'utente clicca il primo figlio
 * (es. "Panoramica" → /societa) o il link parent quando ha solo 1
 * figlio (caso "News").
 */

type DrawerSection = {
  href: string;
  label: string;
  children: Array<{ href: string; label: string }>;
};

function buildSections(opts: {
  hasPartners: boolean;
  activeTeamSlugs: string[];
}): DrawerSection[] {
  const teamSlugs = new Set(opts.activeTeamSlugs);

  // /squadre/settore-giovanile è una vista categoria, non una squadra
  // singola: mostrato sempre se almeno una squadra del settore è attiva.
  // NB: voce "Tutte le squadre" → /squadre rimossa 2026-05-17 (pattern
  // juventus.com: il menu navega direttamente alla squadra, niente
  // landing page hub generica). La pagina /squadre esiste ancora come
  // URL diretto ma non e' linkata dal menu/sitemap/mappa.
  const teamsChildren: DrawerSection["children"] = [];
  if (teamSlugs.has("prima-squadra")) {
    teamsChildren.push({ href: "/squadre/prima-squadra", label: "Prima Squadra" });
  }
  // Juniores: link diretto alla squadra Juniores (categoria "Juniores"
  // del Campionato Juniores LND, gradino tra Prima Squadra e SGS).
  if (teamSlugs.has("juniores")) {
    teamsChildren.push({ href: "/squadre/juniores", label: "Juniores" });
  }
  // Settore Giovanile è una categoria: mostrata se ci sono squadre con
  // quello slug pattern (under-14/15/16/17). Per semplicita' la mostriamo
  // sempre — se nessuna è attiva la pagina filtra a vuoto e mostra il
  // fallback "le squadre non sono ancora pubblicate".
  teamsChildren.push({
    href: "/squadre/settore-giovanile",
    label: "Settore Giovanile",
  });
  if (teamSlugs.has("scuola-calcio")) {
    teamsChildren.push({ href: "/squadre/scuola-calcio", label: "Scuola Calcio" });
  }
  // NB: Open Days + Tornei NON sono piu' qui (richiesta utente
  // 2026-05-17). Sono passati sotto l'accordion Calendario perche'
  // sono di fatto eventi a calendario, non sezioni squadre.

  // Accordion Calendario: sub-link per categoria. "Tutti i calendari"
  // (pagina hub /calendario) e' stata rimossa 2026-05-17 su richiesta
  // utente — la pagina /calendario esiste ancora come URL diretto ma
  // non e' piu' linkata da nessuna parte. Sub-link puntano direttamente
  // al calendario della categoria, in coda Open Days + Tornei (eventi
  // extra-campionato).
  const calendarioChildren: DrawerSection["children"] = [];
  if (teamSlugs.has("prima-squadra")) {
    calendarioChildren.push({
      href: "/squadre/prima-squadra/calendario",
      label: "Prima Squadra",
    });
  }
  if (teamSlugs.has("juniores")) {
    calendarioChildren.push({
      href: "/squadre/juniores/calendario",
      label: "Juniores",
    });
  }
  // Settore Giovanile: link alla PAGINA AGGREGATA che combina
  // U14/U15/U16/U17 in lista cronologica unica (richiesta utente
  // 2026-05-17). Le singole pagine calendario per ogni squadra
  // giovanile restano accessibili via URL diretto ma non vengono
  // piu' linkate dal sito.
  calendarioChildren.push({
    href: "/squadre/settore-giovanile/calendario",
    label: "Settore Giovanile",
  });
  calendarioChildren.push({
    href: "/settore-giovanile/open-days",
    label: "Open Days",
  });
  calendarioChildren.push({
    href: "/tornei",
    label: "Tornei",
  });
  // Archivio storico: hub /archivio con le stagioni passate. Linkato in
  // coda all'accordion Calendario perche' e' il complemento naturale
  // dei calendari delle stagioni correnti (richiesta utente 2026-05-18).
  calendarioChildren.push({
    href: "/archivio",
    label: "Archivio stagioni",
  });

  // 5 voci main in ordine fisso: News · Squadre · Calendario · Gallery ·
  // Società. Sponsor vive nelle voci secondarie (sidebarOverflowItems).
  // Calendario promossa a main 2026-05-17 con sottomenu accordion per
  // categoria (richiesta utente). Gallery promossa a top-level (era
  // /news/gallery sotto News).
  return [
    {
      href: "/news",
      label: "News",
      // 1 solo child = link diretto, nessun accordion (vedi rendering
      // drawer: isAccordion = children.length > 1).
      children: [{ href: "/news", label: "News" }],
    },
    {
      href: "/squadre",
      label: "Squadre",
      children: teamsChildren,
    },
    {
      href: "/calendario",
      label: "Calendario",
      children: calendarioChildren,
    },
    {
      href: "/gallery",
      label: "Gallery",
      children: [{ href: "/gallery", label: "Gallery" }],
    },
    {
      href: "/societa",
      label: "Società",
      // Voce "Panoramica" → /societa rimossa 2026-05-17 (pattern
      // juventus.com: niente landing hub, naviga direttamente alle
      // sotto-pagine). /societa esiste ancora come URL diretto ma
      // non e' linkata dal menu/sitemap/mappa.
      // Codice Etico + Segnalazioni mostrati solo se governance flag
      // attivo (vedi src/lib/features.ts).
      children: [
        { href: "/societa/storia", label: "Storia" },
        { href: "/societa/organigramma", label: "Organigramma" },
        { href: "/societa/impianti", label: "Impianti sportivi" },
        { href: "/societa/biglietteria", label: "Biglietteria" },
        ...(FEATURES.governanceSection
          ? [
              { href: "/societa/codice-etico", label: "Codice Etico" },
              { href: "/societa/segnalazioni", label: "Segnalazioni" },
            ]
          : []),
      ],
    },
  ];
}
const FALLBACK_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/asdorbassanocalcio/",
  facebook: "https://facebook.com/asdorbassanocalcio",
  youtube: "https://www.youtube.com/@OrbassanoCalcio/playlists",
  tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
  threads: "https://www.threads.net/@asdorbassanocalcio",
};

export function NavigationDrawer({
  open,
  onClose,
  onSearchClick,
  hasPartners,
  activeTeamSlugs,
  socialLinks = FALLBACK_LINKS,
}: {
  open: boolean;
  onClose: () => void;
  onSearchClick: () => void;
  hasPartners: boolean;
  activeTeamSlugs: string[];
  socialLinks?: SocialLinks;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const sections = buildSections({ hasPartners, activeTeamSlugs });

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
          "a, button, [tabindex]:not([tabindex='-1'])",
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
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, [open, onClose]);

  // Reset accordion alla chiusura, cosi' la prossima apertura parte
  // pulita (nessuna sezione gia' espansa). Il componente NON si
  // smonta su close (rende null ma resta nel tree), quindi serve
  // l'effect per resettare lo state.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenSection(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: Z.mobileDrawer - 1 }}
      />
      <aside
        id="navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        className={cn(
          "bg-surface-0 fixed top-0 left-0 flex h-full w-[88vw] max-w-md flex-col overflow-y-auto",
          "animate-[slideIn_250ms_ease-out]",
        )}
        style={{ zIndex: Z.mobileDrawer }}
      >
        <div className="border-border/50 flex h-14 items-center justify-between border-b px-4">
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Chiudi menu"
            onClick={onClose}
            className="text-ink-hi focus-visible:outline-brand-gold flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2"
          >
            <X size={22} />
          </button>
          <Image src="/Logo_Orbassano_2K.png" alt="" width={36} height={51} />
          <button
            type="button"
            onClick={() => {
              onClose();
              onSearchClick();
            }}
            aria-label="Cerca"
            className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2"
          >
            <Search size={20} />
          </button>
        </div>

        <nav
          className="flex flex-col gap-3 px-4 py-8"
          aria-label="Sezioni principali"
        >
          {sections.map((section) => {
            const isAccordion = section.children.length > 1;
            const isOpen = openSection === section.href;
            // Font allineato pattern juventus.com (≈ text-4xl, peso 900,
            // letter-spacing minimo). Stesso identico size per le voci
            // secondarie quick-link in fondo al drawer: gerarchia
            // piatta, niente caratterizzazione "principali vs minori"
            // — l'utente vede una lista uniforme di scelte.
            const rowClass =
              "font-display text-ink-hi hover:text-brand-gold flex w-full items-center justify-between text-4xl leading-none font-black tracking-[0.005em] uppercase transition-colors";

            return (
              <div key={section.href} className="flex flex-col">
                {isAccordion ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSection(isOpen ? null : section.href)
                    }
                    aria-expanded={isOpen}
                    aria-controls={`drawer-section-${section.href.replace(/\//g, "-")}`}
                    className={cn(rowClass, "min-h-[44px] py-2 text-left")}
                  >
                    <span>{section.label}</span>
                    <ChevronRight
                      size={28}
                      className={cn(
                        "text-ink-low shrink-0 transition-transform",
                        isOpen && "rotate-90",
                      )}
                      aria-hidden
                    />
                  </button>
                ) : (
                  // Voce senza sotto-pagine: link diretto, niente chevron
                  // (la freccia ha senso solo quando indica un accordion
                  // espandibile, non una destinazione finale).
                  <Link
                    href={section.href}
                    onClick={onClose}
                    className={cn(rowClass, "min-h-[44px] py-2")}
                  >
                    <span>{section.label}</span>
                  </Link>
                )}

                {isAccordion && isOpen && (
                  <ul
                    id={`drawer-section-${section.href.replace(/\//g, "-")}`}
                    className="flex flex-col gap-1 pt-3 pl-1"
                  >
                    {section.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className="text-ink-mid hover:text-ink-hi flex min-h-[44px] items-center py-2 text-base transition-colors"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-border/50 mx-4 border-t" aria-hidden />

        <nav
          className="flex flex-col gap-3 px-4 py-4"
          aria-label="Sezioni secondarie"
        >
          {sidebarOverflowItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="font-display text-ink-hi hover:text-brand-gold block w-full py-1 text-4xl leading-none font-black tracking-[0.005em] uppercase transition-colors"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-4 py-6">
          <span className="text-ink-low font-display text-[10px] font-semibold tracking-[0.2em] uppercase">
            Seguici
          </span>
          <SocialIcons links={socialLinks} />
        </div>
      </aside>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
