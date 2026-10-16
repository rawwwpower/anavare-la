import { noteViewport } from "@/lib/notes";
import {
  BeThankfulNote,
  beThankfulMetadata,
} from "@/components/notes/be-thankful";

// The note's own address — see the note beside this one.
export const metadata = beThankfulMetadata;
export const viewport = noteViewport;

export default function BeThankfulPage() {
  return <BeThankfulNote />;
}
