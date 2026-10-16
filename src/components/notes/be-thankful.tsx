import type { Metadata, Viewport } from "next";
import { UnifrakturMaguntia } from "next/font/google";
import Image from "next/image";
import type { CSSProperties } from "react";
import { NoteShell } from "@/components/note-shell";
import { vault } from "@/lib/vault";

// The vault's first room, named for the track that opens Blue Lines.
// Everything sits in the text column under the note's title, phone first:
// the record's head (cover and name), then the ficha, then the works cited.
//
// The record's name is the one thing set in blackletter. Declared here
// rather than in the root layout, so only this note ever fetches the face.
const fraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Bone instead of the other notes' #fafaf9: as white as they are, just a
// touch warmer — old paper next to them, never a colour of its own.
export const BONE = "#fcfaf6";

export const beThankfulViewport: Viewport = { themeColor: BONE };

export const beThankfulMetadata: Metadata = {
  title: "be thankful for what you’ve got",
  alternates: { canonical: "/rndm/be-thankful" },
};

// How a cited address is printed: no scheme, and a MusicBrainz id cut to
// its first block the way a book shortens a long reference. The link itself
// still goes to the full address.
const shortUrl = (url: string) =>
  url
    .replace(/^https:\/\/(www\.)?/, "")
    .replace(/\b([0-9a-f]{8})-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/, "$1…");

const stagger = (i: number) =>
  ({ "--reveal-delay": `${60 + i * 45}ms` }) as CSSProperties;

export function BeThankfulNote() {
  const [record] = vault;

  return (
    <NoteShell
      title="be thankful for what you’ve got"
      titleAria="Be thankful for what you’ve got — vault de vinilos"
      surface={BONE}
    >
      <article
        aria-label={`${record.artist} — ${record.title}`}
        className="max-w-md"
      >
        {/* The name is the whole head, five times the ficha's size, on two
            lines. Looking closer (hover, a press on the phone, or keyboard
            focus) lays Ana's photo of her copy over it, square and exactly
            as tall as the name: a quick, quiet fade, nothing more. The photo loads
            eagerly with the page, so the swap never waits on a download. */}
        <div className="reveal" style={stagger(0)}>
          <div
            tabIndex={0}
            className="group relative w-fit outline-none select-none [-webkit-touch-callout:none]"
          >
            <h2
              className={`${fraktur.className} text-[clamp(5rem,24vw,7.5rem)] leading-[0.85] text-zinc-900 transition-opacity duration-150 ease-[ease] group-hover:opacity-0 group-focus-visible:opacity-0 group-active:opacity-0`}
            >
              {record.title}
            </h2>
            <Image
              src={record.cover.image}
              alt={record.cover.alt}
              sizes="(min-width: 640px) 220px, 56vw"
              placeholder="blur"
              loading="eager"
              draggable={false}
              className="pointer-events-none absolute top-0 left-0 z-10 aspect-square h-full w-auto max-w-none opacity-0 transition-opacity duration-150 ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
          </div>
          <p className="mt-4 font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-500">
            {record.artist} · {record.year}
          </p>
        </div>

        {/* The ficha as a card: a hairline frame and a hairline between rows,
            like a library catalogue card. */}
        <dl
          className="reveal mt-8 border-[0.5px] border-zinc-300 px-3 font-mono text-xs font-light leading-relaxed tracking-wide"
          style={stagger(1)}
        >
          {record.details.map(([label, value, source]) => (
            <div
              key={label}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b-[0.5px] border-zinc-300 py-2 last:border-b-0"
            >
              <dt className="text-[10px] tracking-[0.08em] text-zinc-400">
                {label}
              </dt>
              <dd className="text-zinc-600">
                {value}
                {source && (
                  <sup className="ml-0.5 text-[8px] text-zinc-400">
                    <a href={`#fuente-${source}`} aria-label={`fuente ${source}`}>
                      {source}
                    </a>
                  </sup>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* Works cited, the way a book closes: author, title in italics,
            the edition, and where to find it. Set apart from the ficha in
            the light sans, two sizes down, so it reads as the small print
            it is. */}
        <footer className="reveal mt-12" style={stagger(2)}>
          <h3 className="font-sans text-[9px] tracking-[0.04em] text-zinc-400">
            fuentes
          </h3>
          <ol className="mt-1.5 flex flex-col gap-0.5 font-sans text-[9px] leading-relaxed text-zinc-400">
            {record.sources.map((s, i) => (
              <li key={s.author} id={`fuente-${i + 1}`} className="flex gap-2">
                <span>{i + 1}.</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {s.author}. <i>{s.title}</i>
                  {s.detail && `. ${s.detail}`}.
                  {s.url && (
                    <>
                      {" "}
                      <a
                        href={s.url}
                        className="underline decoration-zinc-200 underline-offset-2 hover:text-zinc-700"
                      >
                        {shortUrl(s.url)}
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </footer>
      </article>
    </NoteShell>
  );
}
