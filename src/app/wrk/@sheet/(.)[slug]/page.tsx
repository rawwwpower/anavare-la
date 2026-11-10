import { notFound } from "next/navigation";
import { NoteSheet } from "@/components/note-sheet";
import { ProjectNote } from "@/components/work/project";
import { noteViewport } from "@/lib/notes";
import { projectBySlug, projects } from "@/lib/work";

// A project opened from the index: a sheet that can be lifted to the whole
// screen by scrolling it.
export const viewport = noteViewport;
export const dynamicParams = false;
export const generateStaticParams = () =>
  projects.map((p) => ({ slug: p.slug }));

export default async function ProjectSheet({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();
  return (
    <NoteSheet title={project.name} expands>
      <ProjectNote project={project} />
    </NoteSheet>
  );
}
