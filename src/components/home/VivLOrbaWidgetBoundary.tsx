"use client";

import { Component, type ReactNode } from "react";

/**
 * Error boundary attorno al widget Behold (<beholdjs-widget>).
 *
 * Behold e' uno script di terze parti che inietta DOM custom-element
 * dopo il mount React. In dev mode con Strict Mode + Turbopack HMR il
 * widget puo' crashare con TypeError "Cannot read properties of
 * undefined (reading 'beholdReplaceChildren')" quando i cicli mount/
 * unmount/remount avvengono troppo rapidamente.
 *
 * Il crash e' nel codice di Behold, non nel nostro: non possiamo
 * ripararlo a monte. Questo boundary intercetta l'errore e mostra il
 * fallback (di solito <BeholdPlaceholder /> con la grid editoriale)
 * cosi' la pagina resta navigabile.
 *
 * In produzione (build statica + niente HMR) il bug Behold e' molto
 * meno frequente. Il boundary e' difesa extra a costo zero.
 *
 * Nota M9: piano di refactor a fetch JSON custom (vedi memoria
 * project_vivlorba_json_upgrade) elimina questa dipendenza.
 */
type Props = {
  children: ReactNode;
  fallback: ReactNode;
};

type State = {
  hasError: boolean;
};

export class VivLOrbaWidgetBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[VivLOrbaWidgetBoundary] Widget Behold crashato, fallback al placeholder:",
        error.message,
      );
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
