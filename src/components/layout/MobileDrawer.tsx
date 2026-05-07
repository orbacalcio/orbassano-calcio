"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Menu, Search, X } from "lucide-react";
// Search e' usata solo dentro il drawer aperto, non nella topbar mobile.
import { useEffect, useRef, useState } from "react";
import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z-indexes";
import {
  sidebarMainItems,
  sidebarOverflowItems,
} from "./SidebarLeft.items";

/**
 * Mobile drawer + topbar mobile.
 *
 * Drawer largo 88vw, slide da sinistra 250ms ease-out, overlay scuro
 * sul resto. Focus trap, ESC dismiss, click-outside dismiss.
 *
 * Topbar mobile (44px sticky): hamburger left, logo center, search right.
 * No login, no profile.
 */
const FALLBACK_LINKS: SocialLinks = {
  instagram: "https://www.instagram.com/asdorbassanocalcio/",
  facebook: "https://facebook.com/asdorbassanocalcio",
  threads: "https://www.threads.net/@asdorbassanocalcio",
  youtube: "https://www.youtube.com/@OrbassanoCalcio",
  twitter: "https://twitter.com/orbassanocalcio",
  tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
};

export function MobileShell({
  socialLinks = FALLBACK_LINKS,
}: {
  socialLinks?: SocialLinks;
}) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
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
  }, [open]);

  return (
    <>
      <header
        className="border-border/50 bg-surface-0/80 fixed inset-x-0 top-0 flex h-11 items-center justify-between border-b px-3 backdrop-blur-md lg:hidden"
        style={{ zIndex: Z.topbar }}
        role="banner"
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label="Apri menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen(true)}
          className="text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline-2"
        >
          <Menu size={22} />
        </button>
        <Link
          href="/"
          aria-label="ASD Orbassano Calcio - Home"
          className="flex items-center"
        >
          <Image
            src="/Logo_Orbassano_2K.png"
            alt=""
            width={28}
            height={40}
            priority
          />
        </Link>
        {/* Spaziatore destro: la ricerca su mobile vive solo dentro il drawer */}
        <span aria-hidden className="h-9 w-9" />
      </header>

      {open && (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 lg:hidden"
            style={{ zIndex: Z.mobileDrawer - 1 }}
          />
          <aside
            id="mobile-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
            className={cn(
              "bg-surface-0 fixed top-0 left-0 flex h-full w-[88vw] flex-col overflow-y-auto lg:hidden",
              "animate-[slideIn_250ms_ease-out]",
            )}
            style={{ zIndex: Z.mobileDrawer }}
          >
            <div className="border-border/50 flex h-14 items-center justify-between border-b px-4">
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Chiudi menu"
                onClick={() => setOpen(false)}
                className="text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline-2"
              >
                <X size={22} />
              </button>
              <Image
                src="/Logo_Orbassano_2K.png"
                alt=""
                width={36}
                height={51}
              />
              <button
                type="button"
                aria-label="Cerca"
                className="text-ink-mid focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline-2"
              >
                <Search size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-4 px-4 py-8" aria-label="Sezioni principali">
              {sidebarMainItems
                .filter((item) => !item.isLogoItem)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-ink-hi hover:text-brand-gold flex items-center justify-between text-5xl leading-none font-black tracking-[0.005em] uppercase transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={28} className="text-ink-low" />
                  </Link>
                ))}
            </nav>

            <div className="border-border/50 mx-4 border-t" aria-hidden />

            <nav className="flex flex-col gap-1 px-2 py-4" aria-label="Sezioni secondarie">
              {sidebarOverflowItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
              <SocialIcons links={socialLinks} iconSize={16} />
            </div>
          </aside>

          <style>{`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  );
}
