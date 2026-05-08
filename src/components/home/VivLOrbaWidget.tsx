"use client";

import Script from "next/script";

/**
 * Wrapper client del custom element Behold (<beholdjs-widget>). Carica
 * la lib widget.js in lazyOnload per non bloccare il first paint.
 *
 * Behold espone `feed-id` come attributo HTML standard sul custom
 * element. Il widget si auto-monta quando lo script e' pronto e
 * trova il tag nel DOM.
 */
export function VivLOrbaWidget({ feedId }: { feedId: string }) {
  return (
    <>
      <Script
        src="https://w.behold.so/widget.js"
        strategy="lazyOnload"
        type="module"
      />
      <beholdjs-widget feed-id={feedId} />
    </>
  );
}
