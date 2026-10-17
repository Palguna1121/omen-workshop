import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Color, Group, MeshBasicMaterial, type Material, type Texture } from "three";
import { runtime } from "../runtime";
import { useGameStore } from "@/store/gameStore";
import type { Vec3 } from "../config";
import { Banner } from "./House";
import { GARAGE } from "./layout";
import { Lamp, RattanLantern, StringLights } from "./Lanterns";
import { CeilingFan, NeonSign, Steam } from "./Decor";
import { Block } from "./Primitives";
import { glow, palette, surface } from "./palette";
import { KitInstances, type KitItem } from "./Kit";
import { StaticBatch } from "./StaticBatch";
import {
  blueprintTexture,
  posterTexture,
  rugTexture,
} from "./textures";

const screens = new Map<string, MeshBasicMaterial>();
/** Layar menyala: tekstur dikali >1 agar ikut bloom. */
function screen(texture: Texture, intensity = 1.6) {
  const key = `${texture.uuid}|${intensity}`;
  let material = screens.get(key);
  if (!material) {
    material = new MeshBasicMaterial({
      map: texture,
      color: new Color(intensity, intensity, intensity),
      toneMapped: false,
    });
    screens.set(key, material);
  }
  return material;
}

function Plane({
  position,
  size,
  rotation,
  material,
}: {
  position: Vec3;
  size: [number, number];
  rotation?: Vec3;
  material: Material;
}) {
  return (
    <mesh position={position} rotation={rotation} material={material}>
      <planeGeometry args={size} />
    </mesh>
  );
}

/** Figur Omen mini untuk rak: hood ungu, wajah gelap, tiga mata cyan. */
export function Figurine({
  position,
  scale = 1,
  rotationY = 0,
  watch = false,
}: {
  position: Vec3;
  scale?: number;
  rotationY?: number;
  /** Menoleh ke arah Omen bila berada dalam jangkauan. */
  watch?: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    const g = group.current;
    if (!watch || !g || useGameStore.getState().reducedMotion) return;
    const dx = runtime.player.x - position[0];
    const dz = runtime.player.z - position[2];
    const near = Math.hypot(dx, dz) < 6;
    const target = near ? Math.atan2(dx, dz) : rotationY;
    const diff = Math.atan2(Math.sin(target - g.rotation.y), Math.cos(target - g.rotation.y));
    g.rotation.y += diff * (1 - Math.exp(-4 * Math.min(delta, 0.1)));
  });
  return (
    <group ref={group} position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.09, 0]} material={surface({ color: "#2a2433", roughness: 0.7 })} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.18, 8]} />
      </mesh>
      <mesh position={[0, 0.24, 0]} material={surface({ color: palette.purple, roughness: 0.6, flat: true })} castShadow>
        <coneGeometry args={[0.12, 0.26, 6]} />
      </mesh>
      <mesh position={[0, 0.22, 0.045]} material={surface({ color: "#0c0a14", roughness: 0.4 })}>
        <sphereGeometry args={[0.065, 10, 8]} />
      </mesh>
      {[-0.025, 0, 0.025].map((x) => (
        <mesh key={x} position={[x, 0.225, 0.108]} material={glow(palette.cyan, 5)}>
          <boxGeometry args={[0.012, 0.035, 0.005]} />
        </mesh>
      ))}
    </group>
  );
}

function CrystalCluster({ position, scale = 1, color = "#a764ff" }: { position: Vec3; scale?: number; color?: string }) {
  const shards = useMemo(
    () => [
      [0, 0, 0, 0.16, 0.9, 0, 0],
      [0.16, 0, 0.06, 0.11, 0.6, -0.3, 0.2],
      [-0.15, 0, -0.05, 0.1, 0.55, 0.35, -0.1],
      [0.05, 0, 0.17, 0.08, 0.4, 0.2, 0.3],
      [-0.06, 0, -0.18, 0.07, 0.35, -0.25, 0.1],
    ],
    [],
  );
  return (
    <group position={position} scale={scale}>
      {shards.map(([x, , z, r, h, tz, tx], i) => (
        <mesh key={i} position={[x, h / 2, z]} rotation={[tx, i * 0.7, tz]} scale={[1, h / (r * 2), 1]} material={glow(color, i === 0 ? 2.8 : 2.2)}>
          <octahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} material={surface({ color: palette.stoneDark, flat: true })}>
        <dodecahedronGeometry args={[0.22, 0]} />
      </mesh>
    </group>
  );
}

function Book({ position, h = 0.28, color, tilt = 0 }: { position: Vec3; h?: number; color: string; tilt?: number }) {
  return <Block position={[position[0], position[1] + h / 2, position[2]]} rotation={[0, 0, tilt]} size={[0.06, h, 0.22]} color={color} />;
}

function Trophy({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const gold = surface({ color: "#e0a93a", metalness: 0.85, roughness: 0.28 });
  return (
    <group position={position} scale={scale}>
      <Block position={[0, 0.04, 0]} size={[0.16, 0.08, 0.16]} color={palette.woodDeep} />
      <mesh position={[0, 0.13, 0]} material={gold}>
        <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
      </mesh>
      <mesh position={[0, 0.25, 0]} material={gold}>
        <cylinderGeometry args={[0.09, 0.04, 0.16, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.26, 0]} rotation={[0, 0, Math.PI / 2]} material={gold}>
          <torusGeometry args={[0.04, 0.012, 6, 12, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}

/** Tanaman merambat menjuntai dari rak/balok. */
function Vine({ position, length = 1.2, seed = 0 }: { position: Vec3; length?: number; seed?: number }) {
  const count = Math.round(length / 0.09);
  const leaf = surface({ color: palette.leafLight, roughness: 0.8, flat: true });
  const leafDark = surface({ color: palette.leaf, roughness: 0.8, flat: true });
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => {
        const y = -i * 0.09;
        const sway = Math.sin(i * 0.7 + seed) * 0.05;
        return (
          <mesh key={i} position={[sway, y, Math.cos(i * 1.3 + seed) * 0.04]} rotation={[0.3, i * 1.9 + seed, 0.5]} scale={[0.06, 0.035, 0.012]} material={i % 2 ? leaf : leafDark}>
            <sphereGeometry args={[1, 5, 4]} />
          </mesh>
        );
      })}
    </group>
  );
}

function GamingChair({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const shell = surface({ color: "#2a2433", roughness: 0.6 });
  const accent = surface({ color: palette.purple, roughness: 0.55 });
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {Array.from({ length: 5 }, (_, i) => (
        <Block key={i} position={[Math.sin((i / 5) * Math.PI * 2) * 0.22, 0.06, Math.cos((i / 5) * Math.PI * 2) * 0.22]} rotation={[0, (i / 5) * Math.PI * 2, 0]} size={[0.05, 0.05, 0.44]} color={palette.steel} />
      ))}
      <mesh position={[0, 0.3, 0]} material={surface({ color: palette.steelLight, metalness: 0.6, roughness: 0.4 })}>
        <cylinderGeometry args={[0.035, 0.035, 0.45, 8]} />
      </mesh>
      <RoundedBox args={[0.58, 0.12, 0.56]} radius={0.05} position={[0, 0.56, 0]} material={shell} castShadow />
      <RoundedBox args={[0.56, 0.95, 0.12]} radius={0.06} position={[0, 1.08, 0.27]} rotation={[-0.12, 0, 0]} material={shell} castShadow />
      <RoundedBox args={[0.2, 0.8, 0.06]} radius={0.025} position={[0, 1.07, 0.345]} rotation={[-0.12, 0, 0]} material={accent} />
      <mesh position={[0, 1.36, 0.385]} rotation={[-0.12, 0, 0]} material={glow(palette.cyan, 3)}>
        <planeGeometry args={[0.14, 0.1]} />
      </mesh>
      {[-1, 1].map((s) => (
        <Block key={s} position={[s * 0.31, 0.75, 0]} size={[0.06, 0.06, 0.4]} color="#2a2433" />
      ))}
    </group>
  );
}

export function Motorcycle({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const body = surface({ color: "#221c2c", metalness: 0.55, roughness: 0.35 });
  const purple = surface({ color: "#4b2a7a", metalness: 0.5, roughness: 0.35 });
  const chrome = surface({ color: "#a8a6b5", metalness: 0.9, roughness: 0.25 });
  const tire = surface({ color: "#151218", roughness: 0.9 });
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-0.72, 0.72].map((z) => (
        <group key={z} position={[0, 0.36, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={tire} castShadow>
            <torusGeometry args={[0.27, 0.09, 10, 24]} />
          </mesh>
          <mesh material={glow(palette.cyan, 4)}>
            <torusGeometry args={[0.19, 0.012, 6, 24]} />
          </mesh>
          <mesh material={chrome} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.2, 10]} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[0.32, 0.3, 0.9]} radius={0.08} position={[0, 0.66, 0.02]} material={body} castShadow />
      <RoundedBox args={[0.36, 0.22, 0.52]} radius={0.1} position={[0, 0.88, -0.22]} material={purple} castShadow />
      <RoundedBox args={[0.3, 0.1, 0.55]} radius={0.04} position={[0, 0.86, 0.32]} material={surface({ color: "#141016", roughness: 0.8 })} />
      <Block position={[0, 0.84, 0.66]} rotation={[0.5, 0, 0]} size={[0.24, 0.08, 0.3]} color="#221c2c" />
      <Block position={[0, 0.66, -0.7]} rotation={[-0.35, 0, 0]} size={[0.06, 0.7, 0.06]} material={chrome} />
      <Block position={[0, 1.02, -0.58]} size={[0.62, 0.04, 0.04]} material={chrome} />
      <RoundedBox args={[0.3, 0.24, 0.2]} radius={0.06} position={[0, 0.98, -0.72]} material={body} />
      <mesh position={[0, 0.98, -0.83]} rotation={[Math.PI / 2, 0, 0]} material={glow("#bff6ff", 5)}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
      </mesh>
      <Block position={[0, 0.88, 0.95]} size={[0.16, 0.05, 0.04]} glowColor="#ff3b5c" glowIntensity={4} />
      <Block position={[0.17, 0.62, 0.02]} size={[0.02, 0.04, 0.7]} glowColor={palette.cyan} glowIntensity={3} />
      <Block position={[-0.17, 0.62, 0.02]} size={[0.02, 0.04, 0.7]} glowColor={palette.cyan} glowIntensity={3} />
      <mesh position={[0.12, 0.42, 0.4]} rotation={[Math.PI / 2 - 0.15, 0, 0]} material={chrome}>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
      </mesh>
    </group>
  );
}

const indoorPotted: KitItem[] = [
  { position: [-5.35, 0.08, -1.25], rotation: 0.4, scale: 1.25 },
  { position: [1.85, 0.08, -4.45], rotation: 2.1 },
  { position: [-4.75, 0.08, 4.35], rotation: 1.2, scale: 1.4 },
];
const indoorMonstera: KitItem[] = [{ position: [5.2, 0.08, 4.35], rotation: 2.4, scale: 1.1 }];
const shelfPlants: KitItem[] = [
  { position: [-2.0, 3.085, -4.6], scale: 1.1 },
  { position: [1.6, 2.88, -4.62] },
  { position: [GARAGE.maxX - 0.6, 0.78, 3.15], scale: 0.9 },
];
const shelfPlantsB: KitItem[] = [
  { position: [-4.7, 2.335, -4.62] },
  { position: [0.55, 0.82, -4.5], scale: 1.1 },
];

// Tanaman gantung dari balok plafon (origin model di ujung bawah).
const ceilingMoss: KitItem[] = [
  [-5.3, -3.4], [-1.6, -3.4], [1.2, -3.4], [5.2, -3.4],
  [-5.4, 3.4], [-2.2, 3.4], [4.9, 3.4],
].map(([x, z], i) => ({ position: [x, GARAGE.ceiling - 1.25 - (i % 3) * 0.12, z + 0.12] as Vec3, rotation: i * 1.3, scale: 0.95 + (i % 2) * 0.2 }));

/** Layout monitor meja PC (lokal grup meja): x, y, z, rotY, lebar, tinggi. */
export const monitors = [
  [0, 1.47, -0.18, 0, 1.05, 0.62],
  [-1.12, 1.42, -0.08, 0.38, 0.78, 0.48],
  [1.12, 1.42, -0.08, -0.38, 0.78, 0.48],
] as const;
export const DESK_ORIGIN: Vec3 = [-3.3, 0, -4.3];

/** Interior garasi: setiap sudut punya benda yang bisa dipakai. */
export function Interior() {
  const wood = palette.woodWarm;
  const shelf = palette.wood;
  const drawerRed = surface({ color: "#a3343a", roughness: 0.55, metalness: 0.15 });
  const metal = surface({ color: "#b9b6c4", metalness: 0.8, roughness: 0.3 });
  const books = ["#5a2f7a", "#b34a3c", "#d4a14a", "#2f5d6a", "#e3d3b5", "#7a3a52"];
  return (
    <group>
      <StaticBatch>
        {/* ===== Meja komputer (Keahlian), kiri belakang ===== */}
        <group position={[-3.3, 0, -4.3]}>
          <Block position={[0, 0.97, 0]} size={[3.4, 0.08, 0.95]} color={wood} />
          {[-1.4, 1.4].map((x) => (
            <group key={x}>
              <Block position={[x, 0.47, 0]} size={[0.55, 0.93, 0.85]} color={palette.woodDeep} />
              {[0.22, 0.5, 0.78].map((y) => (
                <group key={y}>
                  <Block position={[x, y, 0.43]} size={[0.5, 0.24, 0.02]} material={drawerRed} />
                  <Block position={[x, y + 0.04, 0.45]} size={[0.16, 0.025, 0.025]} material={metal} />
                </group>
              ))}
            </group>
          ))}
          {/* Tiga monitor: tengah besar, sisi menyudut ke dalam. */}
          {monitors.map(([x, y, z, rot, w, h]) => (
            <group key={x} position={[x, y, z]} rotation={[0, rot, 0]}>
              <Block size={[w + 0.06, h + 0.06, 0.05]} color="#16131d" />
              <Block position={[0, -h / 2 - 0.12, -0.04]} size={[0.06, 0.24, 0.06]} color="#16131d" />
              <Block position={[0, -h / 2 - 0.235, 0]} size={[0.28, 0.02, 0.18]} color="#16131d" />
            </group>
          ))}
          <Block position={[0, 1.03, 0.22]} size={[0.75, 0.035, 0.24]} color="#1c1824" />
          <Block position={[0, 1.05, 0.22]} size={[0.7, 0.005, 0.2]} glowColor="#9b5cff" glowIntensity={1.6} />
          <Block position={[0.55, 1.03, 0.24]} size={[0.08, 0.03, 0.12]} color="#1c1824" />
          <mesh position={[-0.9, 1.07, 0.25]} material={surface({ color: palette.fabricCream })}>
            <cylinderGeometry args={[0.05, 0.045, 0.11, 10]} />
          </mesh>
          {/* PC tower dengan strip cyan dan kipas ungu. */}
          <group position={[2.15, 0, 0.05]}>
            <Block position={[0, 0.33, 0]} size={[0.3, 0.62, 0.62]} color="#17141e" />
            <Block position={[0.155, 0.33, 0.29]} size={[0.01, 0.58, 0.02]} glowColor={palette.cyan} glowIntensity={4} />
            <mesh position={[0.156, 0.42, 0]} rotation={[0, Math.PI / 2, 0]} material={glow("#9b5cff", 3)}>
              <torusGeometry args={[0.1, 0.012, 6, 20]} />
            </mesh>
          </group>
          {/* Rak dinding dengan LED ungu & cyan. */}
          {[2.3, 3.05].map((y, k) => (
            <group key={y}>
              <Block position={[0, y, -0.32]} size={[3.6, 0.07, 0.36]} color={shelf} />
              <Block position={[0, y - 0.045, -0.16]} size={[3.5, 0.02, 0.02]} glowColor={k ? palette.cyan : "#9b5cff"} glowIntensity={3.5} />
            </group>
          ))}
          {[-1.6, -1.52, -1.44, -1.36, -1.28].map((x, i) => (
            <Book key={x} position={[x, 2.335, -0.32]} color={books[i]} h={0.24 + (i % 3) * 0.04} />
          ))}
          <Block position={[-0.7, 2.47, -0.32]} size={[0.34, 0.28, 0.26]} color="#c28a55" />
          <Block position={[1.4, 3.21, -0.32]} size={[0.3, 0.24, 0.26]} color="#8a5a3a" />
          {[0.6, 0.68, 0.76, 0.84].map((x, i) => (
            <Book key={x} position={[x, 3.085, -0.32]} color={books[(i + 2) % 6]} h={0.22 + (i % 2) * 0.05} />
          ))}
        </group>

        {/* ===== Papan perjalanan, tengah belakang ===== */}
        <group position={[0, 0, GARAGE.minZ + 0.2]}>
          <Block position={[0, 2.2, 0]} size={[2.05, 1.35, 0.08]} color={palette.woodDeep} />
          <Plane position={[0, 2.2, 0.045]} size={[1.85, 1.15]} material={screen(blueprintTexture(), 1.25)} />
          <Block position={[0, 0.42, 0.3]} size={[1.6, 0.8, 0.55]} color={palette.wood} />
          {[-0.4, 0.4].map((x) => (
            <Block key={x} position={[x, 0.42, 0.58]} size={[0.7, 0.66, 0.02]} color={palette.woodDeep} />
          ))}
          <Block position={[-0.35, 0.98, 0.3]} size={[0.4, 0.32, 0.36]} color="#c69a62" />
        </group>

        {/* ===== Workbench & pegboard (Proyek), kanan belakang ===== */}
        <group position={[3.3, 0, -4.3]}>
          <Block position={[0, 0.94, 0]} size={[3.3, 0.12, 0.95]} color="#8a5634" />
          {[-1.5, 1.5].map((x) => (
            <Block key={x} position={[x, 0.45, 0]} size={[0.14, 0.9, 0.85]} color={palette.woodDeep} />
          ))}
          <Block position={[0, 0.25, 0]} size={[3.0, 0.06, 0.8]} color={palette.wood} />
          <Block position={[0, 2.05, -0.43]} size={[3.2, 1.5, 0.05]} color="#b88a5c" />
          {Array.from({ length: 14 }, (_, i) =>
            Array.from({ length: 6 }, (_, j) => (
              <Block key={`${i}-${j}`} position={[-1.45 + i * 0.22, 1.45 + j * 0.24, -0.4]} size={[0.025, 0.025, 0.01]} color="#5e3c26" />
            )),
          )}
          <Block position={[0, 2.84, -0.3]} size={[3.2, 0.08, 0.3]} color={shelf} />
          <Block position={[0, 2.79, -0.16]} size={[3.1, 0.02, 0.02]} glowColor={palette.orange} glowIntensity={4} />
          {/* Kunci pas dan palu di pegboard. */}
          {Array.from({ length: 9 }, (_, i) => (
            <group key={`t${i}`} position={[-1.25 + i * 0.3, 2.05 + (i % 2) * 0.12, -0.38]} rotation={[0, 0, (i % 3 - 1) * 0.08]}>
              <Block size={[0.045, 0.42 - (i % 3) * 0.06, 0.03]} material={metal} />
              {i % 3 === 0 ? (
                <Block position={[0, 0.22, 0]} size={[0.2, 0.08, 0.05]} color="#4a4552" />
              ) : (
                <mesh position={[0, 0.24, 0]} material={metal}>
                  <torusGeometry args={[0.055, 0.018, 6, 10, Math.PI * 1.5]} />
                </mesh>
              )}
            </group>
          ))}
          {/* Printer 3D dan toolbox merah di atas meja. */}
          <group position={[1.0, 1.0, -0.1]}>
            <Block position={[0, 0.03, 0]} size={[0.6, 0.06, 0.55]} color="#2b2633" />
            {[-0.26, 0.26].map((x) => (
              <Block key={x} position={[x, 0.33, -0.2]} size={[0.04, 0.62, 0.04]} color="#2b2633" />
            ))}
            <Block position={[0, 0.63, -0.2]} size={[0.56, 0.05, 0.06]} color="#2b2633" />
          </group>
          <group position={[-1.05, 1.0, 0.05]}>
            <Block position={[0, 0.12, 0]} size={[0.62, 0.24, 0.3]} material={drawerRed} />
            <Block position={[0, 0.26, 0]} size={[0.3, 0.04, 0.04]} material={metal} />
          </group>
          <Plane position={[0, 1.005, 0.15]} rotation={[-Math.PI / 2, 0, 0.12]} size={[0.7, 0.45]} material={screen(blueprintTexture(), 0.9)} />
          {/* Lemari perkakas merah beroda di ujung kanan. */}
          <group position={[2.15, 0, 0.1]}>
            <Block position={[0, 0.6, 0]} size={[0.75, 1.1, 0.6]} material={drawerRed} />
            {[0.25, 0.48, 0.71, 0.94].map((y) => (
              <Block key={y} position={[0, y, 0.31]} size={[0.5, 0.03, 0.03]} material={metal} />
            ))}
            {[-0.3, 0.3].map((x) => (
              <mesh key={x} position={[x, 0.05, 0.22]} rotation={[0, 0, Math.PI / 2]} material={surface("#1c1820")}>
                <cylinderGeometry args={[0.05, 0.05, 0.05, 10]} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ===== Portal (Proyek pilihan), dinding kanan ===== */}
        <group position={[GARAGE.maxX - 0.55, 0, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
          {[0, 1].map((i) => (
            <group key={i}>
              <Block position={[0, 0.1 + i * 0.18, 0.55 - i * 0.32]} size={[2.6 - i * 0.4, 0.2 + i * 0.16, 0.65]} color={palette.stoneDark} />
              <Block position={[0, 0.2 + i * 0.34, 0.88 - i * 0.32]} size={[2.5 - i * 0.4, 0.025, 0.03]} glowColor={palette.cyan} glowIntensity={4} />
            </group>
          ))}
          {Array.from({ length: 11 }, (_, i) => {
            const a = (i / 10) * Math.PI;
            return (
              <Block
                key={i}
                position={[Math.cos(a) * 1.05, 1.55 + Math.sin(a) * 1.05, 0]}
                rotation={[0, 0, a - Math.PI / 2]}
                size={[0.42, 0.36, 0.45]}
                color={i % 2 ? palette.stone : palette.stoneLight}
              />
            );
          })}
          {[-1, 1].map((s) => (
            <Block key={s} position={[s * 1.05, 1.0, 0]} size={[0.42, 1.1, 0.45]} color={palette.stone} />
          ))}
          <Block position={[0, 2.62, 0.24]} size={[0.24, 0.3, 0.05]} glowColor={palette.cyan} glowIntensity={3} />
        </group>

        {/* ===== Rak trofi (Pengalaman), dinding kanan depan ===== */}
        <group position={[GARAGE.maxX - 0.42, 0, 2.6]} rotation={[0, -Math.PI / 2, 0]}>
          <Block position={[0, 1.25, -0.02]} size={[1.9, 2.5, 0.06]} color={palette.woodDeep} />
          {[-0.92, 0.92].map((x) => (
            <Block key={x} position={[x, 1.25, 0.18]} size={[0.07, 2.5, 0.44]} color={shelf} />
          ))}
          {[0.12, 0.75, 1.38, 2.01, 2.48].map((y) => (
            <group key={y}>
              <Block position={[0, y, 0.18]} size={[1.8, 0.06, 0.44]} color={shelf} />
              <Block position={[0, y - 0.04, 0.39]} size={[1.75, 0.015, 0.015]} glowColor="#ffc27a" glowIntensity={3} />
            </group>
          ))}
          <Trophy position={[-0.5, 0.78, 0.2]} scale={1.3} />
          <Trophy position={[0.45, 1.41, 0.2]} scale={1.1} />
          <Trophy position={[-0.2, 2.04, 0.2]} />
          {[0.3, 0.38, 0.46].map((x, i) => (
            <Book key={x} position={[x, 0.78, 0.2]} color={books[i + 1]} h={0.3} />
          ))}
          <Block position={[-0.45, 1.53, 0.2]} size={[0.32, 0.24, 0.28]} color="#9c6a44" />
        </group>

        {/* ===== Sudut santai (Tentang saya), dinding kiri ===== */}
        <group position={[GARAGE.minX + 0.75, 0, 1.2]}>
          <RoundedBox args={[0.95, 0.42, 3.1]} radius={0.08} position={[0, 0.3, 0]} material={surface({ color: palette.fabricCream, roughness: 1 })} castShadow />
          <RoundedBox args={[0.32, 0.75, 3.1]} radius={0.1} position={[-0.38, 0.72, 0]} material={surface({ color: palette.fabricCream, roughness: 1 })} castShadow />
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.95, 0.6, 0.24]} radius={0.08} position={[0, 0.5, s * 1.55]} material={surface({ color: "#d8c4a6", roughness: 1 })} castShadow />
          ))}
          {[-0.9, 0, 0.9].map((z) => (
            <RoundedBox key={z} args={[0.86, 0.14, 0.92]} radius={0.06} position={[0.05, 0.56, z]} material={surface({ color: "#efe1c8", roughness: 1 })} />
          ))}
          {[
            [-1.0, palette.fabricRed, 0.15],
            [-0.35, palette.fabricMustard, -0.1],
            [0.45, palette.fabricNavy, 0.12],
            [1.05, palette.fabricRed, -0.15],
          ].map(([z, color, rot]) => (
            <RoundedBox key={z as number} args={[0.18, 0.42, 0.42]} radius={0.08} position={[-0.12, 0.85, z as number]} rotation={[0, 0, rot as number]} material={surface({ color: color as string, roughness: 1 })} />
          ))}
          <Block position={[-0.7, 2.5, 0]} size={[0.04, 1.15, 2.3]} color="#1a1225" />
        </group>
        <mesh position={[-3.7, 0.105, 1.2]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={surface({ color: "#ffffff", map: rugTexture("red"), roughness: 1 })} receiveShadow>
          <planeGeometry args={[3.0, 2.3]} />
        </mesh>
        <mesh position={[0.2, 0.104, 1.6]} rotation={[-Math.PI / 2, 0, 0]} material={surface({ color: "#ffffff", map: rugTexture("navy"), roughness: 1 })} receiveShadow>
          <planeGeometry args={[3.2, 2.2]} />
        </mesh>
        <group position={[-3.75, 0, 1.2]}>
          <Block position={[0, 0.4, 0]} size={[0.85, 0.08, 1.4]} color="#8a5634" />
          {[-1, 1].flatMap((x) =>
            [-1, 1].map((z) => <Block key={`${x}${z}`} position={[x * 0.35, 0.2, z * 0.6]} size={[0.08, 0.38, 0.08]} color={palette.woodDeep} />),
          )}
          <mesh position={[0.15, 0.49, -0.35]} material={surface(palette.fabricCream)}>
            <cylinderGeometry args={[0.05, 0.045, 0.1, 10]} />
          </mesh>
          <Block position={[-0.1, 0.46, 0.3]} size={[0.3, 0.05, 0.22]} color="#5a2f7a" />
          <Block position={[-0.1, 0.5, 0.3]} size={[0.28, 0.04, 0.2]} color="#d4a14a" />
        </group>
        <mesh position={[GARAGE.minX + 0.18, 2.5, -1.05]} rotation={[0, Math.PI / 2, 0]} material={surface({ color: "#ffffff", map: posterTexture(0) })}>
          <planeGeometry args={[0.8, 1.12]} />
        </mesh>
        <mesh position={[GARAGE.maxX - 0.18, 2.75, 4.2]} rotation={[0, -Math.PI / 2, 0]} material={surface({ color: "#ffffff", map: posterTexture(1) })}>
          <planeGeometry args={[0.6, 0.84]} />
        </mesh>

        {/* Lampu tabung oranye di bawah balok plafon. */}
        {[-4, 4].map((x) => (
          <Block key={x} position={[x, GARAGE.ceiling - 0.42, 0]} size={[0.07, 0.05, 8.6]} glowColor={palette.orange} glowIntensity={4} />
        ))}
      </StaticBatch>

      {/* Objek kecil, figur, kristal, dan tanaman di luar batch (punya material/tekstur unik). */}
      <Figurine position={[-4.1, 3.085, -4.6]} scale={1.2} watch />
      <Figurine position={[-2.1, 2.335, -4.6]} rotationY={0.3} watch />
      <Figurine position={[GARAGE.maxX - 0.6, 1.41, 2.15]} rotationY={-Math.PI / 2} scale={1.3} watch />
      <NeonSign position={[GARAGE.minX + 0.21, 2.5, 1.2]} />
      <CeilingFan position={[0, GARAGE.ceiling - 0.05, 1.7]} />
      <Steam position={[-3.6, 0.55, 0.85]} />
      <Steam position={[-4.2, 1.13, -4.05]} />
      <StringLights from={[GARAGE.minX + 0.3, 3.72, -4.7]} to={[GARAGE.maxX - 0.3, 3.72, -4.7]} sag={0.22} count={20} color="#ffc98a" />
      <StringLights from={[GARAGE.minX + 0.3, 3.75, 4.6]} to={[GARAGE.maxX - 0.3, 3.75, 4.6]} sag={0.3} count={20} color="#d9a8ff" />
      <KitInstances name="moss" items={ceilingMoss} castShadow={false} />
      <CrystalCluster position={[-3.6, 2.335, -4.6]} scale={0.35} />
      <CrystalCluster position={[GARAGE.maxX - 0.75, 0.1, 0.75]} scale={1.3} />
      <CrystalCluster position={[GARAGE.maxX - 0.75, 0.1, -2.6]} scale={1.1} color="#7f8cff" />
      <CrystalCluster position={[GARAGE.maxX - 0.6, 2.04, 2.95]} scale={0.45} />
      <KitInstances name="potted_plant" items={indoorPotted} />
      <KitInstances name="monstera" items={indoorMonstera} />
      <KitInstances name="plant_small" items={shelfPlants} />
      <KitInstances name="plant_small_b" items={shelfPlantsB} />
      <KitInstances name="speaker" items={[{ position: [GARAGE.minX + 0.45, 0.08, -0.55], rotation: Math.PI / 2 }]} />
      <KitInstances name="lamp_floor" items={[{ position: [GARAGE.minX + 0.5, 0.08, 3.05] }]} />
      <KitInstances name="bear" items={[{ position: [GARAGE.maxX - 0.55, 2.51, 2.15], rotation: -Math.PI / 2 }]} />
      <KitInstances name="books" items={[{ position: [-2.55, 3.085, -4.62], rotation: 0.2 }]} />
      <KitInstances name="box_closed" items={[{ position: [5.1, 0.08, -2.75], rotation: 0.3 }, { position: [5.1, 0.53, -2.75], rotation: 0.9, scale: 0.8 }]} />
      <KitInstances name="crate" items={[{ position: [7.2, 0.08, 3.1], rotation: 0.4 }, { position: [7.35, 0.68, 3.0], rotation: 1.1, scale: 0.8 }]} />
      <KitInstances name="barrel" items={[{ position: [7.25, 0.08, 2.0] }]} />
      <KitInstances name="bucket" items={[{ position: [6.95, 0.08, 1.35], rotation: 0.6 }]} />
      <Vine position={[-4.9, 3.0, -4.48]} length={1.1} seed={1} />
      <Vine position={[-1.8, 2.25, -4.48]} length={0.8} seed={2} />
      <Vine position={[2.2, 2.8, -4.45]} length={1.0} seed={3} />
      <Vine position={[4.6, 2.8, -4.45]} length={0.7} seed={4} />
      <Vine position={[-5.7, 3.8, 3.4]} length={1.5} seed={5} />
      <Vine position={[5.7, 3.8, -3.6]} length={1.3} seed={6} />
      <GamingChair position={[-3.3, 0.08, -3.35]} />
      <Banner position={[GARAGE.maxX - 0.17, 3.0, -0.9]} rotationY={-Math.PI / 2} size={[0.6, 0.9]} />
      <mesh position={[-2.55, 0.42, 3.3]} scale={[1, 0.6, 1]} material={surface({ color: "#b8452f", roughness: 0.95 })} castShadow>
        <sphereGeometry args={[0.55, 16, 12]} />
      </mesh>
      <RattanLantern position={[-2.6, 3.1, 0.6]} size={0.3} rope={0.55} />
      <RattanLantern position={[2.6, 3.1, 0.6]} size={0.3} rope={0.55} />

      <Lamp position={[-2.6, 2.8, 0.6]} intensity={9} distance={9} essential />
      <Lamp position={[2.6, 2.8, 0.6]} intensity={7} distance={8} />
      <Lamp position={[-3.3, 2.5, -3.9]} color="#9b5cff" intensity={5} distance={5} flicker={0} />
      <Lamp position={[3.3, 2.4, -3.8]} color="#ffb35c" intensity={4} distance={5} />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[-3.3, 0.55, -4.3]} args={[1.75, 0.55, 0.5]} />
        <CuboidCollider position={[3.3, 0.55, -4.3]} args={[1.7, 0.55, 0.5]} />
        <CuboidCollider position={[5.45, 0.6, -4.2]} args={[0.4, 0.6, 0.35]} />
        <CuboidCollider position={[0, 0.45, -4.5]} args={[0.85, 0.45, 0.35]} />
        <CuboidCollider position={[GARAGE.maxX - 0.6, 1.3, -0.9]} args={[0.45, 1.3, 1.35]} />
        <CuboidCollider position={[GARAGE.maxX - 0.6, 1.25, 2.6]} args={[0.3, 1.25, 0.95]} />
        <CuboidCollider position={[GARAGE.minX + 0.7, 0.45, 1.2]} args={[0.5, 0.45, 1.65]} />
        <CuboidCollider position={[-3.75, 0.24, 1.2]} args={[0.45, 0.24, 0.72]} />
        <CuboidCollider position={[-3.3, 0.5, -3.35]} args={[0.32, 0.5, 0.32]} />
        <CuboidCollider position={[2.75, 0.5, 3.3]} args={[0.3, 0.5, 0.9]} rotation={[0, -0.55, 0]} />
        {/* Bean bag + kucing: cukup tinggi agar kamera tidak menembus kucing. */}
        <CuboidCollider position={[-2.55, 0.55, 3.3]} args={[0.5, 0.55, 0.5]} />
        <CuboidCollider position={[7.25, 0.5, 2.5]} args={[0.45, 0.5, 1.0]} />
      </RigidBody>
    </group>
  );
}
