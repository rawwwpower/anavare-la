import { Geist_Mono } from "next/font/google";

// Scoped to /rndm instead of the root layout: it's the only part of the
// site that ever uses font-mono, so this keeps its ~80KB of font files off
// every other page's preload list.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RndmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={geistMono.variable}>{children}</div>;
}
