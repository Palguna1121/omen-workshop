import type { Metadata } from "next";
import { WebLayout } from "@/ui/WebLayout";
import { ProjectList } from "@/ui/PortfolioContent";

export const metadata: Metadata = { title: "Proyek" };
export default function ProjectsPage() {
  return (
    <WebLayout active="/projects">
      <header className="web-hero">
        <span className="eyebrow">Catatan dari meja kerja</span>
        <h1>
          Ide, bertemu
          <br />
          <em>eksekusi.</em>
        </h1>
        <p>Aplikasi, pengalaman, dan eksperimen yang saya kerjakan.</p>
      </header>
      <ProjectList />
    </WebLayout>
  );
}
