import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial } from "three";
import { useGameStore } from "@/store/gameStore";
import type { Vec3 } from "../config";
import { Block } from "./Primitives";
import { palette, surface } from "./palette";
import { neonSignTexture, puffTexture } from "./textures";

/** Papan neon di atas sofa, menghadap +x (ke dalam ruangan). */
export function NeonSign({ position }: { position: Vec3 }) {
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: neonSignTexture(),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        color: new Color(2.4, 2.4, 2.4),
      }),
    [],
  );
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (useGameStore.getState().reducedMotion) return;
    // Kedip neon sesekali, seperti tabung gas tua.
    const t = clock.elapsedTime;
    const flicker = Math.sin(t * 23) > 0.97 && Math.sin(t * 0.7) > 0.6 ? 0.55 : 1;
    material.color.setScalar(2.4 * flicker);
  });
  return (
    <mesh ref={mesh} position={position} rotation={[0, Math.PI / 2, 0]} material={material}>
      <planeGeometry args={[2.1, 1.05]} />
    </mesh>
  );
}

/** Kipas plafon berputar pelan. */
export function CeilingFan({ position }: { position: Vec3 }) {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (blades.current && !useGameStore.getState().reducedMotion)
      blades.current.rotation.y += delta * 2.2;
  });
  const wood = surface({ color: palette.woodWarm, roughness: 0.7 });
  return (
    <group position={position}>
      <Block position={[0, -0.18, 0]} size={[0.04, 0.36, 0.04]} color={palette.steel} />
      <mesh position={[0, -0.4, 0]} material={surface({ color: palette.steel, metalness: 0.5, roughness: 0.4 })}>
        <cylinderGeometry args={[0.13, 0.16, 0.16, 16]} />
      </mesh>
      <group ref={blades} position={[0, -0.44, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0.08]} position={[Math.cos((i * Math.PI) / 2) * 0.5, 0, -Math.sin((i * Math.PI) / 2) * 0.5]} material={wood}>
            <boxGeometry args={[0.75, 0.02, 0.16]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Tiga gumpal uap naik dan memudar dari cangkir. */
export function Steam({ position }: { position: Vec3 }) {
  const puffs = useMemo(
    () =>
      [0, 1, 2].map(
        () =>
          new MeshBasicMaterial({
            map: puffTexture(),
            transparent: true,
            depthWrite: false,
            side: DoubleSide,
            color: "#fff4ea",
            opacity: 0,
          }),
      ),
    [],
  );
  const group = useRef<Group>(null);
  useFrame(({ clock, camera }) => {
    const g = group.current;
    if (!g) return;
    const reduced = useGameStore.getState().reducedMotion;
    g.children.forEach((child, i) => {
      const k = reduced ? 0.4 : (clock.elapsedTime * 0.35 + i / 3) % 1;
      child.position.set(Math.sin(k * 6 + i) * 0.03, k * 0.45, 0);
      child.scale.setScalar(0.08 + k * 0.14);
      child.quaternion.copy(camera.quaternion);
      puffs[i].opacity = Math.sin(k * Math.PI) * 0.35;
    });
  });
  return (
    <group ref={group} position={position}>
      {puffs.map((material, i) => (
        <mesh key={i} material={material}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
