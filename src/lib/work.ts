// Index of /wrk: Ana's design work, past and current. Each project opens
// as a sheet over the index (src/app/wrk/@sheet), like a /rndm note, but
// one that can be lifted to the whole screen, since a project is a long
// read.
//
// PLACEHOLDERS: these entries only exist to try the section out on a phone.
// Swap them for the real projects before this reaches main.
export type Project = {
  slug: string;
  name: string;
  // The index's second line, in mono: when, and in what role or for whom.
  year: string;
  role: string;
  summary: string;
};

export const projects: Project[] = [
  {
    slug: "proyecto-uno",
    name: "proyecto uno",
    year: "2026",
    role: "placeholder",
    summary: "Texto de prueba. Acá va de qué se trató el proyecto y qué hizo Ana.",
  },
  {
    slug: "proyecto-dos",
    name: "proyecto dos",
    year: "2025",
    role: "placeholder",
    summary: "Texto de prueba. Acá va de qué se trató el proyecto y qué hizo Ana.",
  },
  {
    slug: "proyecto-tres",
    name: "proyecto tres",
    year: "2023",
    role: "placeholder",
    summary: "Texto de prueba. Acá va de qué se trató el proyecto y qué hizo Ana.",
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
