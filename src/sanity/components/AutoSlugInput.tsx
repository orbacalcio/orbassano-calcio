"use client";

import { useEffect } from "react";
import { set, useFormValue, type SlugInputProps } from "sanity";
import { slugifyTitle } from "@/sanity/lib/slugify";

/**
 * Custom input slug per Sanity Studio: auto-popola lo slug dal titolo
 * man mano che l'utente scrive, **senza** dover cliccare "Genera".
 *
 * Comportamento:
 * - Slug vuoto + titolo presente → genera in real-time, ad ogni
 *   keystroke
 * - Slug gia' valorizzato → non tocca (rispetta sia auto-gen
 *   precedente sia edit manuale dell'utente)
 * - Se l'utente cancella lo slug → ricomincia auto-gen dal titolo
 *   corrente (utile per "rigenera dopo cambio titolo")
 *
 * Sotto, renderizza il default Slug input tramite `renderDefault`,
 * cosi' il bottone "Genera" + l'input testuale + la validazione
 * restano disponibili come fallback per l'admin.
 *
 * Wired nello schema news.ts via `components: { input: AutoSlugInput }`.
 */
export function AutoSlugInput(props: SlugInputProps) {
  const title = useFormValue(["title"]) as string | undefined;
  const { value, onChange, renderDefault } = props;

  useEffect(() => {
    const trimmedTitle = title?.trim();
    if (!trimmedTitle) return;
    if (value?.current?.trim()) return;
    const generated = slugifyTitle(trimmedTitle);
    if (!generated) return;
    onChange(set({ _type: "slug", current: generated }));
  }, [title, value, onChange]);

  return renderDefault(props);
}
