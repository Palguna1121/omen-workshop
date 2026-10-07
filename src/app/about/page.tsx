import type { Metadata } from "next";
import { WebLayout } from "@/ui/WebLayout";
import { PortfolioContent } from "@/ui/PortfolioContent";

export const metadata: Metadata = { title: "Tentang" };
export default function AboutPage() {
  return (
    <WebLayout active="/about">
      <header className="web-hero">
        <span className="eyebrow">Catatan dari sudut santai</span>
        <h1>
          Orang di balik
          <br />
          <em>workshop ini.</em>
        </h1>
      </header>
      <PortfolioContent section="about" />
    </WebLayout>
  );
}
