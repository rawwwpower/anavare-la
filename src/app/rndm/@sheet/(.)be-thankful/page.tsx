import { noteViewport } from "@/lib/notes";
import { NoteSheet } from "@/components/note-sheet";
import {
  BeThankfulNote,
  beThankfulMetadata,
} from "@/components/notes/be-thankful";

// The same note, intercepted: reached from the index, it comes up as a sheet
// on top of it instead of replacing it — the same sheet every note uses.
export const metadata = beThankfulMetadata;
export const viewport = noteViewport;

export default function BeThankfulSheet() {
  return (
    <NoteSheet title="be thankful for what you’ve got">
      <BeThankfulNote />
    </NoteSheet>
  );
}
