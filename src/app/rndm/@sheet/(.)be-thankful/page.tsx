import { NoteSheet } from "@/components/note-sheet";
import {
  BONE,
  BeThankfulNote,
  beThankfulMetadata,
  beThankfulViewport,
} from "@/components/notes/be-thankful";

// The same note, intercepted — see the note beside this one.
export const metadata = beThankfulMetadata;
export const viewport = beThankfulViewport;

export default function BeThankfulSheet() {
  return (
    <NoteSheet title="be thankful for what you’ve got" surface={BONE}>
      <BeThankfulNote />
    </NoteSheet>
  );
}
