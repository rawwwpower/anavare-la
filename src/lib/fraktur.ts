import { UnifrakturMaguntia } from "next/font/google";

// The site's one blackletter, for a vault record's name. (The home page's
// "A" and the /rndm index's title use a cut of this same face holding just
// their letters — see src/lib/fraktur-titles.ts.)
// Imported only where it's used, never by the root layout, so no other page
// ever fetches it.
export const fraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
