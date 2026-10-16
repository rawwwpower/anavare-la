import type { Metadata, Viewport } from "next";
import { UnifrakturMaguntia } from "next/font/google";
import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";
import { vault } from "@/lib/vault";

// The vault's first room, named for the track that opens Blue Lines. Laid
// out like every other note — title, text, close, and the piece in the
// corner — with the record as the text: its name, the ficha, and the works
// cited at the foot.
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

// What the cover actually draws at: clamp(176px, 28vw, 320px) in the
// desktop corner, and the whole text column on the phone (the viewport
// minus its two gutters). The browser picks the smallest optimized
// candidate that covers it, at the screen's own density.
const COVER_SIZES =
  "(min-width: 1143px) 320px, (min-width: 640px) 28vw, calc(100vw - 48px)";

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
  const {
    props: { src, srcSet, sizes },
  } = getImageProps({
    src: record.cover.image,
    alt: record.cover.alt,
    sizes: COVER_SIZES,
  });

  return (
    <NoteShell
      title="be thankful for what you’ve got"
      titleAria="Be thankful for what you’ve got — vault de vinilos"
      surface={BONE}
      artworkFirst
      artwork={
        <HoverArtwork
          lead
          defaultSrc={src}
          srcSet={srcSet}
          sizes={sizes}
          placeholder={record.cover.image.blurDataURL}
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
        {/* Blackletter sets small and dense, and this is the line that has to
            be read at a glance: twice the ficha's size on desktop, and twice
            that again on the phone, where it can take two lines. */}
        <h2
          className={`reveal ${fraktur.className} text-5xl leading-[1.05] text-zinc-900 sm:text-2xl sm:leading-tight`}
          style={stagger(0)}
        >
          {record.title}
        </h2>
        <p
          className="reveal mt-1 font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-500"
          style={stagger(0)}
        >
          {record.artist} · {record.year}
        </p>

        {/* The ficha as a card: a hairline frame and a hairline between rows,
            like a library catalogue card. */}
        <dl
          className="reveal mt-6 border-[0.5px] border-zinc-300 px-3 font-mono text-xs font-light leading-relaxed tracking-wide"
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
