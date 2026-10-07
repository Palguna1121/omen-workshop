import Link from "next/link";
import { Experience } from "@/ui/Experience";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";

export default function HomePage() {
  return (
    <>
      <Experience />
      <section className="sr-only" aria-label="Ringkasan portfolio">
        <h2>Portfolio {profile.name}</h2>
        <p>{profile.about}</p>
        {projects.map((project) => (
          <article key={project.slug}>
            <h3>
              <Link href={`/projects/${project.slug}`}>{project.name}</Link>
            </h3>
            <p>{project.description}</p>
          </article>
        ))}
        <Link href="/portfolio">Baca portfolio lengkap</Link>
      </section>
      <noscript>
        <div className="no-script-card">
          <h1>Workshop Palguna</h1>
          <p>{profile.about}</p>
          <Link href="/portfolio">Buka portfolio tanpa JavaScript →</Link>
        </div>
      </noscript>
    </>
  );
}
