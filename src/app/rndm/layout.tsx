import { RndmStage } from "@/components/rndm-stage";
import { geistMono } from "@/lib/mono";

// No colours and no theme-colour here on purpose. The index is the site's
// dark ground, the same as the home page it belongs to; a note is a light
// sheet lying on top of it. Each page owns its own surface (NoteShell's
// `tone`), which is exactly what lets a note slide away and reveal the index
// underneath. data-rndm marks the section for the overscroll rule in
// globals.css.
//
// `sheet` is a parallel slot: a note opened from the index is intercepted
// into it and rendered over the index instead of replacing it. RndmStage
// arranges the two.
export default function RndmLayout({
  children,
  sheet,
}: Readonly<{
  children: React.ReactNode;
  sheet: React.ReactNode;
}>) {
  return (
    <div data-rndm className={`${geistMono.variable} flex min-h-svh flex-col`}>
      <RndmStage sheet={sheet}>{children}</RndmStage>
    </div>
  );
}
