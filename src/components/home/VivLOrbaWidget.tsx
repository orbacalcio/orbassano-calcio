"use client";

import { useEffect } from "react";
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
 *
 * Filtro errori window-level: l'Error Boundary React intercetta gli
 * errori del rendering ma non quelli lanciati da codice di terze parti
 * a livello window (event 'error', 'unhandledrejection'). Next.js dev
 * overlay cattura quelli e li mostra all'utente anche se il boundary
 * ha gia' fatto fallback. Installiamo un listener mirato che fa
 * preventDefault SOLO sull'errore Behold specifico
 * ('beholdReplaceChildren' + script w.behold.so) — niente
 * silenziamento generico, solo questa firma. Cleanup al unmount.
 */
const BEHOLD_ERROR_SIGNATURES = ["beholdReplaceChildren", "w.behold.so"];

function isBeholdError(...parts: Array<unknown>): boolean {
  const sig = parts.map((p) => String(p ?? "")).join(" ");
  return BEHOLD_ERROR_SIGNATURES.some((s) => sig.includes(s));
}

export function VivLOrbaWidget({ feedId }: { feedId: string }) {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isBeholdError(event.message, event.filename, event.error?.stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = reason instanceof Error ? reason.message : reason;
      const stack = reason instanceof Error ? reason.stack : undefined;
      if (isBeholdError(msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
    };
  }, []);

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
