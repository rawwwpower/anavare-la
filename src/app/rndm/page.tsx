import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notes, formatNoteShort } from "@/lib/notes";
import { NoteShell } from "@/components/note-shell";

// The root layout's title template ("%s · Ana Varela") was never used, so
// every note shared the home page's title. Each page names itself now.
export const metadata: Metadata = {
  title: "rndm",
  alternates: { canonical: "/rndm" },
};

const noteClassName =
  "group -ml-3 flex min-h-11 flex-col justify-start gap-1 px-3 font-mono transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function RndmPage() {
  const ordered = [...notes].reverse();

  return (
    <main className="flex flex-1 flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]">
      {/* Same shell as a note, so "back" here and "close" there land on the
          same pixel and leave the page the same way. */}
      <NoteShell exitTo="/" exitLabel="back">
        <h1 className="sr-only">Notas — Ana Varela</h1>
        <ul className="flex flex-col">
          {ordered.map((note, i) => (
            // The list is the page's content, so it staggers item by item
            // rather than arriving as one block. 50ms steps stay under the
            // shell's own 120ms exit-link delay however long the list grows.
            <li
              key={note.slug}
              className="reveal"
              style={{ "--reveal-delay": `${i * 50}ms` } as CSSProperties}
            >
              <Link href={`/rndm/${note.slug}`} className={noteClassName}>
                <span className="text-sm text-zinc-700 underline decoration-zinc-400 underline-offset-4 transition-colors duration-150 ease-out group-hover:text-zinc-900 group-hover:decoration-zinc-600">
                  {note.label}
                </span>
                <span className="text-[10px] tracking-[0.08em] text-zinc-500 transition-colors duration-150 ease-out group-hover:text-zinc-700">
                  {formatNoteShort(note)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </NoteShell>
    </main>
  );
}
