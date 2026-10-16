import type { Metadata } from "next";
import { UnifrakturMaguntia } from "next/font/google";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";
import { vault } from "@/lib/vault";

// The vault's first room, named for the track that opens Blue Lines. Each
// record reads top to bottom: its cover, its name, then the ficha — all in
// the note's mono type. Only the note's own title is set apart, in a
// blackletter.
//
// Declared here rather than in the root layout, so the face is only ever
// fetched by the one note that uses it — every other page stays on Switzer
// and Geist Mono and never preloads it.
const fraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const beThankfulMetadata: Metadata = {
  title: "be thankful for what you’ve got",
  alternates: { canonical: "/rndm/be-thankful" },
};

export function BeThankfulNote() {
  return (
    <NoteShell
      title="be thankful for what you’ve got"
      titleAria="Be thankful for what you’ve got — vault de vinilos"
      // Blackletter sets small for its size, so it gets one step up from the
      // site's text-base headings to read at the same weight on the page.
      titleClassName={`${fraktur.className} text-xl leading-snug`}
    >
      <ol className="flex flex-col gap-14">
        {vault.map((record, i) => (
          // Same stagger rule as the index: capped, so a long vault never
          // turns its own entrance into a wait.
          <li
            key={`${record.artist}-${record.title}`}
            className="reveal max-w-md"
            style={
              {
                "--reveal-delay": `${60 + Math.min(i, 5) * 45}ms`,
              } as CSSProperties
            }
          >
            <article aria-label={`${record.artist} — ${record.title}`}>
              <HoverArtwork
                placement="inline"
                defaultSrc={record.cover.src}
                hoverSrc={record.cover.hoverSrc}
                width={record.cover.width}
                height={record.cover.height}
                alt={record.cover.alt}
              />

              <h2 className="mt-6 font-mono text-xs leading-relaxed tracking-wide text-zinc-900">
                {record.title}
              </h2>
              <p className="font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-500">
                {record.artist} · {record.year}
              </p>

              <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1.5 font-mono text-xs font-light leading-relaxed tracking-wide">
                {record.details.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-[10px] tracking-[0.08em] text-zinc-400">
                      {label}
                    </dt>
                    <dd className="text-zinc-600">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </li>
        ))}
      </ol>
    </NoteShell>
  );
}
