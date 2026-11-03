import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { pageMetadata } from "@/lib/notes";
import { NoteShell } from "@/components/note-shell";
import { FRAKTUR_TITLE, frakturTitles } from "@/lib/fraktur-titles";

// The record library: the home page's "A" opens it. Empty for now — how the
// records get shown (a list, a crate of covers, fichas one after another)
// is still Ana's call, so the page only says it is coming.
export const metadata: Metadata = pageMetadata(
  "A",
  "/a",
  "Mi biblioteca de discos. Por ahora, vacía.",
);

export default function LibraryPage() {
  // The same shell as the /rndm index: the home page's dark ground, its
  // title in the blackletter, "back" on the same pixel, leaving sideways.
  return (
    <NoteShell
      title="A"
      titleAria="Biblioteca de discos — Ana Varela"
      titleClassName={`${frakturTitles.className} ${FRAKTUR_TITLE}`}
      exitTo="/"
      exitLabel="back"
      dismiss="right"
      tone="dark"
    >
      <p
        className="reveal max-w-md text-base leading-relaxed text-zinc-400"
        style={{ "--reveal-delay": "60ms" } as CSSProperties}
      >
        Acá va a vivir mi biblioteca de discos. Por ahora está vacía: los
        primeros ya vienen en camino.
      </p>
    </NoteShell>
  );
}
