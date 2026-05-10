"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z-indexes";
import { sidebarOverflowItems } from "./SidebarLeft.items";

/**
 * Drawer di navigazione full-screen aperto via hamburger.
 *
 * Riusato da:
 * - MobileShell (mobile <lg, drawer 88vw)
 * - TopbarScrolled (desktop ≥lg scrollato oltre hero, stesso pattern)
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
  const teamsChildren: DrawerSection["children"] = [
    { href: "/squadre", label: "Tutte le squadre" },
  ];
  if (teamSlugs.has("prima-squadra")) {
    teamsChildren.push({ href: "/squadre/prima-squadra", label: "Prima Squadra" });
  }
  // Juniores: link diretto alla squadra Juniores (categoria "Juniores"
  // del Campionato Juniores LND, gradino tra Prima Squadra e SGS).
  if (teamSlugs.has("juniores")) {
    teamsChildren.push({ href: "/squadre/juniores", label: "Juniores Under 19" });
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

  return [
    {
      href: "/news",
      label: "News",
      children: [
        // Solo 1 child = parent → mostrato come link semplice (no accordion)
        { href: "/news", label: "Archivio completo" },
      ],
    },
    {
      href: "/squadre",
      label: "Squadre",
      children: teamsChildren,
    },
    {
      href: "/societa",
      label: "Società",
      children: [
        { href: "/societa", label: "Panoramica" },
        { href: "/societa/storia", label: "Storia" },
        { href: "/societa/organigramma", label: "Organigramma" },
        { href: "/societa/impianti", label: "Impianti sportivi" },
        { href: "/societa/biglietteria", label: "Biglietteria" },
      ],
    },
    {
      href: "/sponsor",
      label: "Sponsor",
      children: [
        { href: "/sponsor", label: "I nostri sponsor" },
        ...(opts.hasPartners
          ? [{ href: "/sponsor/partner", label: "Corporate Partner" }]
          : []),
        { href: "/sponsor/opportunita", label: "Diventa sponsor" },
      ],
    },
  ];
}
const FALLBACK_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/asdorbassanocalcio/",
  facebook: "https://facebook.com/asdorbassanocalcio",
  threads: "https://www.threads.net/@asdorbassanocalcio",
  youtube: "https://www.youtube.com/@OrbassanoCalcio",
  twitter: "https://twitter.com/orbassanocalcio",
  tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
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
            className="text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline-2"
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
            className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline-2"
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
            const rowClass =
              "font-display text-ink-hi hover:text-brand-gold flex w-full items-center justify-between text-5xl leading-none font-black tracking-[0.005em] uppercase transition-colors";

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
                    className={cn(rowClass, "py-1 text-left")}
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
                  <Link
                    href={section.href}
                    onClick={onClose}
                    className={cn(rowClass, "py-1")}
                  >
                    <span>{section.label}</span>
                    <ChevronRight
                      size={28}
                      className="text-ink-low shrink-0"
                      aria-hidden
                    />
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
                          className="text-ink-mid hover:text-ink-hi block py-1.5 text-base transition-colors"
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
          className="flex flex-col gap-1 px-2 py-4"
          aria-label="Sezioni secondarie"
        >
          {sidebarOverflowItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="text-ink-mid hover:bg-surface-1 hover:text-ink-hi flex items-center gap-3 rounded-lg px-4 py-2.5 text-base"
              >
                {Icon && <Icon size={18} aria-hidden />}
                <span>{item.label}</span>
              </Link>
            );
          })}
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
