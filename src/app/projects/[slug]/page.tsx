import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { WebLayout } from "@/ui/WebLayout";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);
  return {
    title: project?.name ?? "Proyek tidak ditemukan",
    description: project?.description,
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);
  if (!project) notFound();
  return (
    <WebLayout active="/projects">
      <Link className="quiet-link back-link" href="/projects">
        ← Semua proyek
      </Link>
      <header className="web-hero project-hero">
        <span className="eyebrow">
          {project.index} / {project.category}
        </span>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </header>
      <div
        className="project-cover"
        style={{ backgroundColor: project.color }}
        aria-hidden="true"
      >
        <span>{project.name}</span>
        <div className={`project-art art-${project.slug}`}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <section className="web-section">
        <h2>Tentang proyek</h2>
        <p className="detail-copy">{project.description}</p>
        <div className="project-actions">
          {project.url && (
            <a
              className="button button-dark"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat proyek ↗
            </a>
          )}
          {project.repository && (
            <a
              className="quiet-link"
              href={project.repository}
              target="_blank"
              rel="noopener noreferrer"
            >
              Kode sumber ↗
            </a>
          )}
        </div>
      </section>
    </WebLayout>
  );
}
