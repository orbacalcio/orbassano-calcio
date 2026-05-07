"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../sanity.config";

/**
 * Wrapper client-only di NextStudio. Caricato via next/dynamic con
 * ssr:false dalla rotta /studio per evitare il `ReferenceError: window
 * is not defined` durante SSR — lo Studio Sanity usa hooks browser-only
 * (window, indexedDB, document) al top-level dei suoi moduli.
 */
export default function Studio() {
  return <NextStudio config={config} />;
}
