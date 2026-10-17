import type { Metadata, Viewport } from "next";
import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import { ArrivalImage } from "@/components/arrival";
import { NoteShell } from "@/components/note-shell";
import { ACCENT } from "@/lib/accent";
import { pageMetadata } from "@/lib/notes";
import { fraktur } from "@/lib/fraktur";
import { vault } from "@/lib/vault";

// The vault's first room, named for the track that opens Blue Lines.
// Everything sits in the text column under the note's title, phone first:
// the record's head (name, with the photo on hover), then the ficha, whose
// citation numbers link straight to their sources.
//
// The record's name is set in the site's blackletter (src/lib/fraktur.ts).

// Printed on the accent: the vault's first record gets the site's red as its
// paper, black ink on it, and a white hover. The phone's chrome follows.
export const beThankfulViewport: Viewport = { themeColor: ACCENT };

export const beThankfulMetadata: Metadata = pageMetadata(
  "be thankful for what you’ve got",
  "/rndm/be-thankful",
  "El vault de vinilos de Ana Varela. Primer disco: Blue Lines de Massive Attack, reedición europea 2016 en 180 g.",
);

// "Massive Attack" sets 6.3em wide in this face; dividing the column by 6.4
// makes the phone's single line fill it with a hair to spare, at any width.
const BAND_SIZE =
  "text-[calc((100vw-2*var(--page-pad-x))/6.4)] sm:text-[clamp(5rem,24vw,7.5rem)]";

// One grid for every row of the ficha, so the values share one left edge.
// The padding is on the row, not the card, so each hairline runs from one
// side of the frame to the other.
const FICHA_ROW =
  "grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 border-b-[0.5px] border-black/30 px-3 last:border-b-0";

const stagger = (i: number) =>
  ({ "--reveal-delay": `${60 + i * 45}ms` }) as CSSProperties;

export function BeThankfulNote() {
  const [record] = vault;

  return (
    <NoteShell
      title="be thankful for what you’ve got"
      titleAria="Be thankful for what you’ve got — vault de vinilos"
      tone="ink"
      surface={ACCENT}
    >
      <article
        aria-label={`${record.artist} — ${record.title}`}
        className="max-w-md"
      >
        {/* The band's name is the whole head; the record itself is the
            ficha's first row. On the phone it is one line, as wide as the
            column — so the note fits the same sheet as every other note
            without scrolling. From sm: up, two lines at the vault's display
            size. */}
        <h2
          className={`reveal ${fraktur.className} ${BAND_SIZE} leading-[0.85] whitespace-nowrap text-black sm:whitespace-normal`}
          style={stagger(0)}
        >
          {record.artist}
        </h2>

        {/* The ficha as a card: a hairline frame and a hairline between rows,
            like a library catalogue card. Every row, the first included,
            shares one two-column grid, so the values all start on the same
            line. The first row names the record, its label column holding
            Ana's photo of her copy, exactly as wide as that column — the
            head an iconic record's card has in the vinilos artifact. */}
        <div
          className="reveal mt-6 border-[0.5px] border-black/30 font-mono text-xs leading-relaxed tracking-wide"
          style={stagger(1)}
        >
          <dl>
            <div className={`${FICHA_ROW} items-center py-3.5`}>
              <dt>
                {/* Next sizes and encodes it; it arrives the site's one way. */}
                <ArrivalImage
                  {...getImageProps({
                    src: record.cover.image,
                    alt: record.cover.alt,
                    sizes: "56px",
                    loading: "eager",
                  }).props}
                  draggable={false}
                  className="size-14 select-none"
                />
                <span className="sr-only">
                  Disco
                </span>
              </dt>
              <dd className="text-black">
                <span className="block">{record.title}</span>
                <span className="block text-black/60">
                  {record.year}
                </span>
              </dd>
            </div>
            {record.details.map(([label, value, source]) => (
              <div
                key={label}
                className={`${FICHA_ROW} items-baseline py-2.5`}
              >
                <dt className="text-[10px] tracking-[0.08em] text-black/60">
                  {label}
                </dt>
                <dd className="text-black">
                  {value}
                  {source && (
                    // The citation is the link itself: the number goes straight
                    // to the work it cites, so the note needs no list of works
                    // at its foot and fits the sheet like every other note.
                    <sup className="ml-0.5 text-[10px] text-black/60">
                      <a
                        href={record.sources[source - 1].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`fuente: ${record.sources[source - 1].author}`}
                        className="hover:text-white"
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
