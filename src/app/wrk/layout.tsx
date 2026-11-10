import { RndmStage } from "@/components/rndm-stage";
import { geistMono } from "@/lib/mono";

// /wrk works the way /rndm does (Ana, November 2026): a dark index, and each
// project a sheet lying on it, through an intercepted route in the `sheet`
// slot. Same stage, same marker for the overscroll rule in globals.css.
export default function WrkLayout({
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
