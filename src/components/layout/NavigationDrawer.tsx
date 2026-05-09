"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { SocialIcons, type SocialLinks } from "@/components/social/SocialIcons";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z-indexes";
import {
  sidebarMainItems,
  sidebarOverflowItems,
} from "./SidebarLeft.items";

/**
 * Drawer di navigazione full-screen aperto via hamburger.
 *
 * Riusato da:
 * - MobileShell (mobile <lg, drawer 88vw)
 * - TopbarScrolled (desktop ≥lg scrollato oltre hero, stesso pattern)
 *
 * Pattern: slide da sinistra 250ms, focus trap, ESC dismiss,
 * click-outside dismiss, body scroll lock mentre aperto.
 */
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
  socialLinks = FALLBACK_LINKS,
}: {
  open: boolean;
  onClose: () => void;
  socialLinks?: SocialLinks;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
          <span aria-hidden className="h-9 w-9" />
        </div>

        <nav
          className="flex flex-col gap-4 px-4 py-8"
          aria-label="Sezioni principali"
        >
          {sidebarMainItems
            .filter((item) => !item.isLogoItem)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="font-display text-ink-hi hover:text-brand-gold flex items-center justify-between text-5xl leading-none font-black tracking-[0.005em] uppercase transition-colors"
              >
                <span>{item.label}</span>
                <ChevronRight size={28} className="text-ink-low" />
              </Link>
            ))}
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
