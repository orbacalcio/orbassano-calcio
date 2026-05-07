import { Studio } from "./Studio";

/**
 * Sanity Studio embedded sulla rotta /studio.
 * Lo Studio NON deve essere indicizzato dai motori di ricerca: lo
 * blocchiamo qui via metadata e in robots.txt (M7).
 */

export { metadata, viewport } from "next-sanity/studio";

// Lo Studio e' totalmente client-side: niente prerender. force-dynamic
// evita il "ReferenceError: window is not defined" durante SSR build.
export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <Studio />;
}
