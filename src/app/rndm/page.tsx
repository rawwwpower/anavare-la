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
          same pixel and leave the page the same way. The index sits beside
          the home page rather than on top of it, so it leaves sideways. */}
      <NoteShell
        title="rndm"
        titleAria="Notas — Ana Varela"
        exitTo="/"
        exitLabel="back"
        dismiss="right"
      >
        <ul className="flex flex-col">
          {ordered.map((note, i) => (
            // The list is the page's content, so it staggers item by item
            // rather than arriving as one block. The cap matters as the list
            // grows: a stagger that keeps adding delay turns into a wait.
            <li
              key={note.slug}
              className="reveal"
              style={
                {
                  "--reveal-delay": `${60 + Math.min(i, 5) * 45}ms`,
                } as CSSProperties
              }
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
