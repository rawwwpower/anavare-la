import type { CSSProperties } from "react";
import { NoteShell } from "@/components/note-shell";
import type { Project } from "@/lib/work";

const stagger = (i: number) =>
  ({ "--reveal-delay": `${60 + i * 45}ms` }) as CSSProperties;

// The ficha's grid, the vinyl note's (be-thankful.tsx): a hairline frame, a
// hairline between rows, labels and values on two shared edges.
const FICHA_ROW =
  "grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-b-[0.5px] border-black/30 px-3 py-2.5 last:border-b-0";

// A project, as its own page or carried by the sheet: title and the line
// under it, what it is and what it solves, the image, the ficha.
export function ProjectNote({ project }: { project: Project }) {
  return (
    <NoteShell
      title={project.name}
      titleAria={`${project.name} — trabajo de Ana Varela`}
      exitTo="/wrk"
    >
      {/* The title block reserves the heading's height, so the year and
          client sit just under it, pulled up into that block. */}
      <article className="-mt-12 max-w-xl sm:-mt-14">
        <p
          className="reveal font-mono text-[10px] tracking-[0.08em] text-zinc-500"
          style={stagger(0)}
        >
          {project.year} · {project.client}
        </p>

        <p
          className="reveal mt-10 max-w-md text-base leading-relaxed"
          style={stagger(1)}
        >
          {project.summary}
        </p>

        {/* PENDIENTE: la imagen del proyecto. */}
        <div
          aria-hidden
          className="reveal mt-8 aspect-[4/5] w-full rounded-sm bg-black/[0.06] sm:aspect-[4/3]"
          style={stagger(2)}
        />

        <div
          className="reveal mt-8 max-w-md border-[0.5px] border-black/30 font-mono text-xs leading-relaxed tracking-wide"
          style={stagger(3)}
        >
          <dl>
            {project.ficha.map((row) => (
              <div key={row.label} className={FICHA_ROW}>
                <dt className="text-[10px] tracking-[0.08em] text-black/60">
                  {row.label}
                </dt>
                <dd className="text-black">
                  {row.href ? (
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-black/30 underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:decoration-accent"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </NoteShell>
  );
}
