import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

export const metadata: Metadata = {
  title: "vhs",
  alternates: { canonical: "/rndm/vhs" },
};

export default function NoteVhsPage() {
  return (
    <main className="flex flex-1 flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]">
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
          className="reveal max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600"
          style={{ "--reveal-delay": "60ms" } as CSSProperties}
        >
          Indiana Jones y los Cazadores del Arca Perdida.
        </p>
      </NoteShell>
    </main>
  );
}
