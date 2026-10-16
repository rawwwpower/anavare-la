import { UnifrakturMaguntia } from "next/font/google";

// The site's one blackletter, for a vault record's name. (The home page's
// "A" uses a one-glyph cut of this same face — see src/app/page.tsx.)
// Imported only where it's used, never by the root layout, so no other page
// ever fetches it.
export const fraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
