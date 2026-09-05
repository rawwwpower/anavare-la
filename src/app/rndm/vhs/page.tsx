import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

export default function NoteVhsPage() {
  return (
    <main
      className="flex min-h-svh flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <NoteShell>
        <h1 className="sr-only">
          Nota — Indiana Jones y los Cazadores del Arca Perdida
        </h1>
        <p className="max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600">
          Indiana Jones y los Cazadores del Arca Perdida.
        </p>
      </NoteShell>

      <HoverArtwork
        defaultSrc="/toys/sopa-de-cerebro-de-mono.jpg"
        alt="Indiana Jones y los Cazadores del Arca Perdida, póster"
      />
    </main>
  );
}
