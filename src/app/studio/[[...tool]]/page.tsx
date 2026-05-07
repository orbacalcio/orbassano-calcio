"use client";

import dynamic from "next/dynamic";

/**
 * Sanity Studio embedded sulla rotta /studio.
 *
 * `ssr: false` in next/dynamic disabilita il rendering server-side: lo
 * Studio Sanity usa window/document/indexedDB al top-level dei suoi
 * moduli, e SSR produrrebbe `ReferenceError: window is not defined`.
 *
 * La metadata (noindex/viewport) per la rotta vive in
 * src/app/studio/layout.tsx perche' una "use client" page non puo'
 * esportare metadata.
 */
const SanityStudio = dynamic(() => import("@/sanity/Studio"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a1428",
        color: "#a8b5cc",
        fontFamily: "Inter, sans-serif",
        fontSize: "0.875rem",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      Caricamento Studio…
    </div>
  ),
});

export default function StudioPage() {
  return <SanityStudio />;
}
