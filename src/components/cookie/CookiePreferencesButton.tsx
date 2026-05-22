"use client";

/**
 * Pulsante "Preferenze cookie" che riapre il banner consensi. Usato nel
 * footer (colonna Legale, solo su mobile dove il bottone flottante è
 * nascosto). Dispatcha un evento custom su window che il CookieBanner
 * ascolta per tornare allo stato "banner".
 */
export function CookiePreferencesButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("orba:open-cookie-preferences"))
      }
      className={className}
    >
      Preferenze cookie
    </button>
  );
}
