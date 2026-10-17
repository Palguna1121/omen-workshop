import { Html } from "@react-three/drei";
import type { Spot } from "../config";
import { useGameStore } from "@/store/gameStore";
import { Icon } from "@/ui/Icon";
import { interact } from "./actions";

/** Tombol HTML di atas spot terdekat: bisa diklik/ditap selain tombol E. */
export function Interactable({ spot }: { spot: Spot }) {
  const active = useGameStore(
    (s) =>
      s.nearest === spot.id &&
      s.phase === "playing" &&
      !s.menuOpen &&
      !s.seated,
  );
  if (!active) return null;
  return (
    <Html
      position={[spot.position[0], spot.iconHeight - 0.85, spot.position[2]]}
      center
      zIndexRange={[10, 0]}
    >
      <button
        className="world-marker"
        onClick={() => interact(spot.id)}
        aria-label={`${spot.verb}: ${spot.object}`}
        style={{ ["--marker" as string]: spot.color }}
      >
        <span className="marker-icon" aria-hidden="true">
          <Icon name={spot.icon} size={16} />
        </span>
        {spot.verb}
        <kbd>E</kbd>
      </button>
    </Html>
  );
}
