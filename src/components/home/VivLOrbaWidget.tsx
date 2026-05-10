"use client";

import Script from "next/script";

/**
 * Wrapper client del custom element Behold (<beholdjs-widget>). Carica
 * la lib widget.js in lazyOnload per non bloccare il first paint.
 *
 * Behold espone `feed-id` come attributo HTML standard sul custom
 * element. Il widget si auto-monta quando lo script e' pronto e
 * trova il tag nel DOM.
 *
 * `suppressHydrationWarning`: il widget Behold sostituisce i children
 * del custom element subito dopo il mount, generando un mismatch tra
 * SSR (vuoto) e DOM client (popolato). Sopprimiamo il warning React
 * per evitare rumore in console — il comportamento e' previsto.
 *
 * In caso di crash interno alla libreria Behold (vedi
 * VivLOrbaWidgetBoundary), il parent mostra <BeholdPlaceholder />.
 */
export function VivLOrbaWidget({ feedId }: { feedId: string }) {
  return (
    <>
      <Script
        src="https://w.behold.so/widget.js"
        strategy="lazyOnload"
        type="module"
      />
      <behold-widget feed-id={feedId} suppressHydrationWarning />
    </>
  );
}
