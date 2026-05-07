/**
 * Breakpoint sincronizzati con i default Tailwind.
 * Servono in JS/JSX per IntersectionObserver, matchMedia, e logiche
 * che non possono essere risolte solo con classi CSS.
 */
export const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BP;
