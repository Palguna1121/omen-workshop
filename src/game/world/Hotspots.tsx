import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Color, Group, MathUtils, MeshBasicMaterial } from "three";
import { useGameStore } from "@/store/gameStore";
import { stations } from "../config";
import { iconPaths } from "@/ui/Icon";
import { hotspotTexture } from "./textures";

/**
 * Ikon gelembung neon di atas setiap stasiun (gaya referensi isometrik).
 * Stasiun terdekat disembunyikan karena diganti tombol HTML yang bisa diklik.
 */
export function Hotspots() {
  const phase = useGameStore((s) => s.phase);
  const visited = useGameStore((s) => s.visited);
  const groups = useRef<(Group | null)[]>([]);
  const materials = useMemo(
    () =>
      stations.map(
        (station) =>
          new MeshBasicMaterial({
            map: hotspotTexture(iconPaths[station.icon], station.color),
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
      g.position.y = stations[i].iconHeight + (reduced ? 0 : Math.sin(t * 1.6 + i) * 0.06);
      // Memudar saat kamera terlalu dekat agar ikon tidak menutupi layar.
      const d = camera.position.distanceTo(g.position);
      const fade = MathUtils.smoothstep(d, 1.6, 3.2);
      materials[i].opacity = fade;
      g.visible = fade > 0.02 && (useGameStore.getState().phase !== "playing" || useGameStore.getState().nearest !== stations[i].id);
    });
  });
  if (phase === "loading") return null;
  return (
    <>
      {stations.map((station, i) => (
        <group
          key={station.id}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={[station.position[0], station.iconHeight, station.position[2]]}
        >
          <Billboard>
            <mesh material={materials[i]} scale={visited.includes(station.id) ? 0.85 : 1} renderOrder={5}>
              <planeGeometry args={[0.5, 0.586]} />
            </mesh>
          </Billboard>
        </group>
      ))}
    </>
  );
}
