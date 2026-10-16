import {
  BeThankfulNote,
  beThankfulMetadata,
  beThankfulViewport,
} from "@/components/notes/be-thankful";

// The note's own address: what a share, a refresh or a search result lands
// on. Opened from the index it is intercepted instead (src/app/rndm/@sheet).
export const metadata = beThankfulMetadata;
export const viewport = beThankfulViewport;

export default function BeThankfulPage() {
  return <BeThankfulNote />;
}
