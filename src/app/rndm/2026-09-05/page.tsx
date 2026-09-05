import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

export const metadata: Metadata = {
  title: "nota",
  alternates: { canonical: "/rndm/2026-09-05" },
};

export default function Note20260905Page() {
  return (
    <main className="flex flex-1 flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]">
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
    </main>
  );
}
