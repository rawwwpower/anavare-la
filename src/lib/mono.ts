import { Geist_Mono } from "next/font/google";

// The site's monospace, for data only: dates and places, a record's ficha.
// (The home page's "designer" uses a cut of just those letters — see
// src/app/page.tsx.) Imported only where it's used, never by the root
// layout, so other pages never preload it.
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
