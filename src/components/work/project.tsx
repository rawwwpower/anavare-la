import type { CSSProperties } from "react";
import { NoteShell } from "@/components/note-shell";
import type { Project } from "@/lib/work";

const stagger = (i: number) =>
  ({ "--reveal-delay": `${60 + i * 45}ms` }) as CSSProperties;

// A project, as its own page or carried by the sheet. Long on purpose for
// now: the placeholder blocks stand in for the images a real project will
// have, so the sheet has something to lift over.
export function ProjectNote({ project }: { project: Project }) {
  return (
    <NoteShell
      title={project.name}
      titleAria={`${project.name} — trabajo de Ana Varela`}
      exitTo="/wrk"
    >
      <article className="max-w-xl">
        <p
          className="reveal font-mono text-[10px] tracking-[0.08em] text-zinc-500"
          style={stagger(0)}
        >
          {project.year} · {project.role}
        </p>
        <p className="reveal mt-4 max-w-md text-base leading-relaxed" style={stagger(1)}>
          {project.summary}
        </p>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden
            className="reveal mt-8 aspect-[4/3] w-full rounded-sm bg-black/[0.06]"
            style={stagger(2 + i)}
          />
        ))}
        <p className="mt-8 max-w-md text-base leading-relaxed">
          Fin del proyecto de prueba.
        </p>
      </article>
    </NoteShell>
  );
}
