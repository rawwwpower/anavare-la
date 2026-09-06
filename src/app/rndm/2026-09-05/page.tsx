import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

export const metadata: Metadata = {
  title: "nota",
  alternates: { canonical: "/rndm/2026-09-05" },
};

// A note is the one light surface on the site, so the browser chrome flips
// with it here rather than for the whole /rndm section.
export const viewport: Viewport = {
  themeColor: "#fafaf9",
};

export default function Note20260905Page() {
  return (
    <NoteShell
      title="nota"
      titleAria="Nota — 05 de septiembre de 2026"
      artwork={
        <HoverArtwork
          defaultSrc="/toys/sisifo-clean.jpg"
          hoverSrc="/toys/sisifo-hover.jpg"
          width={640}
          height={753}
          alt="Sísifo, Franz von Stuck, 1920"
        />
      }
    >
      <p
        className="reveal max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600"
        style={{ "--reveal-delay": "60ms" } as CSSProperties}
      >
        Agotá el rango de lo posible y de lo imposible.
      </p>
    </NoteShell>
  );
}
