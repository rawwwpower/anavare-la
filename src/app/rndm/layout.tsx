import { Geist_Mono } from "next/font/google";

// Scoped to /rndm instead of the root layout: it's the only part of the
// site that ever uses font-mono, so this keeps its ~80KB of font files off
// every other page's preload list.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// No colours and no theme-colour here on purpose. The index is the site's
// dark ground, the same as the home page it belongs to; a note is a light
// sheet lying on top of it. Each page owns its own surface (NoteShell's
// `tone`), which is exactly what lets a note slide away and reveal the index
// underneath. data-rndm marks the section for the overscroll rule in
// globals.css.
export default function RndmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-rndm className={`${geistMono.variable} flex min-h-svh flex-col`}>
      {children}
    </div>
  );
}
