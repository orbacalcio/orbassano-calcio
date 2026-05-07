import {
  Building2,
  Handshake,
  HeartHandshake,
  Mail,
  MapPin,
  MoreHorizontal,
  Newspaper,
  Newspaper as NewsletterIcon,
  ScrollText,
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
 * 6 elementi totali: logo (home), 4 sezioni principali, "Altro" che
 * apre un popover con le voci secondarie.
 */
export const sidebarMainItems: SidebarItem[] = [
  { href: "/", label: "Home", isLogoItem: true },
  { href: "/news", label: "News", microlabel: "NEWS", icon: Newspaper },
  { href: "/squadre", label: "Squadre", microlabel: "SQUADRE", icon: Users },
  {
    href: "/societa",
    label: "Società",
    microlabel: "SOCIETÀ",
    icon: Building2,
  },
  {
    href: "/sponsor",
    label: "Sponsor",
    microlabel: "SPONSOR",
    icon: Handshake,
  },
];

/**
 * Voci che vivono nel popover "Altro" (icona MoreHorizontal in sidebar).
 */
export const sidebarOverflowItems: SidebarItem[] = [
  { href: "/societa/biglietteria", label: "Biglietteria", icon: Ticket },
  { href: "/newsletter", label: "Newsletter", icon: NewsletterIcon },
  { href: "/5x1000", label: "5×1000", icon: HeartHandshake },
  { href: "/contatti", label: "Contatti", icon: Mail },
  { href: "/societa/impianti", label: "Impianti sportivi", icon: MapPin },
  { href: "/legal/privacy", label: "Privacy & Cookie", icon: ScrollText },
];

export const sidebarMoreIcon = MoreHorizontal;
