import { noteViewport } from "@/lib/notes";
import { NoteSheet } from "@/components/note-sheet";
import { VhsNote, vhsMetadata } from "@/components/notes/vhs";

// The same note, intercepted: reached from the index, it comes up as a sheet
// on top of it instead of replacing it. The URL is still /rndm/vhs, so
// sharing or reloading gets the page above.
export const metadata = vhsMetadata;
export const viewport = noteViewport;

export default function VhsSheet() {
  return (
    <NoteSheet title="vhs">
      <VhsNote />
    </NoteSheet>
  );
}
