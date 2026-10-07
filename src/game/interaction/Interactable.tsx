import { Html } from "@react-three/drei";
import { stations } from "../config";
import { useGameStore } from "@/store/gameStore";

export function Interactable({
  station,
}: {
  station: (typeof stations)[number];
}) {
  const active = useGameStore(
    (s) =>
      s.nearest === station.id &&
      s.phase === "playing" &&
      !s.section &&
      !s.menuOpen,
  );
  if (!active) return null;
  return (
    <Html
      position={[station.position[0], 2.7, station.position[2]]}
      center
      zIndexRange={[10, 0]}
    >
      <button
        className="world-marker"
        onClick={() => useGameStore.getState().openSection(station.id)}
        aria-label={`Buka ${station.title}`}
      >
        <span className="marker-dot" style={{ background: station.color }} />
        {station.title}
        <span className="marker-arrow">↗</span>
      </button>
    </Html>
  );
}
