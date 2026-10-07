import type { Metadata } from "next";
import { WebLayout } from "@/ui/WebLayout";
import { PortfolioContent } from "@/ui/PortfolioContent";
import { profile } from "@/data/profile";

export const metadata: Metadata = { title: "Portfolio" };
export default function PortfolioPage() {
  return (
    <WebLayout>
      <header className="web-hero">
        <span className="eyebrow">
          <i className="status-dot" /> Portfolio / {profile.location}
        </span>
        <h1>
          Membangun hal
          <br />
          yang <em>berarti.</em>
        </h1>
        <p>{profile.about}</p>
      </header>
      <section className="web-section">
        <div className="section-heading">
          <span className="eyebrow">01 / PILIHAN DARI WORKSHOP</span>
          <h2>Beberapa yang saya bangun.</h2>
        </div>
        <PortfolioContent section="projects" />
      </section>
      <section className="web-section">
        <div className="section-heading">
          <span className="eyebrow">02 / PERALATAN SAYA</span>
          <h2>Dari kode ke pengalaman.</h2>
        </div>
        <PortfolioContent section="skills" />
      </section>
      <section className="web-section">
        <div className="section-heading">
          <span className="eyebrow">03 / CERITA SAYA</span>
          <h2>Selalu ada hal baru.</h2>
        </div>
        <PortfolioContent section="experience" />
      </section>
    </WebLayout>
  );
}
