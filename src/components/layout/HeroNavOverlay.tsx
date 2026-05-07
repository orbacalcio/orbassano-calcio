import Link from "next/link";
import { sidebarMainItems } from "./SidebarLeft.items";

/**
 * Mobile (<lg): voci nav stampate in Big Shoulders gigante al centro
 * verticale dell'hero. Pattern preso da juventus.com mobile.
 *
 * 5 voci totali: NEWS · SQUADRE · SOCIETÀ · SPONSOR · ALTRO.
 * Tutte cliccabili: ALTRO porta alla sezione contatti, le altre alle
 * rispettive route. Drop-shadow per leggibilita' su qualsiasi sfondo.
 */
const ALTRO_HREF = "/contatti";

export function HeroNavOverlay() {
  const main = sidebarMainItems.filter((i) => !i.isLogoItem);
  const items = [
    ...main,
    { href: ALTRO_HREF, label: "Altro" },
  ];

  return (
    <nav
      aria-label="Navigazione principale (mobile, sopra hero)"
      className="lg:hidden"
    >
      <ul className="flex flex-col items-center gap-2 text-center sm:gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-display text-ink-hi text-5xl leading-[0.9] font-black tracking-[0.005em] uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] transition-colors hover:text-brand-gold sm:text-6xl"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
