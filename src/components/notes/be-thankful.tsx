import type { Metadata, Viewport } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { NoteShell } from "@/components/note-shell";
import { WideArtwork } from "@/components/notes/wide-artwork";
import { FRAKTUR_DISPLAY, fraktur } from "@/lib/fraktur";
import { vault } from "@/lib/vault";

// The vault's first room, named for the track that opens Blue Lines.
// Everything sits in the text column under the note's title, phone first:
// the record's head (name, with the photo on hover), then the ficha, whose
// citation numbers link straight to their sources.
//
// The record's name is set in the site's blackletter (src/lib/fraktur.ts).

// Bone instead of the other notes' #fafaf9: as white as they are, just a
// touch warmer — old paper next to them, never a colour of its own.
export const BONE = "#fcfaf6";

export const beThankfulViewport: Viewport = { themeColor: BONE };

export const beThankfulMetadata: Metadata = {
  title: "be thankful for what you’ve got",
  alternates: { canonical: "/rndm/be-thankful" },
};

// One grid for every row of the ficha, so the values share one left edge.
// The padding is on the row, not the card, so each hairline runs from one
// side of the frame to the other.
const FICHA_ROW =
  "grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 border-b-[0.5px] border-zinc-200 px-3 last:border-b-0";

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
        {/* The band's name is the whole head, five times the ficha's size,
            on two lines; the record itself is the ficha's first row. */}
        <h2
          className={`reveal ${fraktur.className} ${FRAKTUR_DISPLAY} leading-[0.85] text-zinc-900`}
          style={stagger(0)}
        >
          {record.artist}
        </h2>

        {/* The ficha as a card: a hairline frame and a hairline between rows,
            like a library catalogue card. Every row, the first included,
            shares one two-column grid, so the values all start on the same
            line. The first row names the record: on the phone the label
            column holds Ana's photo of her copy, exactly as wide as that
            column — the head an iconic record's card has in the vinilos
            artifact; from sm: up the photo lives in the page's corner (see
            the artwork above), so the column holds a label like the rest. */}
        <div
          className="reveal mt-6 border-[0.5px] border-zinc-300 font-mono text-xs leading-relaxed tracking-wide"
          style={stagger(1)}
        >
          <dl>
            <div className={`${FICHA_ROW} items-center py-3.5 sm:items-baseline sm:py-2.5`}>
              <dt>
                <Image
                  src={record.cover.image}
                  alt={record.cover.alt}
                  sizes="56px"
                  placeholder="blur"
                  loading="eager"
                  draggable={false}
                  className="size-14 select-none sm:hidden"
                />
                <span className="text-[10px] tracking-[0.08em] text-zinc-400 max-sm:sr-only">
                  Disco
                </span>
              </dt>
              <dd className="text-zinc-600">
                <span className="block sm:inline">{record.title}</span>
                <span aria-hidden className="hidden sm:inline">
                  {" · "}
                </span>
                <span className="block text-zinc-400 sm:inline sm:text-zinc-600">
                  {record.year}
                </span>
              </dd>
            </div>
            {record.details.map(([label, value, source]) => (
              <div
                key={label}
                className={`${FICHA_ROW} items-baseline py-2.5`}
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
                    <sup className="ml-0.5 text-[10px] text-zinc-400">
                      <a
                        href={record.sources[source - 1].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`fuente: ${record.sources[source - 1].author}`}
                        className="hover:text-accent"
                      >
                        {source}
                      </a>
                    </sup>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </NoteShell>
  );
}
