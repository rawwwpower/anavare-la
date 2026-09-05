import type { Viewport } from "next";
import { Geist_Mono } from "next/font/google";

// Scoped to /rndm instead of the root layout: it's the only part of the
// site that ever uses font-mono, so this keeps its ~80KB of font files off
// every other page's preload list.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// /rndm inverts the site: light page, dark text. Declaring it here means
// mobile browser chrome flips with it instead of staying dark above a white
// page, and the colours live in one place rather than on every note's main.
export const viewport: Viewport = {
  themeColor: "#fafaf9",
};

export default function RndmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${geistMono.variable} flex min-h-svh flex-col`}
      style={{ background: "var(--foreground)", color: "var(--background)" }}
    >
      {children}
    </div>
  );
}
