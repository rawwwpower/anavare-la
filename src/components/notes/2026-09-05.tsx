import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

// See the note beside this one: the content lives here so a deep link and a
// sheet opened from the index render exactly the same thing.
export const notaMetadata: Metadata = {
  title: "Sísifo",
  alternates: { canonical: "/rndm/2026-09-05" },
};

export function NotaNote() {
  return (
    <NoteShell
      title="Sísifo"
      titleAria="Sísifo — 05 de septiembre de 2026"
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
        className="reveal max-w-md text-base leading-relaxed text-zinc-600"
        style={{ "--reveal-delay": "60ms" } as CSSProperties}
      >
        Agotá el rango de lo posible y de lo imposible.
      </p>
    </NoteShell>
  );
}
