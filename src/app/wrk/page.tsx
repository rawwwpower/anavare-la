import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { projects } from "@/lib/work";
import { pageMetadata } from "@/lib/notes";
import { NoteShell } from "@/components/note-shell";
import { FRAKTUR_TITLE, frakturTitles } from "@/lib/fraktur-titles";
import { ACCENT } from "@/lib/accent";

export const metadata: Metadata = pageMetadata(
  "wrk",
  "/wrk",
  "Mis diseños, en trabajos anteriores y actuales.",
);

// The same row as a /rndm entry: the name, and a mono line under it.
const projectClassName =
  "group -ml-3 flex min-h-11 flex-col justify-start gap-1 px-3 transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function WrkPage() {
  return (
    <NoteShell
      title="wrk"
      titleAria="Trabajo — Ana Varela"
      titleClassName={`${frakturTitles.className} ${FRAKTUR_TITLE}`}
      exitTo="/"
      exitLabel="back"
      dismiss="right"
      tone="dark"
      exitTint={ACCENT}
    >
      <ul className="flex flex-col">
        {projects.map((project, i) => (
          <li
            key={project.slug}
            className="reveal"
            style={
              {
                "--reveal-delay": `${60 + Math.min(i, 5) * 45}ms`,
              } as CSSProperties
            }
          >
            <Link href={`/wrk/${project.slug}`} className={projectClassName}>
              <span className="text-base text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition-colors duration-150 ease-out group-hover:text-accent group-hover:decoration-accent">
                {project.name}
              </span>
              <span className="font-mono text-[10px] tracking-[0.08em] text-zinc-500 transition-colors duration-150 ease-out group-hover:text-zinc-400">
                {project.year} · {project.role}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </NoteShell>
  );
}
