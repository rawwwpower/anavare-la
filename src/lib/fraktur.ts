import { UnifrakturMaguntia } from "next/font/google";

// The site's one blackletter, for its two display moments: the home page's
// "A" and a vault record's name. Declared once so both use the same face
// file, and imported only by those pages, never by the root layout, so no
// other page ever fetches it.
export const fraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// The size a vault record's name is set at; the home page's large "A" is
// measured against it.
export const FRAKTUR_DISPLAY = "text-[clamp(5rem,24vw,7.5rem)]";
