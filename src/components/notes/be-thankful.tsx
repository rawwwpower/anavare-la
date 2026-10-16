import type { Metadata, Viewport } from "next";
import { UnifrakturMaguntia } from "next/font/google";
import Image from "next/image";
import type { CSSProperties } from "react";
import { NoteShell } from "@/components/note-shell";
import { WideArtwork } from "@/components/notes/wide-artwork";
import { vault } from "@/lib/vault";

// The vault's first room, named for the track that opens Blue Lines.
// Everything sits in the text column under the note's title, phone first:
// the record's head (name, with the photo on hover), then the ficha, whose
// citation numbers link straight to their sources.
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

const stagger = (i: number) =>
  ({ "--reveal-delay": `${60 + i * 45}ms` }) as CSSProperties;

export function BeThankfulNote() {
  const [record] = vault;

  return (
    <NoteShell
      title="be thankful for what you’ve got"
      titleAria="Be thankful for what you’ve got — vault de vinilos"
      surface={BONE}
      // On a wide screen the photo takes the corner every other note's
      // artwork sits in; on the phone it lives on the name instead (below).
      artwork={
        <WideArtwork
          defaultSrc={record.cover.image.src}
          width={record.cover.image.width}
          height={record.cover.image.height}
          alt={record.cover.alt}
        />
      }
    >
      <article
        aria-label={`${record.artist} — ${record.title}`}
        className="max-w-md"
      >
        {/* The name is the whole head, five times the ficha's size, on two
            lines. On the phone, looking closer (a press, or keyboard focus)
            lays Ana's photo of her copy over it, square and exactly as tall
            as the name: a quick, quiet fade, nothing more. The photo loads
            eagerly with the page, so the swap never waits on a download.
            From sm: up the photo is in the corner instead, so the name just
            stays the name. */}
        <div className="reveal" style={stagger(0)}>
          <div
            tabIndex={0}
            className="group relative w-fit outline-none select-none [-webkit-touch-callout:none]"
          >
            <h2
              className={`${fraktur.className} text-[clamp(5rem,24vw,7.5rem)] leading-[0.85] text-zinc-900 transition-opacity duration-150 ease-[ease] max-sm:group-hover:opacity-0 max-sm:group-focus-visible:opacity-0 max-sm:group-active:opacity-0`}
            >
              {record.title}
            </h2>
            <Image
              src={record.cover.image}
              alt={record.cover.alt}
              sizes="56vw"
              placeholder="blur"
              loading="eager"
              draggable={false}
              className="pointer-events-none absolute top-0 left-0 z-10 aspect-square h-full w-auto max-w-none opacity-0 sm:hidden transition-opacity duration-150 ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
          </div>
          <p className="mt-3 font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-500">
            {record.artist} · {record.year}
          </p>
        </div>

        {/* The ficha as a card: a hairline frame and a hairline between rows,
            like a library catalogue card. */}
        <dl
          className="reveal mt-6 border-[0.5px] border-zinc-300 px-3 font-mono text-xs font-light leading-relaxed tracking-wide"
          style={stagger(1)}
        >
          {record.details.map(([label, value, source]) => (
            <div
              key={label}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b-[0.5px] border-zinc-300 py-1.5 last:border-b-0"
            >
              <dt className="text-[10px] tracking-[0.08em] text-zinc-400">
                {label}
              </dt>
              <dd className="text-zinc-600">
                {value}
                {source && (
                  // The citation is the link itself: the number goes straight
                  // to the work it cites, so the note needs no list of works
                  // at its foot and fits the sheet like every other note.
                  <sup className="ml-0.5 text-[8px] text-zinc-400">
                    <a
                      href={record.sources[source - 1].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`fuente: ${record.sources[source - 1].author}`}
                      className="hover:text-zinc-700"
                    >
                      {source}
                    </a>
                  </sup>
                )}
              </dd>
            </div>
          ))}
        </dl>

      </article>
    </NoteShell>
  );
}
