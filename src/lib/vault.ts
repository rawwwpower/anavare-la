// The vinyl vault: records from Ana's own collection, shown as fichas inside
// the "be thankful for what you've got" note. The source of truth is the
// Dead Wax collection database (rawwwpower/deadwax, coleccion.db) — this is a
// hand-picked copy of the fields worth showing, so when a record's edition
// gets confirmed there (a matrix read, a grading), it gets copied here too.
export type VaultRecord = {
  artist: string;
  title: string;
  // Year the album first came out, shown next to the title. The edition's
  // own year lives in `edition`.
  year: number;
  // What this copy is, in order: label, catalogue, barcode, pressing plant.
  // Ordered pairs rather than fixed fields, because a record only lists what
  // is actually known about it — an empty field is just not drawn.
  details: [label: string, value: string][];
  cover: { src: string; hoverSrc?: string; width: number; height: number; alt: string };
};

export const vault: VaultRecord[] = [
  {
    artist: "Massive Attack",
    title: "Blue Lines",
    year: 1991,
    details: [
      ["edición", "reedición 2016 · LP 180 g"],
      ["sello", "Virgin / Circa / Wild Bunch"],
      ["catálogo", "5700960"],
      ["barcode", "602557009606"],
      ["prensado", "Optimal Media, Alemania"],
      ["matrix", "a confirmar"],
    ],
    cover: {
      src: "/toys/blue-lines.jpg",
      hoverSrc: "/toys/blue-lines-hover.jpg",
      width: 640,
      height: 640,
      alt: "Blue Lines, Massive Attack, tapa",
    },
  },
];
