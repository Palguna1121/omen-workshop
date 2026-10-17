import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGameStore } from "@/store/gameStore";
import { crystals, type Vec3 } from "../config";
import { sfx } from "../audio/sound";
import { runtime } from "../runtime";
import { glow, palette } from "./palette";

const shards: [number, number, number, number, number][] = [
  // x, z, radius, tinggi, kemiringan
  [0, 0, 0.11, 0.42, 0],
  [0.09, 0.03, 0.07, 0.26, -0.4],
  [-0.08, -0.03, 0.065, 0.22, 0.45],
];

/** Satu kristal: gugus kristal melayang, cincin berputar, denyut cahaya. */
function Crystal({ id, position }: { id: string; position: Vec3 }) {
  const group = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const gone = useRef(0);
  const found = useGameStore((s) => s.found.includes(id));
  const [collecting, setCollecting] = useState(false);
  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime + position[0];
    const reduced = useGameStore.getState().reducedMotion;
    if (gone.current > 0) {
      // Animasi diambil: membesar, naik, lalu hilang.
      gone.current += delta;
      const k = gone.current / 0.6;
      g.scale.setScalar(1 + k * 1.5);
      g.position.y = position[1] + k * 0.8;
      if (k >= 1) g.visible = false;
      return;
    }
    if (!reduced) {
      g.position.y = position[1] + Math.sin(t * 2) * 0.07;
      g.rotation.y += delta * 0.8;
      if (ring.current) ring.current.rotation.z += delta * 1.6;
    }
    const state = useGameStore.getState();
    if (state.phase !== "playing" || state.menuOpen) return;
    const dx = runtime.player.x - position[0];
    const dz = runtime.player.z - position[2];
    if (Math.hypot(dx, dz) <= 1.1 && Math.abs(runtime.player.y - position[1]) <= 1.3) {
      if (!state.collect(id)) return;
      gone.current = 0.001;
      setCollecting(true);
      const count = useGameStore.getState().found.length;
      if (count === crystals.length) {
        sfx("complete");
        useGameStore.getState().celebrate();
        useGameStore.getState().say("Semua kristal ditemukan! Lihat ke arah laut.");
      } else {
        sfx("crystal");
        useGameStore.getState().say(`Kristal ${count} dari ${crystals.length} ditemukan.`);
      }
    }
  });
  // Sudah ditemukan di sesi sebelumnya: tidak dirender. Baru diambil: animasi selesai dulu.
  if (found && !collecting) return null;
  return (
    <group ref={group} position={position}>
      {shards.map(([x, z, r, h, tilt], i) => (
        <mesh key={i} position={[x, h / 2 - 0.2, z]} rotation={[0, i, tilt]} scale={[1, h / (r * 2), 1]} material={glow(i ? "#c79bff" : "#a764ff", i ? 2.4 : 3.2)}>
          <octahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
      <group ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh material={glow(palette.cyan, 2.6)}>
          <torusGeometry args={[0.28, 0.008, 4, 40]} />
        </mesh>
      </group>
      <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow("#7b3fe4", 1.2)}>
        <ringGeometry args={[0.12, 0.2, 24]} />
      </mesh>
    </group>
  );
}

/** Kristal tersembunyi; progres tersimpan di localStorage. */
export function Crystals() {
  const round = useGameStore((s) => s.crystalRound);
  return (
    <>
      {crystals.map((c) => (
        <Crystal key={`${c.id}-${round}`} id={c.id} position={c.position} />
      ))}
    </>
  );
}
