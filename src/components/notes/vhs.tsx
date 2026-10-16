import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

// The note itself, held apart from any one route so it can be rendered both
// as its own page (a deep link, where there is no index underneath) and as a
// sheet lying on the index (opened from /rndm). Same note either way — only
// the layer it arrives on differs.
export const vhsMetadata: Metadata = {
  title: "vhs",
  alternates: { canonical: "/rndm/vhs" },
};

export function VhsNote() {
  return (
    <NoteShell
      title="vhs"
      titleAria="Vhs — Indiana Jones y los Cazadores del Arca Perdida"
      artwork={
        <HoverArtwork
          defaultSrc="/toys/sopa-de-cerebro-de-mono.jpg"
          width={480}
          height={713}
          alt="Indiana Jones y los Cazadores del Arca Perdida, póster"
        />
      }
    >
      <p
        className="reveal max-w-md text-base leading-relaxed text-zinc-600"
        style={{ "--reveal-delay": "60ms" } as CSSProperties}
      >
        Indiana Jones y los Cazadores del Arca Perdida.
      </p>
    </NoteShell>
  );
}
