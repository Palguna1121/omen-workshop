import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, MeshStandardMaterial, type PointLight } from "three";
import { useGameStore } from "@/store/gameStore";
import { useSettings } from "@/store/settingsStore";
import type { Vec3 } from "../config";
import { Block } from "./Primitives";
import { glow, palette, surface } from "./palette";
import { latticeTexture } from "./textures";

/**
 * Point light dengan prioritas: kualitas ringan hanya menyalakan lampu utama.
 * Flicker kecil membuat lentera terasa hidup.
 */
export function Lamp({
  position,
  color = palette.amber,
  intensity = 6,
  distance = 7,
  essential = false,
  flicker = 0.06,
}: {
  position: Vec3;
  color?: string;
  intensity?: number;
  distance?: number;
  essential?: boolean;
  flicker?: number;
}) {
  const light = useRef<PointLight>(null);
  const extraLights = useSettings((s) => s.graphics.extraLights);
  const seed = useMemo(() => position[0] * 3.1 + position[2] * 1.7, [position]);
  useFrame(({ clock }) => {
    if (!light.current || !flicker || useGameStore.getState().reducedMotion) return;
    const t = clock.elapsedTime * 3 + seed;
    light.current.intensity =
      intensity * (1 - flicker + flicker * (Math.sin(t) * 0.5 + Math.sin(t * 2.7) * 0.3 + 0.8) * 0.62);
  });
  if (!extraLights && !essential) return null;
  return (
    <pointLight
      ref={light}
      position={position}
      color={color}
      intensity={intensity}
      distance={distance}
      decay={2}
    />
  );
}

let rattan: MeshStandardMaterial | null = null;
function rattanMaterial() {
  if (!rattan) {
    const alphaMap = latticeTexture();
    alphaMap.repeat.set(3, 2);
    rattan = new MeshStandardMaterial({
      color: palette.woodWarm,
      roughness: 0.8,
      alphaMap,
      alphaTest: 0.5,
      side: DoubleSide,
    });
  }
  return rattan;
}

/** Lampion rotan gantung: inti menyala di dalam anyaman. */
export function RattanLantern({
  position,
  size = 0.3,
  rope = 0.6,
  color = palette.amber,
}: {
  position: Vec3;
  size?: number;
  rope?: number;
  color?: string;
}) {
  const lattice = rattanMaterial();
  return (
    <group position={position}>
      <Block position={[0, rope / 2 + size, 0]} size={[0.02, rope, 0.02]} color={palette.woodDeep} />
      <mesh material={lattice} scale={[1, 1.25, 1]}>
        <sphereGeometry args={[size, 14, 10]} />
      </mesh>
      <mesh material={glow(color, 4)} scale={[1, 1.2, 1]}>
        <sphereGeometry args={[size * 0.72, 12, 8]} />
      </mesh>
      <Block position={[0, size * 1.25, 0]} size={[size * 0.7, 0.05, size * 0.7]} color={palette.woodDeep} />
      <Block position={[0, -size * 1.25, 0]} size={[size * 0.5, 0.05, size * 0.5]} color={palette.woodDeep} />
    </group>
  );
}

/** Lentera batu di atas pilar dinding halaman. */
export function PillarLantern({
  position,
  pillarHeight = 1.1,
}: {
  position: Vec3;
  pillarHeight?: number;
}) {
  return (
    <group position={position}>
      <Block position={[0, pillarHeight / 2, 0]} size={[0.62, pillarHeight, 0.62]} color={palette.stone} />
      <Block position={[0, pillarHeight + 0.05, 0]} size={[0.74, 0.1, 0.74]} color={palette.stoneDark} />
      <group position={[0, pillarHeight + 0.1, 0]}>
        <Block position={[0, 0.03, 0]} size={[0.44, 0.06, 0.44]} color={palette.woodDeep} />
        <Block position={[0, 0.27, 0]} size={[0.3, 0.42, 0.3]} glowColor={palette.amber} glowIntensity={4.5} />
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Block key={`${x}${z}`} position={[x * 0.18, 0.27, z * 0.18]} size={[0.05, 0.48, 0.05]} color={palette.woodDeep} />
          )),
        )}
        <Block position={[0, 0.53, 0]} size={[0.46, 0.06, 0.46]} color={palette.woodDeep} />
        <mesh position={[0, 0.64, 0]} rotation={[0, Math.PI / 4, 0]} material={surface(palette.roof)} castShadow>
          <coneGeometry args={[0.32, 0.18, 4]} />
        </mesh>
      </group>
    </group>
  );
}

/** Lampu dinding vertikal hangat seperti di samping pintu referensi. */
export function WallSconce({
  position,
  rotation = [0, 0, 0],
  height = 0.9,
  color = palette.amber,
}: {
  position: Vec3;
  rotation?: Vec3;
  height?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Block size={[0.22, height + 0.12, 0.06]} color={palette.woodDeep} />
      <Block position={[0, 0, 0.05]} size={[0.12, height, 0.06]} glowColor={color} glowIntensity={4} />
    </group>
  );
}

/** Rangkaian bohlam pada kabel melengkung antara dua titik. */
export function StringLights({
  from,
  to,
  sag = 0.35,
  count = 12,
  color = "#ffd08a",
}: {
  from: Vec3;
  to: Vec3;
  sag?: number;
  count?: number;
  color?: string;
}) {
  const points = useMemo(
    () =>
      Array.from({ length: count + 1 }, (_, i) => {
        const t = i / count;
        return [
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag,
          from[2] + (to[2] - from[2]) * t,
        ] as Vec3;
      }),
    [from, to, sag, count],
  );
  const wire = surface("#2a2026");
  return (
    <group>
      {points.slice(0, -1).map((p, i) => {
        const q = points[i + 1];
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        const dz = q[2] - p[2];
        const len = Math.hypot(dx, dy, dz);
        const yaw = Math.atan2(-dz, dx);
        const pitch = Math.atan2(dy, Math.hypot(dx, dz));
        return (
          <mesh
            key={`w${i}`}
            material={wire}
            position={[(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]}
            rotation={[0, yaw, pitch]}
          >
            <boxGeometry args={[len, 0.015, 0.015]} />
          </mesh>
        );
      })}
      {points.map((p, i) => (
        <mesh key={`b${i}`} position={[p[0], p[1] - 0.07, p[2]]} material={glow(color, 5)}>
          <sphereGeometry args={[0.045, 6, 4]} />
        </mesh>
      ))}
    </group>
  );
}
