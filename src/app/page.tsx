import { preload } from "react-dom";
import { Experience } from "@/ui/Experience";

export default function HomePage() {
  // Model mulai diunduh bersamaan dengan JavaScript, bukan setelahnya.
  // crossOrigin cocok dengan fetch GLTFLoader agar unduhan dipakai ulang.
  preload("/models/omen-character.glb", { as: "fetch", crossOrigin: "anonymous" });
  preload("/models/world/kit.glb", { as: "fetch", crossOrigin: "anonymous" });
  return (
    <>
      <Experience />
      <section className="sr-only" aria-label="Tentang Workshop Omen">
        <h2>Workshop Omen</h2>
        <p>
          Dunia 3D untuk dijelajahi: rumah, garasi, dan halaman Omen di atas
          bukit saat matahari terbenam. Duduk di sofa, nyalakan radio dan PC,
          lewati portal ke atap, dan temukan delapan kristal yang tersembunyi.
        </p>
      </section>
      <noscript>
        <div className="no-script-card">
          <h1>Workshop Omen</h1>
          <p>Dunia 3D ini membutuhkan JavaScript dan WebGL.</p>
        </div>
      </noscript>
    </>
  );
}
