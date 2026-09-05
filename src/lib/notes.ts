// Index of /rndm entries. Each note is its own page under src/app/rndm/<slug>,
// free to hold whatever it needs (text, images, more later) — this list only
// carries what the /rndm index needs to render the link and its timestamp.
export type Note = {
  slug: string;
  // Local date and time, no timezone offset — read as local by Date().
  date: string;
  place: string;
};

export const notes: Note[] = [
  {
    slug: "2026-09-05",
    date: "2026-09-05T00:23",
    place: "Buenos Aires",
  },
  {
    slug: "vhs",
    date: "2026-09-05T18:21",
    place: "Buenos Aires",
  },
];

const longDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const shortDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const time = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatNoteLong(note: Note) {
  const d = new Date(note.date);
  return `${longDate.format(d)} · ${time.format(d)} · ${note.place}`;
}

export function formatNoteShort(note: Note) {
  const d = new Date(note.date);
  return `${shortDate.format(d)} · ${time.format(d)} · ${note.place}`;
}
