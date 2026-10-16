import { noteViewport } from "@/lib/notes";
import {
  BeThankfulNote,
  beThankfulMetadata,
} from "@/components/notes/be-thankful";

// The note's own address: what a share, a refresh or a search result lands
// on. Opened from the index it is intercepted instead (src/app/rndm/@sheet).
export const metadata = beThankfulMetadata;
export const viewport = noteViewport;

export default function BeThankfulPage() {
  return <BeThankfulNote />;
}
