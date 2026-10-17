import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Color, Group, MathUtils, MeshBasicMaterial } from "three";
import { useGameStore } from "@/store/gameStore";
import { spots } from "../config";
import { iconPaths } from "@/ui/Icon";
import { hotspotTexture } from "./textures";

/**
 * Ikon gelembung neon di atas setiap stasiun (gaya referensi isometrik).
 * Stasiun terdekat disembunyikan karena diganti tombol HTML yang bisa diklik.
 */
export function Hotspots() {
  const phase = useGameStore((s) => s.phase);
  const groups = useRef<(Group | null)[]>([]);
  const materials = useMemo(
    () =>
      spots.map(
        (spot) =>
          new MeshBasicMaterial({
            map: hotspotTexture(iconPaths[spot.icon], spot.color),
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            color: new Color(1.6, 1.6, 1.6),
          }),
      ),
    [],
  );
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    const reduced = useGameStore.getState().reducedMotion;
    groups.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = spots[i].iconHeight + (reduced ? 0 : Math.sin(t * 1.6 + i) * 0.06);
      // Memudar saat kamera terlalu dekat agar ikon tidak menutupi layar.
      const d = camera.position.distanceTo(g.position);
      const fade = MathUtils.smoothstep(d, 1.6, 3.2);
      materials[i].opacity = fade;
      const state = useGameStore.getState();
      g.visible = fade > 0.02 && !state.seated && (state.phase !== "playing" || state.nearest !== spots[i].id);
    });
  });
  if (phase === "loading") return null;
  return (
    <>
      {spots.map((spot, i) => (
        <group
          key={spot.id}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={[spot.position[0], spot.iconHeight, spot.position[2]]}
        >
          <Billboard>
            <mesh material={materials[i]} renderOrder={5}>
              <planeGeometry args={[0.5, 0.586]} />
            </mesh>
          </Billboard>
        </group>
      ))}
    </>
  );
}
