import {
  Building2,
  Handshake,
  HeartHandshake,
  Images,
  Mail,
  MoreHorizontal,
  Newspaper,
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
 * Ordine: Sponsor → 5×1000 → Contatti. Calendario e' stata promossa a
 * main accordion del drawer (con sottomenu per categoria) 2026-05-17,
 * quindi qui non c'e' piu'. Newsletter idem rimossa (richiesta utente):
 * il box newsletter in fondo a ogni pagina basta come call-to-subscribe.
 *
 * Biglietteria rimossa dal main menu 2026-05-21 (richiesta utente):
 * resta accessibile come sotto-pagina dell'accordion Societa' del
 * drawer e dalla hub /societa, non piu' come quick-link prominente.
 *
 * Impianti sportivi NON e' qui: vive solo dentro l'accordion Societa'
 * del drawer (e' un sotto-link logico della sezione).
 * Privacy & Cookie NON e' qui: vive solo in footer.
 */
export const sidebarOverflowItems: SidebarItem[] = [
  { href: "/sponsor", label: "Sponsor", icon: Handshake },
  { href: "/5x1000", label: "5×1000", icon: HeartHandshake },
  { href: "/contatti", label: "Contatti", icon: Mail },
];

export const sidebarMoreIcon = MoreHorizontal;
