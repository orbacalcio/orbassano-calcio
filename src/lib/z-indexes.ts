/**
 * Mappa centrale degli z-index, evita magic numbers nelle classi.
 * Vedi docs/LAYOUT_NAVIGATION.md §6 per la giustificazione di ogni layer.
 */
export const Z = {
  content: 0,
  floatingActions: 10,
  internalSticky: 20,
  tooltipPopover: 30,
  mobileSponsorStrip: 40,
  sidebar: 50,
  topbar: 60,
  mobileDrawer: 70,
  toast: 80,
  cookieBanner: 90,
  modal: 100,
} as const;

export type ZLayer = keyof typeof Z;
