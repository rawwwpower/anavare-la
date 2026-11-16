import type { Metadata, Viewport } from "next";
import { BACKGROUND } from "@/lib/accent";
import { NOTE_THEME_COLOR } from "@/lib/notes";
import { TintedLink } from "@/components/tinted-link";
import type { CSSProperties } from "react";
import { links } from "@/lib/links";
import { FRAKTUR_TITLE, frakturTitles } from "@/lib/fraktur-titles";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Printed on white, the same paper as the notes (Ana, November 2026: the
// home goes white, rndm stays dark): near-black ink, the red accent on
// hover. The phone's chrome follows, and globals.css paints the body under
// it the same white.
export const viewport: Viewport = { themeColor: NOTE_THEME_COLOR };

const linkClassName =
  "inline-flex min-h-11 items-center px-3 text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-accent hover:decoration-accent active:scale-[0.97] focus-visible:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

// Staggered arrival, top to bottom. 60ms steps: enough to read as a
// sequence, short enough that the whole page is settled in well under half a
// second — the entrance must never be the reason the site feels slow.
const rndm = links.find((link) => !link.external)!;

const social = links.filter((link) => link.external);

const step = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export default function Home() {
  return (
    <main data-home className="mx-auto flex min-h-svh w-full flex-col px-[var(--page-pad-x)] pt-[var(--page-pad-y)] pb-[var(--page-pad-bottom)]">
      <div className="reveal min-h-[var(--heading-block)]">
        <h1
          aria-label="Ana Varela"
          className={`${frakturTitles.className} ${FRAKTUR_TITLE} text-zinc-900`}
        >
          A
        </h1>
        <p className="text-base text-zinc-900">design engineer</p>
      </div>

      <p
        className="reveal mt-12 max-w-md text-base leading-relaxed text-zinc-900 sm:mt-14"
        style={step(60)}
      >
        Ana Belén Varela in real life. On the internet, you might know me as{" "}
        <a
          href="https://youtu.be/ED3mufU58bk?si=6SR5NY0_-KCdtNQ-&t=75"
          target="_blank"
          rel="noreferrer"
          className="inline-block underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-accent hover:decoration-accent active:scale-[0.97]"
        >
          raw power
        </a>
        . Graphic design degree from FADU, raised by soulseek, keeping an eye
        on what&apos;s moving on the web.
      </p>

      {/* Breathing room: the reason "A" sits at the top while the links
          stay pinned to the bottom edge. */}
      <div className="my-10 min-h-40 flex-1 sm:my-14" />

      {/* The bottom row: rndm on the left, in the blackletter its own page
          is titled in, at that title's size (the cut in fraktur-titles
          already holds its letters); the social links on the right, on
          rndm's baseline. -ml-3 and -mr-3 take back the links' side padding,
          so the ink meets the page margin on both sides. */}
      <div className="reveal flex items-baseline justify-between gap-4" style={step(120)}>
        <nav aria-label="Sections">
          {/* Prefetched (Next's default, production only): /rndm is
              static and small, so it is already in the router by the time
              the thumb gets there and the tap is instant. Without it every
              tap waited on the network with the home frozen on screen
              (Ana, November 2026: "no puede lucir trabado"). The dark tint
              is the index's chrome, set at the tap — see tinted-link.tsx. */}
          <TintedLink
            href={rndm.href}
            aria-label={rndm.aria}
            tint={BACKGROUND}
            className={`${linkClassName} -ml-3 ${frakturTitles.className} ${FRAKTUR_TITLE}`}
          >
            {rndm.label}
          </TintedLink>
        </nav>

        <nav aria-label="Social links" className="-mr-3">
          <ul className="flex flex-row items-center text-base">
            {social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.aria}
                  className={linkClassName}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
