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
  // What the design changed, said after the image has been seen. Optional.
  turn?: string;
  ficha: FichaRow[];
};

export const projects: Project[] = [
  {
    slug: "lemon-p2p",
    name: "p2p para todo el mundo",
    year: "2023",
    client: "Lemon app",
    // A hook, not a description (Ana: "tipo bandeja"), two lines at most.
    // The clock was the brief: two months from the idea to the app, to be
    // out before Argentina's 2023 elections moved the market.
    summary: "Había elecciones y el mercado se iba a mover. Nosotros teníamos que movernos antes.",
    // The difference with other P2Ps, without naming them (Ana): there you
    // send money to a stranger by CVU or crypto yourself; here you posted
    // the order and it settled on its own — no extra step, no risk.
    turn: "En otros P2P le transferís a un desconocido y esperás. Acá publicabas y se ejecutaba solo.",
    ficha: [
      { label: "Diseño", value: "Ana Varela" },
      // PENDIENTE: el link a su LinkedIn.
      { label: "PM", value: "Agostina Rey" },
      { label: "Año", value: "2023" },
      { label: "App", value: "Lemon" },
      { label: "Tiempo", value: "2 meses, de la idea a la app" },
      { label: "Contexto", value: "Elecciones 2023, Argentina" },
    ],
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
