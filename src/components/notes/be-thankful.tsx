import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HoverArtwork } from "@/components/hover-artwork";
import { NoteShell } from "@/components/note-shell";
import { vault } from "@/lib/vault";

// The vault's first room. Named for the track that opens it, so the note
// starts with the first record: its own cover takes the corner, and looking
// closer turns it over to the tracklist where the name comes from.
export const beThankfulMetadata: Metadata = {
  title: "be thankful for what you’ve got",
  alternates: { canonical: "/rndm/be-thankful" },
};

const number = (i: number) => `nº ${String(i + 1).padStart(3, "0")}`;

export function BeThankfulNote() {
  const [first] = vault;

  return (
    <NoteShell
      title="be thankful for what you’ve got"
      titleAria="Be thankful for what you’ve got — vault de vinilos"
      artwork={
        <HoverArtwork
          defaultSrc={first.cover.src}
          hoverSrc={first.cover.hoverSrc}
          width={first.cover.width}
          height={first.cover.height}
          alt={first.cover.alt}
        />
      }
    >
      <p
        className="reveal max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600"
        style={{ "--reveal-delay": "60ms" } as CSSProperties}
      >
        Acá empieza mi vault de vinilos.
      </p>

      <ol className="mt-10 flex flex-col gap-10">
        {vault.map((record, i) => (
          // Same stagger rule as the index: capped, so a long vault never
          // turns its own entrance into a wait.
          <li
            key={`${record.artist}-${record.title}`}
            className="reveal max-w-md"
            style={
              {
                "--reveal-delay": `${105 + Math.min(i, 5) * 45}ms`,
              } as CSSProperties
            }
          >
            <article aria-label={`${record.artist} — ${record.title}`}>
              <p className="font-mono text-[10px] tracking-[0.08em] text-zinc-400">
                {number(i)}
              </p>
              <h2 className="mt-2 text-base font-semibold tracking-tight text-zinc-900">
                {record.title}
              </h2>
              <p className="text-base tracking-tight text-zinc-500">
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
