import { noteViewport } from "@/lib/notes";
import { NotaNote, notaMetadata } from "@/components/notes/2026-09-05";

// The note's own address — see the note beside this one.
export const metadata = notaMetadata;
export const viewport = noteViewport;

export default function Note20260905Page() {
  return <NotaNote />;
}
