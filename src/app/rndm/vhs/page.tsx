import type { Metadata } from "next";
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
        artwork={
          <HoverArtwork
            defaultSrc="/toys/sopa-de-cerebro-de-mono.jpg"
            width={480}
            height={713}
            alt="Indiana Jones y los Cazadores del Arca Perdida, póster"
          />
        }
      >
        <h1 className="sr-only">
          Vhs — Indiana Jones y los Cazadores del Arca Perdida
        </h1>
        <p className="max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600">
          Indiana Jones y los Cazadores del Arca Perdida.
        </p>
      </NoteShell>
    </main>
  );
}
