import localFont from "next/font/local";

// Its own module, apart from src/lib/fraktur.ts: Next preloads every font
// declared in a module a page imports, so sharing a file with the full face
// would put all 22KB of it on the home page and the /rndm index.
// The same face for the site's blackletter titles, the home page's "A" and
// the section names ("rndm", "wrk"): a cut holding "A" and the lowercase
// alphabet, 5.8KB instead of the full 22KB file, so no page pays for the
// whole face, and a section can be renamed without re-cutting it. `block`
// because it is tiny and preloaded — it lands with the first paint, and a
// fallback flashing in for a title of a few decorative letters would only
// show the wrong ones. A title needing another capital must be re-cut:
// fontTools subset of the full face (what next/font/google downloads for
// src/lib/fraktur.ts) with --text= the letters.
export const frakturTitles = localFont({
  src: "../app/fonts/UnifrakturMaguntia-titles.woff2",
  display: "block",
  adjustFontFallback: false,
});

// Both titles at 24px on the 24px line every page title keeps, so the
// heading block, and the grid under it, never move. A touch above the sans
// titles' 20px, since this face's small eye reads smaller.
export const FRAKTUR_TITLE = "text-2xl leading-6";
