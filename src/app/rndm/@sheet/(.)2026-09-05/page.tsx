import { noteViewport } from "@/lib/notes";
import { NoteSheet } from "@/components/note-sheet";
import { NotaNote, notaMetadata } from "@/components/notes/2026-09-05";

// The same note, intercepted — see the note beside this one.
export const metadata = notaMetadata;
export const viewport = noteViewport;

export default function NotaSheet() {
  return (
    <NoteSheet title="nota">
      <NotaNote />
    </NoteSheet>
  );
}
