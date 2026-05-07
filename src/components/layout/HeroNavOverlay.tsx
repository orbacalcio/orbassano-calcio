import Link from "next/link";
import { sidebarMainItems } from "./SidebarLeft.items";

/**
 * Mobile (<lg): voci nav stampate in Big Shoulders gigante al centro
 * verticale dell'hero. Pattern preso da juventus.com mobile.
 *
 * Le voci sono cliccabili. Spariscono con l'hero quando l'utente
 * scrolla.
 */
export function HeroNavOverlay() {
  const items = sidebarMainItems.filter((i) => !i.isLogoItem);
  return (
    <nav
      aria-label="Navigazione principale (mobile, sopra hero)"
      className="lg:hidden"
    >
      <ul className="flex flex-col items-center gap-3 text-center">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-display text-ink-hi text-6xl leading-none font-extrabold tracking-[0.01em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-7xl"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
