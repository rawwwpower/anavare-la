// `aria` is only for links whose visible text doesn't say what they are —
// "in" needs to be announced as LinkedIn. Repeating the label as an
// aria-label tells a screen reader nothing it wasn't already reading.
export const links = [
  { label: "GitHub", href: "https://github.com/rawwwpower", external: true },
  { label: "X", href: "https://x.com/_rawpower", external: true },
  {
    label: "in",
    href: "https://www.linkedin.com/in/anabelenv",
    external: true,
    aria: "LinkedIn",
  },
  { label: "rndm", href: "/rndm", external: false },
];
