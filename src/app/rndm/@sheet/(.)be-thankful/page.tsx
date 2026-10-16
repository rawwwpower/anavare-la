import { noteViewport } from "@/lib/notes";
import { NoteSheet } from "@/components/note-sheet";
import {
  BeThankfulNote,
  beThankfulMetadata,
} from "@/components/notes/be-thankful";

// The same note, intercepted — see the note beside this one.
export const metadata = beThankfulMetadata;
export const viewport = noteViewport;

export default function BeThankfulSheet() {
  return (
    <NoteSheet title="be thankful for what you’ve got">
      <BeThankfulNote />
    </NoteSheet>
  );
}
