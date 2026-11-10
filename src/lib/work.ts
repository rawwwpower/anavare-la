// Index of /wrk: Ana's design work, past and current. Each project opens
// as a sheet over the index (src/app/wrk/@sheet), like a /rndm note, but
// one that can be lifted to the whole screen, since a project is a long
// read.
export type FichaRow = {
  label: string;
  value: string;
  // A person's or a product's own page, when the row should lead there.
  href?: string;
};

export type Project = {
  slug: string;
  name: string;
  // The index's second line, in mono, and the project's own under its title.
  year: string;
  client: string;
  // The line that hooks the reader into the project, two lines at most.
  summary: string;
  ficha: FichaRow[];
};

export const projects: Project[] = [
  {
    slug: "lemon-p2p",
    name: "p2p para todo el mundo",
    year: "2023",
    client: "Lemon app",
    // A hook, not a description (Ana: "tipo bandeja"), two lines at most.
    summary: "El P2P ya existía. Faltaba que lo entienda cualquiera.",
    ficha: [
      { label: "Diseño", value: "Ana Varela" },
      // PENDIENTE: el link a su LinkedIn.
      { label: "PM", value: "Agostina Rey" },
      { label: "Año", value: "2023" },
      { label: "App", value: "Lemon" },
    ],
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
