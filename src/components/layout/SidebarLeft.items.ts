import {
  Building2,
  CalendarDays,
  Handshake,
  HeartHandshake,
  Images,
  Mail,
  MoreHorizontal,
  Newspaper,
  Newspaper as NewsletterIcon,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SidebarItem = {
  href: string;
  label: string;
  microlabel?: string;
  icon?: LucideIcon;
  /** se true, l'item usa il logo del club anziche' un'icona */
  isLogoItem?: boolean;
};

/**
 * Voci della sidebar sinistra desktop.
 * 4 sezioni principali in ordine fissato: News · Squadre · Gallery ·
 * Società. Sopra c'e' il logo (home). Sotto c'e' "Altro" che apre il
 * popover con le voci secondarie (Calendario, Sponsor, quick-links).
 *
 * Sponsor NON sta qui: e' stato spostato nelle voci secondarie (vedi
 * sidebarOverflowItems) sotto Calendario, come richiesto.
 */
export const sidebarMainItems: SidebarItem[] = [
  { href: "/", label: "Home", isLogoItem: true },
  { href: "/news", label: "News", microlabel: "NEWS", icon: Newspaper },
  { href: "/squadre", label: "Squadre", microlabel: "SQUADRE", icon: Users },
  { href: "/gallery", label: "Gallery", microlabel: "GALLERY", icon: Images },
  {
    href: "/societa",
    label: "Società",
    microlabel: "SOCIETÀ",
    icon: Building2,
  },
];

/**
 * Voci secondarie quick-link mostrate in fondo al NavigationDrawer
 * (drawer hamburger aperto da SidebarLeft "ALTRO" o da MobileTopbar).
 *
 * Ordine: Calendario → Sponsor → Biglietteria → Newsletter → 5×1000 →
 * Contatti. Calendario e Sponsor sono usciti dalle 4 voci main e
 * vivono qui come quick-link top-level.
 *
 * Impianti sportivi NON e' qui: vive solo dentro l'accordion Societa'
 * del drawer (e' un sotto-link logico della sezione).
 * Privacy & Cookie NON e' qui: vive solo in footer.
 */
export const sidebarOverflowItems: SidebarItem[] = [
  // Calendario punta al calendario completo della Prima Squadra
  // (l'unica route /calendario esistente e' figlia di /squadre/[slug]).
  // Per il calendario delle squadre giovanili l'utente passa da
  // /squadre → singola squadra → calendario.
  {
    href: "/squadre/prima-squadra/calendario",
    label: "Calendario",
    icon: CalendarDays,
  },
  { href: "/sponsor", label: "Sponsor", icon: Handshake },
  { href: "/societa/biglietteria", label: "Biglietteria", icon: Ticket },
  { href: "/newsletter", label: "Newsletter", icon: NewsletterIcon },
  { href: "/5x1000", label: "5×1000", icon: HeartHandshake },
  { href: "/contatti", label: "Contatti", icon: Mail },
];

export const sidebarMoreIcon = MoreHorizontal;
