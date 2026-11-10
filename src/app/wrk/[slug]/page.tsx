import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectNote } from "@/components/work/project";
import { noteViewport, pageMetadata } from "@/lib/notes";
import { projectBySlug, projects } from "@/lib/work";

// A project's own address: what a share, a refresh or a search lands on.
export const viewport = noteViewport;
export const dynamicParams = false;
export const generateStaticParams = () =>
  projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};
  return pageMetadata(project.name, `/wrk/${project.slug}`, project.summary);
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();
  return <ProjectNote project={project} />;
}
