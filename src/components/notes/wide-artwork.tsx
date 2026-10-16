"use client";

import { HoverArtwork } from "@/components/hover-artwork";
import { useMediaQuery } from "@/components/sheet-context";

// A note's corner artwork for wide screens only — for a note whose phone
// layout already shows its image another way (be-thankful lays it over the
// name). It is the very same HoverArtwork every other note uses, so on a
// wide screen it sits on the same pixel: right gutter, shelf bottom.
//
// Rendered rather than hidden with CSS, because HoverArtwork preloads its
// image at high priority and a display:none <img> still downloads: hidden,
// a phone would pay for a picture it never shows. The query reads false on
// the server, so the corner arrives after hydration — which HoverArtwork's
// own fade-in already covers.
const WIDE = "(min-width: 640px)";

export function WideArtwork(props: React.ComponentProps<typeof HoverArtwork>) {
  const wide = useMediaQuery(WIDE);
  return wide ? <HoverArtwork {...props} /> : null;
}
