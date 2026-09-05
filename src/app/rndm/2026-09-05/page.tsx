import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";

export default function Note20260905Page() {
  return (
    <main
      className="flex min-h-svh flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <NoteShell
        artwork={
          <HoverArtwork
            defaultSrc="/toys/sisifo-clean.jpg"
            hoverSrc="/toys/sisifo-hover.jpg"
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
