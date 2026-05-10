"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Z } from "@/lib/z-indexes";
import { useHomeLogoClick } from "@/lib/use-home-logo-click";
import { MainSponsorTile } from "@/components/sponsors/MainSponsorTile";
import type { MainSponsor } from "@/sanity/fetchers";
import { sidebarMainItems } from "./SidebarLeft.items";

/**
 * Topbar orizzontale "scrolled" (128px, lg+ only).
 *
 * Si attiva quando l'utente scrolla oltre l'hero (heroVisible == false
 * controllato da ClientShell). Layout completo: hamburger + 4 voci nav
 * principali + spacer + logo centrato (absolute) + box sponsor + divider
 * + search. Sostituisce sidebar verticali + Topbar minimale. Stessa
 * altezza della Topbar hero per coerenza durante la transizione e per
 * ospitare i tile main sponsor 280×112 (logo +70% vs marquee in basso).
 *
 * Mobile (<lg): nascosta. Su mobile la topbar mobile (44px) resta
 * sempre la stessa, con o senza hero in viewport.
 */
const FALLBACK_MAIN_SPONSORS = [
  { name: "Studio Cambareri" },
  { name: "Reale Mutua" },
  { name: "Ocert" },
];

export function TopbarScrolled({
  sponsors,
  onMenuClick,
  onSearchClick,
}: {
  sponsors: MainSponsor[];
  onMenuClick: () => void;
  onSearchClick: () => void;
}) {
  const navItems = sidebarMainItems.filter((i) => !i.isLogoItem);
  const usingFallback = sponsors.length === 0;
  const onLogoClick = useHomeLogoClick();

  return (
    <header
      className="bg-surface-0 border-border/60 fixed inset-x-0 top-0 hidden h-32 items-center border-b lg:flex"
      style={{ zIndex: Z.topbar }}
      role="banner"
      aria-label="Barra di navigazione"
    >
      <div className="relative flex w-full items-center px-8">
        {/* Sx: hamburger + voci nav */}
        <div className="flex items-center gap-7">
          <button
            type="button"
            aria-label="Apri menu completo"
            aria-controls="navigation-drawer"
            onClick={onMenuClick}
            className="text-ink-hi hover:text-brand-gold focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-2"
          >
            <Menu size={26} />
          </button>
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-display text-ink-hi hover:text-brand-gold text-sm font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Center (absolute): logo */}
        <Link
          href="/"
          onClick={onLogoClick}
          aria-label="ASD Orbassano Calcio - Home"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Image
            src="/Logo_Orbassano_2K.png"
            alt=""
            width={32}
            height={45}
            priority
          />
        </Link>

        {/* Dx: sponsor + search */}
        <div className="ml-auto flex items-center gap-4">
          {usingFallback ? (
            <ul className="border-border/60 bg-surface-1/60 divide-border/60 hidden h-28 items-center divide-x overflow-hidden rounded-md border xl:flex">
              {FALLBACK_MAIN_SPONSORS.map((s) => (
                <li
                  key={s.name}
                  className="font-display text-ink-mid flex h-full items-center px-6 text-[13px] font-semibold tracking-[0.15em] uppercase"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="border-border/60 divide-border/60 hidden h-28 items-center divide-x overflow-hidden rounded-md border xl:flex">
              {sponsors.map((s) => (
                <MainSponsorTile key={s._id} sponsor={s} />
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Cerca nel sito"
            className="text-ink-mid hover:text-ink-hi focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Search size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
