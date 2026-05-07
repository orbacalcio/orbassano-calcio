"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Z } from "@/lib/z-indexes";

/**
 * Topbar mobile (44px sticky, solo <lg). Contiene:
 * - Hamburger sx (apre il NavigationDrawer condiviso col desktop scrolled)
 * - Logo centrato
 * - Spacer destro per simmetria visiva
 *
 * La logica di apertura/chiusura del drawer vive nel ClientShell padre,
 * che la condivide con TopbarScrolled. Qui passiamo solo onMenuClick.
 *
 * Search e' stata rimossa dalla topbar mobile (M3 fix originale): vive
 * solo dentro al drawer aperto.
 */
export function MobileTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header
      className="border-border/50 bg-surface-0/80 fixed inset-x-0 top-0 flex h-11 items-center justify-between border-b px-3 backdrop-blur-md lg:hidden"
      style={{ zIndex: Z.topbar }}
      role="banner"
    >
      <button
        type="button"
        aria-label="Apri menu"
        aria-controls="navigation-drawer"
        onClick={onMenuClick}
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
      <span aria-hidden className="h-9 w-9" />
    </header>
  );
}
