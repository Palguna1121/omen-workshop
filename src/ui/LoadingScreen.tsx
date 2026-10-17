import { useProgress } from "@react-three/drei";
import { useGameStore } from "@/store/gameStore";

const stages = ["Memuat mesin 3D", "Memuat Omen & dunia", "Menyalakan lentera"] as const;

/**
 * Tampilan loading bertahap: setiap tahap memakai progres nyata bila ada.
 * Tahap 1 (unduh JavaScript) tidak punya progres terukur → bar indeterminate.
 */
export function LoadingView({
  stage,
  progress,
  detail,
}: {
  stage: 0 | 1 | 2;
  progress?: number;
  detail?: string;
}) {
  const known = progress !== undefined;
  return (
    <div className="loading-screen dusk-loading" role="status" aria-live="polite">
      <div className="loading-house" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="eyebrow">Workshop Omen</span>
      <h2>{stages[stage]}…</h2>
      <p>{detail ?? "Matahari hampir terbenam di bukit."}</p>
      <div
        className={known ? "loading-track" : "loading-track indeterminate"}
        role="progressbar"
        aria-label={stages[stage]}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={known ? Math.round(progress) : undefined}
      >
        <span style={known ? { width: `${Math.max(4, progress)}%` } : undefined} />
      </div>
      <ol className="loading-steps" aria-label="Tahap memuat">
        {stages.map((label, i) => (
          <li key={label} className={i < stage ? "done" : i === stage ? "active" : ""}>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Tahap 2–3: aset 3D (useProgress), lalu kompilasi shader & frame pertama. */
export function LoadingScreen() {
  const phase = useGameStore((s) => s.phase);
  const { progress, active, loaded, total } = useProgress();
  if (phase !== "loading" && !(phase === "ready" && active)) return null;
  const assetsDone = !active && progress >= 100;
  return assetsDone ? (
    <LoadingView stage={2} progress={100} detail="Menyiapkan shader dan cahaya pertama." />
  ) : (
    <LoadingView stage={1} progress={progress} detail={total ? `${loaded} dari ${total} berkas · ${Math.round(progress)}%` : undefined} />
  );
}
