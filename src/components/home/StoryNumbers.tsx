import { StoryNumbersGrid } from "@/components/home/StoryNumbersGrid";
import {
  fetchStoryNumbers,
  type StoryNumberItem,
} from "@/sanity/fetchers";

/**
 * "Storia in numeri" — server async che fetcha eyebrow, titolo e items
 * dal singleton settings di Sanity. Se il CMS non ha ancora popolato
 * il box (caso tipico dopo il deploy iniziale, prima del seed) usa i
 * fallback editoriali sotto.
 *
 * Counter animation + layout vivono in `StoryNumbersGrid` (client).
 * Questa separazione mantiene il fetch sul server (zero JS speso per
 * recuperare i dati) e isola lo "use client" alla sola animazione.
 */
const FALLBACK_EYEBROW = "Storia in numeri";
const FALLBACK_TITLE = "La storia rossoblù";

const FALLBACK_ITEMS: StoryNumberItem[] = [
  {
    value: 95,
    prefix: "+",
    suffix: null,
    label: "Anni di rossoblù",
    caption: "Dal 1930 al campo, senza fermarsi davvero mai.",
  },
  {
    value: 23,
    prefix: null,
    suffix: null,
    label: "Atleti prima squadra",
    caption:
      "La rosa di riferimento dell'ultima stagione completa, in attesa dei nuovi tesseramenti 2026/27.",
  },
  {
    value: 120,
    prefix: null,
    suffix: "+",
    label: "Giovani nel settore",
    caption: "Quattro categorie dall'Under 14 all'Under 17.",
  },
  {
    value: 9,
    prefix: null,
    suffix: null,
    label: "Partecipazioni Serie D",
    caption: "Dagli anni '80 fino alle semifinali playoff 2005-07.",
  },
];

export async function StoryNumbers() {
  const data = await fetchStoryNumbers();
  const eyebrow = data.eyebrow ?? FALLBACK_EYEBROW;
  const title = data.title ?? FALLBACK_TITLE;
  const items = data.items.length > 0 ? data.items : FALLBACK_ITEMS;

  return <StoryNumbersGrid eyebrow={eyebrow} title={title} items={items} />;
}
