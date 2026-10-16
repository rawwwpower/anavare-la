import {
  BeThankfulNote,
  beThankfulMetadata,
  beThankfulViewport,
} from "@/components/notes/be-thankful";

// The note's own address — see the note beside this one.
export const metadata = beThankfulMetadata;
export const viewport = beThankfulViewport;

export default function BeThankfulPage() {
  return <BeThankfulNote />;
}
