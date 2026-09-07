import { noteViewport } from "@/lib/notes";
import { VhsNote, vhsMetadata } from "@/components/notes/vhs";

// The note's own address: what a share, a refresh or a search result lands
// on. Nothing is underneath it here, so it is a page, not a sheet — opened
// from the index it is intercepted instead (src/app/rndm/@sheet).
export const metadata = vhsMetadata;
export const viewport = noteViewport;

export default function NoteVhsPage() {
  return <VhsNote />;
}
