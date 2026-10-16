// The vinyl vault: records from Ana's own collection, shown as fichas inside
// the "be thankful for what you've got" note. The source of truth is the
// Dead Wax collection database (rawwwpower/deadwax, coleccion.db) — this is a
// hand-picked copy of the fields worth showing, so when a record's edition
// gets confirmed there (a matrix read, a grading), it gets copied here too.
//
// Only what is known gets written down. A field still waiting on a check
// (say, the matrix before the dead wax has been read) is left out entirely
// rather than shown as "a confirmar": the ficha says what this copy is, not
// what is still missing.

import type { StaticImageData } from "next/image";
import blueLines from "@/assets/vault/blue-lines.webp";

// A work cited, the way a book lists them at the back: who published it,
// what it is called, and where to find it.
export type Source = {
  author: string;
  title: string;
  detail?: string;
  url?: string;
};

export type VaultRecord = {
  artist: string;
  title: string;
  // Year the album first came out, shown next to the title. The edition's
  // own year lives in the details.
  year: number;
  // What this copy is, in order. Ordered pairs rather than fixed fields,
  // because a record only lists what is actually known about it. The third
  // item, when present, is the source's number in `sources` (1-based), set
  // as a superscript call like a book's footnote.
  details: [label: string, value: string, source?: number][];
  // Ana's treatment of the release's official front cover (Cover Art
  // Archive, MusicBrainz release 79c806ce: Virgin 5700960, Europe 2016): a
  // monotone of black shadows and the accent, made in Figma (desaturate,
  // contrast, an #ff3d4a fill on Multiply), exported sRGB and kept at
  // 1200x1200. Kept in the repo and imported, not linked: the file gets a
  // content hash and is cached for good, and Next serves it resized to what
  // the page shows (56px in the ficha) in WebP or AVIF, with a blurred
  // placeholder derived at build time.
  cover: { image: StaticImageData; alt: string };
  sources: Source[];
};

export const vault: VaultRecord[] = [
  {
    artist: "Massive Attack",
    title: "Blue Lines",
    year: 1991,
    details: [
      ["Edición", "reedición 2016 · LP 180 g", 1],
      ["Sello", "Virgin / Circa / Wild Bunch", 1],
      ["Catálogo", "5700960", 1],
      ["Barcode", "602557009606", 2],
      ["Prensado", "Optimal Media, Alemania", 1],
    ],
    cover: { image: blueLines, alt: "Blue Lines, Massive Attack, tapa" },
    sources: [
      {
        author: "Discogs",
        title: "Massive Attack – Blue Lines",
        detail: "Virgin, 5700960, Europa, 2016",
        url: "https://www.discogs.com/release/9442778",
      },
      {
        author: "MusicBrainz",
        title: "Blue Lines",
        detail: "release 79c806ce, 2016",
        url: "https://musicbrainz.org/release/79c806ce-52c7-44f6-8279-469569bbca94",
      },
    ],
  },
];
