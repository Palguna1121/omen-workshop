import type { Metadata } from "next";
import { WebLayout } from "@/ui/WebLayout";
import { PortfolioContent } from "@/ui/PortfolioContent";

export const metadata: Metadata = { title: "Pengalaman" };
export default function ExperiencePage() {
  return (
    <WebLayout active="/experience">
      <header className="web-hero">
        <span className="eyebrow">Catatan dari rak koleksi</span>
        <h1>
          Terus belajar.
          <br />
          <em>Terus membuat.</em>
        </h1>
      </header>
      <PortfolioContent section="experience" />
      <section className="web-section">
        <h2>Perjalanan</h2>
        <PortfolioContent section="journey" />
      </section>
    </WebLayout>
  );
}
