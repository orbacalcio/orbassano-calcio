"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Z } from "@/lib/z-indexes";
import { cn } from "@/lib/cn";
import type { MainSponsor } from "@/sanity/fetchers";
import { sidebarMainItems } from "./SidebarLeft.items";

/**
 * Topbar orizzontale "scrolled" (64px, lg+ only).
 *
 * Si attiva quando l'utente scrolla oltre l'hero (heroVisible == false
 * controllato da ClientShell). Layout completo: hamburger + 4 voci nav
 * principali + spacer + logo centrato (absolute) + box sponsor + divider
 * + search. Sostituisce sidebar verticali + Topbar minimale.
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
}: {
  sponsors: MainSponsor[];
  onMenuClick: () => void;
}) {
  const navItems = sidebarMainItems.filter((i) => !i.isLogoItem);
  const usingFallback = sponsors.length === 0;

  return (
    <header
      className="bg-surface-0 border-border/60 fixed inset-x-0 top-0 hidden h-16 items-center border-b lg:flex"
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

        {/* Dx: sponsor + divider + search */}
        <div className="ml-auto flex items-center gap-4">
          {usingFallback ? (
            <ul className="border-border/60 bg-surface-1/60 divide-border/60 hidden h-7 items-center divide-x overflow-hidden rounded-md border xl:flex">
              {FALLBACK_MAIN_SPONSORS.map((s) => (
                <li
                  key={s.name}
                  className="font-display text-ink-mid flex h-full items-center px-3 text-[11px] font-semibold tracking-[0.15em] uppercase"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="border-border/60 bg-surface-1/60 divide-border/60 hidden h-7 items-center divide-x overflow-hidden rounded-md border xl:flex">
              {sponsors.map((s) => {
                const src = s.logoMonochrome ?? s.logo;
                if (!s.website) return null;
                return (
                  <li
                    key={s._id}
                    className="flex h-full items-center px-3"
                  >
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.name} (sponsor principale)`}
                      className="opacity-70 transition-opacity hover:opacity-100"
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={s.name}
                          width={100}
                          height={20}
                          className="h-5 w-auto object-contain"
                          style={
                            s.logoMonochrome
                              ? undefined
                              : { filter: "brightness(0) invert(1)" }
                          }
                        />
                      ) : (
                        <span className="font-display text-ink-mid text-[11px] font-semibold tracking-[0.15em] uppercase">
                          {s.name}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          <div aria-hidden className={cn("bg-border hidden h-5 w-px xl:block")} />
          <button
            type="button"
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
