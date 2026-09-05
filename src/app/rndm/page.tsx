import Link from "next/link";
import { notes, formatNoteShort } from "@/lib/notes";

const backClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-900 hover:decoration-zinc-600 active:scale-[0.97] focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

const noteClassName =
  "group -ml-3 flex min-h-11 flex-col justify-start gap-1 px-3 font-mono transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function RndmPage() {
  const ordered = [...notes].reverse();

  return (
    <main
      className="flex min-h-svh flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <div className="mx-auto flex w-full flex-1 flex-col">
        <h1 className="sr-only">Notas — Ana Varela</h1>
        <ul className="flex flex-col">
          {ordered.map((note) => (
            <li key={note.slug}>
              <Link href={`/rndm/${note.slug}`} className={noteClassName}>
                <span className="text-sm text-zinc-700 underline decoration-zinc-400 underline-offset-4 transition-colors group-hover:text-zinc-900 group-hover:decoration-zinc-600">
                  {note.label}
                </span>
                <span className="text-[10px] tracking-[0.08em] text-zinc-500 transition-colors group-hover:text-zinc-700">
                  {formatNoteShort(note)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        <nav aria-label="Back">
          <Link href="/" className={backClassName}>
            back
          </Link>
        </nav>
      </div>
    </main>
  );
}
