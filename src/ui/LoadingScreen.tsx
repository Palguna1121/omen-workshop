import Link from "next/link";
import { useProgress } from "@react-three/drei";
import { useGameStore } from "@/store/gameStore";

export function LoadingScreen() {
  const phase = useGameStore((s) => s.phase);
  const { progress, active } = useProgress();
  if (phase !== "loading" && !(phase === "ready" && active)) return null;
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-house" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="eyebrow">Palguna · Workshop</span>
      <h2>Menyalakan lampu...</h2>
      <p>Menyiapkan ruang untuk ide-ide kecil.</p>
      <div
        className="loading-track"
        role="progressbar"
        aria-label="Memuat dunia"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${Math.max(5, progress)}%` }} />
      </div>
      <Link href="/portfolio" className="quiet-link">
        Buka portfolio langsung <span>↗</span>
      </Link>
    </div>
  );
}
