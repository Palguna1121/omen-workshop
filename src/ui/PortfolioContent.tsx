import Link from "next/link";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { skillGroups } from "@/data/skills";
import { experiences, journey } from "@/data/experiences";
import type { SectionId } from "@/game/config";
import { Icon } from "./Icon";

export function ProjectList({ featured = false }: { featured?: boolean }) {
  return (
    <div className="project-list">
      {(featured ? projects.slice(0, 1) : projects).map((project) => (
        <Link
          href={`/projects/${project.slug}`}
          key={project.slug}
          className="project-card"
        >
          <div
            className="project-illustration"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          >
            <span className="project-number">{project.index}</span>
            <div className={`project-art art-${project.slug}`}>
              <span />
              <span />
              <span />
            </div>
            <span className="project-category">{project.category}</span>
          </div>
          <div className="project-caption">
            <h3>{project.name}</h3>
            <Icon name="arrow" />
          </div>
          <p>{project.description}</p>
          <div className="tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PortfolioContent({ section }: { section: SectionId }) {
  switch (section) {
    case "projects":
      return <ProjectList />;
    case "featured":
      return (
        <>
          <p className="panel-intro">
            Satu pintu masuk ke ide yang sedang dibangun.
          </p>
          <ProjectList featured />
        </>
      );
    case "skills":
      return (
        <div className="skill-groups">
          {skillGroups.map((group, i) => (
            <div key={group.name}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{group.name}</h3>
              <div className="tags">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "experience":
      return (
        <>
          <p className="panel-intro">
            Beberapa bidang yang saya kerjakan dan terus eksplorasi.
          </p>
          <div className="story-list">
            {experiences.map((item, i) => (
              <article key={item.title}>
                <span className="story-index">0{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      );
    case "journey":
      return (
        <div className="story-list">
          {journey.map((item, i) => (
            <article key={item.title}>
              <span className="story-index">0{i + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      );
    case "about":
      return (
        <>
          <div className="about-mark" aria-hidden="true">
            P.
          </div>
          <span className="eyebrow">Halo, saya {profile.name}</span>
          <p className="about-prose">{profile.about}</p>
          <div className="about-meta">
            <span>{profile.title}</span>
            <span>{profile.location}</span>
          </div>
          {profile.contact && (
            <a
              className="button button-dark"
              href={`mailto:${profile.contact}`}
            >
              Mari berbincang <Icon name="arrow" />
            </a>
          )}
        </>
      );
  }
}
