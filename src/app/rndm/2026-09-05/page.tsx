import type { Metadata } from "next";
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
        <h1 className="sr-only">Nota — 05 de septiembre de 2026</h1>
        <p className="max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600">
          Agotá el rango de lo posible y de lo imposible.
        </p>
      </NoteShell>
    </main>
  );
}
