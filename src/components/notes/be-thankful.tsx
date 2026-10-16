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

// Bone instead of the other notes' #fafaf9: a few points warmer, enough to
// read as old paper next to them without ever looking like a different
// colour on its own.
export const BONE = "#f9f6ef";

export const beThankfulViewport: Viewport = { themeColor: BONE };

export const beThankfulMetadata: Metadata = {
  title: "be thankful for what you’ve got",
  alternates: { canonical: "/rndm/be-thankful" },
};

// The artwork box is clamp(176px, 28vw, 320px) wide (see HoverArtwork), so
// this is exactly what it draws at: the browser picks the smallest optimized
// candidate that covers it, at the screen's own density.
const COVER_SIZES = "(min-width: 1143px) 320px, (min-width: 629px) 28vw, 176px";

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
      artwork={
        <HoverArtwork
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
        {/* Twice the size of the note's own text: blackletter sets small and
            dense, and this is the line that has to be read at a glance. */}
        <h2
          className={`reveal ${fraktur.className} text-2xl leading-tight text-zinc-900`}
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

        <dl
          className="reveal mt-6 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1.5 font-mono text-xs font-light leading-relaxed tracking-wide"
          style={stagger(1)}
        >
          {record.details.map(([label, value, source]) => (
            <div key={label} className="contents">
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
            the edition, and where to find it — one size down from the ficha. */}
        <footer className="reveal mt-12" style={stagger(2)}>
          <h3 className="font-mono text-[10px] tracking-[0.08em] text-zinc-400">
            fuentes
          </h3>
          <ol className="mt-2 flex flex-col gap-1 font-mono text-[10px] font-light leading-relaxed tracking-wide text-zinc-500">
            {record.sources.map((s, i) => (
              <li key={s.author} id={`fuente-${i + 1}`} className="flex gap-2">
                <span className="text-zinc-400">{i + 1}.</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {s.author}. <i>{s.title}</i>
                  {s.detail && `. ${s.detail}`}.
                  {s.url && (
                    <>
                      {" "}
                      <a
                        href={s.url}
                        className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
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
