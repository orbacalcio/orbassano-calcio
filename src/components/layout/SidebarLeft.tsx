"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useHomeLogoClick } from "@/lib/use-home-logo-click";
import { Z } from "@/lib/z-indexes";
import {
  sidebarMainItems,
  sidebarMoreIcon as MoreIcon,
  type SidebarItem,
} from "./SidebarLeft.items";

/**
 * Sidebar sinistra desktop (≥ lg, 88px width, fixed full-height).
 *
 * Visibilita' gestita da ClientShell via opacity + pointer-events:
 * mostrata solo quando l'hero e' nel viewport. Quando si scrolla oltre,
 * la Topbar in modalita' scrolled la sostituisce. Estetica sempre
 * trasparente (bg-surface-0/55 + backdrop-blur), tarata per stare
 * sopra le foto dell'hero.
 *
 * Voci: 6 (logo home + 4 sezioni + ALTRO). ALTRO non e' piu' un
 * popover laterale: apre il NavigationDrawer hamburger full-screen
 * (pattern juventus.com), che mostra le 4 sezioni accordion + i
 * quick-link secondari (Biglietteria, Newsletter, 5×1000, Contatti).
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
            active ? "text-brand-gold" : "text-ink-hi group-hover:text-brand-gold",
          )}
          aria-hidden
        />
      ) : null}
      {item.microlabel && (
        <span
          // Posizionata absolute sotto l'icona (top-full + mt-1.5),
          // centrata orizzontalmente, whitespace-nowrap cosi' label
          // lunghe (SOCIETÀ, GALLERY) non vanno a capo nella sidebar
          // stretta 88px. Opacity 0 di default → opacity 100 su hover
          // del Link parent (group). Niente layout shift: in stato
          // normale si vedono solo le icone (juve-style). La rotta
          // attiva e' indicata dal bar oro a sinistra, non dal label.
          className="font-display text-brand-gold pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 text-[11px] font-bold tracking-[0.12em] whitespace-nowrap uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          {item.microlabel}
        </span>
      )}
    </Link>
  );
}

function MoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Apri menu completo"
      aria-controls="navigation-drawer"
      onClick={onClick}
      className="group focus-visible:outline-brand-gold relative flex flex-col items-center gap-1.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <MoreIcon
        size={28}
        className="text-ink-hi group-hover:text-brand-gold transition-colors"
        aria-hidden
      />
      {/* Label "ALTRO" stesso pattern degli altri item: absolute sotto
          l'icona, opacity 0 di default → 100 su hover. Niente layout
          shift, normal state mostra solo l'icona dei 3 puntini. */}
      <span
        className="font-display text-brand-gold pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 text-[11px] font-bold tracking-[0.12em] whitespace-nowrap uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        ALTRO
      </span>
    </button>
  );
}

export function SidebarLeft({ onMoreClick }: { onMoreClick: () => void }) {
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
          <MoreButton onClick={onMoreClick} />
        </li>
      </ul>
    </nav>
  );
}
