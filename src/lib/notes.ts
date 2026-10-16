import type { Viewport } from "next";

// A note is the one light surface on the site, so the browser chrome flips
// with it. Shared by a note's own page and by the sheet it is shown in when
// it was opened from the index, so the two can never disagree.
export const NOTE_THEME_COLOR = "#fafaf9";

export const noteViewport: Viewport = {
  themeColor: NOTE_THEME_COLOR,
};

// The root layout's title template, applied by hand. A note opened from the
// index arrives as an intercepted route in a parallel slot, and Next builds
// <head> from the main tree — so that head still belongs to the index and
// the sheet has to say its own name from the client (see note-sheet.tsx).
export const pageTitle = (title: string) => `${title} · Ana Varela`;

// Index of /rndm entries. Each note is its own page under src/app/rndm/<slug>,
// free to hold whatever it needs (text, images, more later) — this list only
// carries what the /rndm index needs to render the link and its timestamp.
export type Note = {
  slug: string;
  // Shown on the /rndm index as the link's own text — defaults to "nota"
  // elsewhere, but each entry can be named for what it actually is.
  label: string;
  // Local date and time, no timezone offset — read as local by Date().
  date: string;
  place: string;
};

export const notes: Note[] = [
  {
    slug: "2026-09-05",
    label: "nota",
    date: "2026-09-05T00:23",
    place: "Buenos Aires",
  },
  {
    slug: "vhs",
    label: "vhs",
    date: "2026-09-05T18:21",
    place: "Buenos Aires",
  },
  {
    slug: "be-thankful",
    label: "be thankful for what you’ve got",
    date: "2026-10-16T00:50",
    place: "Buenos Aires",
  },
];

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

export function formatNoteShort(note: Note) {
  const d = new Date(note.date);
  return `${shortDate.format(d)} · ${time.format(d)} · ${note.place}`;
}
