"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useHomeLogoClick } from "@/lib/use-home-logo-click";
import { Z } from "@/lib/z-indexes";
import {
  sidebarMainItems,
  sidebarMoreIcon as MoreIcon,
  sidebarOverflowItems,
  type SidebarItem,
} from "./SidebarLeft.items";

/**
 * Sidebar sinistra desktop (≥ lg, 88px width, fixed full-height).
 *
 * Visibilita' gestita da ClientShell via opacity + pointer-events:
 * mostrata solo quando l'hero e' nel viewport. Quando si scrolla oltre,
 * la TopbarScrolled la sostituisce. Estetica sempre trasparente
 * (bg-surface-0/55 + backdrop-blur), tarata per stare sopra le foto
 * dell'hero.
 *
 * Voci: 6 (logo home + 4 sezioni + ALTRO popover).
 */

function SidebarItemLink({
  item,
  active,
}: {
  item: SidebarItem;
  active: boolean;
}) {
  const Icon = item.icon;
  const onLogoClick = useHomeLogoClick();
  return (
    <Link
      href={item.href}
      onClick={item.isLogoItem ? onLogoClick : undefined}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group focus-visible:outline-brand-gold relative flex flex-col items-center gap-1.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-4",
      )}
    >
      {/* Indicator verticale dorato sulla rotta corrente — NON sul logo home,
          dove apparirebbe come una barra fantasma a sinistra dello stemma. */}
      {active && !item.isLogoItem && (
        <span
          aria-hidden
          className="bg-brand-gold absolute -left-[14px] h-8 w-[2px]"
        />
      )}
      {item.isLogoItem ? (
        <Image
          src="/Logo_Orbassano_2K.png"
          alt=""
          width={56}
          height={79}
          priority
        />
      ) : Icon ? (
        <Icon
          size={28}
          className={cn(
            "transition-colors",
            active ? "text-brand-gold" : "text-ink-mid group-hover:text-ink-hi",
          )}
          aria-hidden
        />
      ) : null}
      {item.microlabel && (
        <span
          className={cn(
            "font-display text-[11px] font-bold tracking-[0.12em] uppercase transition-colors",
            active ? "text-brand-gold" : "text-ink-mid group-hover:text-ink-hi",
          )}
        >
          {item.microlabel}
        </span>
      )}
    </Link>
  );
}

function MoreButton() {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Altre sezioni"
        onClick={() => setOpen((o) => !o)}
        className="group focus-visible:outline-brand-gold flex flex-col items-center gap-1.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <MoreIcon
          size={28}
          className={cn(
            "transition-colors",
            open ? "text-brand-gold" : "text-ink-mid group-hover:text-ink-hi",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "font-display text-[11px] font-bold tracking-[0.12em] uppercase transition-colors",
            open ? "text-brand-gold" : "text-ink-mid group-hover:text-ink-hi",
          )}
        >
          ALTRO
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="border-border bg-surface-1/95 absolute top-0 left-[88px] w-56 rounded-r-2xl border p-2 shadow-2xl backdrop-blur-md"
          style={{ zIndex: Z.tooltipPopover }}
        >
          <ul className="flex flex-col">
            {sidebarOverflowItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="text-ink-mid hover:bg-surface-2 hover:text-ink-hi focus-visible:outline-brand-gold flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    {Icon && <Icon size={16} aria-hidden />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SidebarLeft() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigazione principale"
      className="bg-surface-0/55 fixed top-0 left-0 hidden h-screen w-[88px] flex-col items-center pt-[60px] pb-6 backdrop-blur-md lg:flex"
      style={{ zIndex: Z.sidebar }}
    >
      <ul className="flex flex-1 flex-col items-center gap-9">
        {sidebarMainItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <SidebarItemLink item={item} active={active} />
            </li>
          );
        })}
        <li>
          <MoreButton />
        </li>
      </ul>
    </nav>
  );
}
