import { ACCENT } from "@/lib/accent";
import { NoteSheet } from "@/components/note-sheet";
import {
  BeThankfulNote,
  beThankfulMetadata,
  beThankfulViewport,
} from "@/components/notes/be-thankful";

// The same note, intercepted: reached from the index, it comes up as a sheet
// on top of it instead of replacing it — the same sheet every note uses.
export const metadata = beThankfulMetadata;
export const viewport = beThankfulViewport;

export default function BeThankfulSheet() {
  return (
    <NoteSheet title="be thankful for what you’ve got" surface={ACCENT}>
      <BeThankfulNote />
    </NoteSheet>
  );
}
