import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import type { Vec3 } from "../config";
import { KitInstances, Wind, type KitItem } from "./Kit";
import { BOUNDS, GARAGE, GROUND_TOP as G, HOUSE } from "./layout";
import { Lamp, RattanLantern } from "./Lanterns";
import { surface } from "./palette";
import { terrainHeight } from "./Scenery";

const TREE: Vec3 = [-18.4, G, 11.4];
const TREE_ROT = 0.9;
const BED = G + 0.15;

// Titik gantung lampion di bawah ujung cabang pohon besar (koordinat lokal pohon).
const treeLanterns: [number, number, number, number][] = [
  [3.3, 4.2, -0.7, 0.9],
  [-2.4, 4.4, -1.5, 1.0],
  [0.5, 4.6, 2.6, 0.9],
  [4.2, 3.6, 0.7, 0.6],
  [1.6, 4.9, 1.6, 1.1],
];
function treePoint([x, y, z]: [number, number, number, number]): Vec3 {
  const c = Math.cos(TREE_ROT);
  const s = Math.sin(TREE_ROT);
  return [TREE[0] + x * c + z * s, TREE[1] + y, TREE[2] - x * s + z * c];
}

function along(
  from: [number, number],
  to: [number, number],
  count: number,
  jitter = 0.4,
  seed = 1,
): KitItem[] {
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const r = Math.sin(seed * 12.9 + i * 78.2) * 43758.5;
    const f = r - Math.floor(r);
    const x = from[0] + (to[0] - from[0]) * t + (f - 0.5) * jitter;
    const z = from[1] + (to[1] - from[1]) * t + (f - 0.5) * jitter;
    return { position: [x, terrainHeight(x, z) + 0.1, z] as Vec3, rotation: f * 6.28, scale: 0.8 + f * 0.6 };
  });
}

// Semak di luar tembok: menutup kaki tembok dan membuat tebing terasa rimbun.
const outsideBushes = [
  ...along([BOUNDS.minX - 1.4, BOUNDS.maxZ + 1.6], [BOUNDS.maxX + 1, BOUNDS.maxZ + 1.6], 15, 1.2, 2),
  ...along([BOUNDS.minX - 1.6, BOUNDS.minZ], [BOUNDS.minX - 1.6, BOUNDS.maxZ], 10, 1.2, 3),
];
// Semak rapat sepanjang batas kanan & belakang (menggantikan balok hedge).
const hedgeBushes = [
  ...along([BOUNDS.maxX - 0.5, BOUNDS.minZ + 0.6], [BOUNDS.maxX - 0.5, BOUNDS.maxZ - 0.6], 16, 0.3, 8),
  ...along([BOUNDS.minX + 3.5, BOUNDS.minZ + 0.5], [BOUNDS.maxX - 1, BOUNDS.minZ + 0.5], 22, 0.3, 9),
].map((item) => ({ ...item, position: [item.position[0], 0.05, item.position[2]] as Vec3, scale: 1.05 + ((item.scale as number) - 0.8) * 0.4 }));
const outsideLarge = [
  ...along([BOUNDS.minX - 2.8, BOUNDS.maxZ + 3.2], [BOUNDS.maxX + 2, BOUNDS.maxZ + 3.2], 7, 2, 4),
  ...along([BOUNDS.maxX + 1.6, BOUNDS.minZ], [BOUNDS.maxX + 1.6, BOUNDS.maxZ], 8, 1.4, 5),
];
// Palem depan hanya di sisi kiri agar tidak menutup bidikan establishing dari kanan.
const outsidePalms = [
  ...along([BOUNDS.minX - 3.5, BOUNDS.maxZ + 4.5], [-4, BOUNDS.maxZ + 5], 3, 3, 6),
  ...along([BOUNDS.minX - 3.2, BOUNDS.minZ - 2], [BOUNDS.minX - 3.2, BOUNDS.maxZ], 4, 3, 7),
];

const palmsTall: KitItem[] = [
  { position: [11.3, G, 0.6], rotation: 0.4 },
  { position: [-19.6, G, -6.4], rotation: 1.2 },
  { position: [-12.5, G, -8.3], rotation: 2.0, scale: 1.1 },
  { position: [12, G, -7.8], rotation: 0.9 },
  ...outsidePalms.slice(0, 3),
];
const palmsBend: KitItem[] = [
  { position: [10.9, G, -4.6], rotation: 2.2 },
  { position: [-19.8, G, 1.8], rotation: 4.0 },
  { position: [10.7, G, 13.7], rotation: 3.7, scale: 0.9 },
  ...outsidePalms.slice(3),
];
const palmsShort: KitItem[] = [
  { position: [7.6, G, -7.9], rotation: 0.5 },
  { position: [-4, G, -8.1], rotation: 1.8 },
  { position: [11, G, 9.2], rotation: 2.6, scale: 0.85 },
];

const bananas: KitItem[] = [
  { position: [-6.6, 1.08, 4], rotation: 0.3, scale: 0.75 },
  { position: [7.5, G, 4.4], rotation: 1.4, scale: 0.9 },
  { position: [-19.6, BED, 8.4], rotation: 2.2, scale: 0.8 },
  { position: [10.6, BED, 11.1], rotation: 0.8, scale: 0.85 },
  { position: [8.2, G, -3.4], rotation: 2.9 },
];
const bougainvillea: KitItem[] = [
  { position: [-15.9, G, 6.2], rotation: 0.2 },
  { position: [-7.75, G, 6.2], rotation: 1.6, scale: 0.85 },
  { position: [HOUSE.porch.minX + 0.45, HOUSE.upper + 0.15, HOUSE.porch.maxZ - 0.5], rotation: 2.1, scale: 0.62 },
  { position: [HOUSE.porch.maxX - 0.45, HOUSE.upper + 0.15, HOUSE.porch.maxZ - 0.5], rotation: 0.6, scale: 0.6 },
  { position: [GARAGE.minX + 0.45, GARAGE.ceiling + 0.95, GARAGE.maxZ - 0.4], rotation: 0.9, scale: 0.7 },
  { position: [GARAGE.maxX - 0.45, GARAGE.ceiling + 0.95, GARAGE.maxZ - 0.4], rotation: 2.4, scale: 0.68 },
  { position: [-20.2, BED, 9.7], rotation: 1.1, scale: 0.85 },
  { position: [11.9, BED, 14.4], rotation: 2.8, scale: 0.85 },
  { position: [7.2, G, 6.2], rotation: 0.4, scale: 0.75 },
];
const bushRound: KitItem[] = [
  { position: [-14.6, G, 6.15], scale: 0.65 },
  { position: [-9.1, G, 6.15], scale: 0.6, rotation: 1 },
  { position: [9.8, G, -1.8], rotation: 2 },
  { position: [12.1, G, 4.3], rotation: 0.4 },
  { position: [-16, G, -8.4], rotation: 1.4 },
  { position: [6, G, -8.2], rotation: 0.2 },
  ...outsideBushes,
];
const bushLarge: KitItem[] = [
  ...hedgeBushes,
  { position: [9.9, G, 6.8], rotation: 1.2, scale: 0.9 },
  { position: [-1, G, -8.4], rotation: 0.3 },
  { position: [-8, G, -8.2], rotation: 2.5 },
  ...outsideLarge,
];
const ferns: KitItem[] = [
  { position: [-18.2, BED, 9.7], rotation: 0.2 },
  { position: [-20.2, BED, 8.0], rotation: 1.4 },
  { position: [10.1, BED, 12.7], rotation: 2.2 },
  { position: [11.9, BED, 10.0], rotation: 0.7 },
  { position: [6.9, G, 2.6], rotation: 1.9 },
  { position: [6.9, G, -2.5], rotation: 0.1 },
  { position: [-17.9, G, -1.2], rotation: 2.7 },
  { position: [-17.9, G, -4.8], rotation: 1.1 },
];
const flowersRed: KitItem[] = [
  { position: [-18.9, BED, 8.1] },
  { position: [11.6, BED, 12.8], rotation: 1 },
  { position: [10.2, BED, 14.6], rotation: 2 },
  { position: [-12.95, G, 7.6], rotation: 0.4, scale: 0.8 },
];
const flowersPurple: KitItem[] = [
  { position: [-19.8, BED, 9.2], rotation: 0.5 },
  { position: [10.4, BED, 10.4] },
  { position: [12.2, BED, 12.0], rotation: 1.4 },
  { position: [-10.25, G, 7.6], rotation: 2.4, scale: 0.8 },
];
const flowersYellow: KitItem[] = [
  { position: [-18.6, BED, 9.9], rotation: 1.7 },
  { position: [11.2, BED, 9.6], rotation: 0.4 },
];
const leafyLow: KitItem[] = [
  { position: [-19.6, BED, 9.4], scale: 0.7 },
  { position: [11.4, BED, 13.5], scale: 0.8, rotation: 1.2 },
  { position: [7.4, G, 0.4], scale: 0.9 },
  { position: [-18, G, 3.4], scale: 0.8, rotation: 2 },
];

// Lumut/tanaman merambat menjuntai dari tepi balkon dan awning garasi.
const moss: KitItem[] = [
  ...[-16.2, -14.9, -13.3, -9.8, -8.6, -7.6].map((x, i) => ({
    position: [x, HOUSE.upper - 0.95 + (i % 2) * 0.2, HOUSE.porch.maxZ + 0.02] as Vec3,
    rotation: i * 1.7,
    scale: 0.9 + (i % 3) * 0.12,
  })),
  ...[-5.9, -5.1, 5.1, 5.9].map((x, i) => ({
    position: [x, GARAGE.ceiling - 0.55 + (i % 2) * 0.15, GARAGE.maxZ + 1.45] as Vec3,
    rotation: i * 2.1,
    scale: 0.85,
  })),
];

const entryPots: Vec3[] = [
  [-5.1, G, 6.1],
  [5.1, G, 6.1],
  [-13.3, HOUSE.floor, 4.9],
  [-9.9, HOUSE.floor, 4.9],
];

function BigPot({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} material={surface({ color: "#b0603f", roughness: 0.9 })} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.26, 0.6, 14]} />
      </mesh>
      <mesh position={[0, 0.58, 0]} material={surface({ color: "#8a4632", roughness: 0.9 })}>
        <torusGeometry args={[0.36, 0.04, 6, 16]} />
      </mesh>
      <mesh position={[0, 0.57, 0]} rotation={[-Math.PI / 2, 0, 0]} material={surface("#2e2018")}>
        <circleGeometry args={[0.34, 14]} />
      </mesh>
    </group>
  );
}

/** Seluruh tanaman luar + ornamen pohon besar. */
export function Vegetation() {
  const lanterns = treeLanterns.map(treePoint);
  return (
    <group>
      <Wind />
      <KitInstances name="tree_big" items={[{ position: TREE, rotation: TREE_ROT }]} sway={0.12} />
      <KitInstances name="palm_tall" items={palmsTall} sway={0.25} />
      <KitInstances name="palm_bend" items={palmsBend} sway={0.22} />
      <KitInstances name="palm_short" items={palmsShort} sway={0.18} />
      <KitInstances name="tree_round" items={[{ position: [3.5, G, -8.4], rotation: 0.7 }]} sway={0.12} />
      <KitInstances name="tree_oak" items={[{ position: [-8.4, G, -8.3], rotation: 2.1 }]} sway={0.12} />
      <KitInstances name="banana" items={bananas} sway={0.14} />
      <KitInstances name="bougainvillea" items={bougainvillea} sway={0.05} />
      <KitInstances name="bush_round" items={bushRound} sway={0.05} />
      <KitInstances name="bush_large" items={bushLarge} sway={0.05} />
      <KitInstances name="fern" items={ferns} sway={0.06} />
      <KitInstances name="flower_red" items={flowersRed} sway={0.04} />
      <KitInstances name="flower_purple" items={flowersPurple} sway={0.04} />
      <KitInstances name="flower_yellow" items={flowersYellow} sway={0.04} />
      <KitInstances name="leafy_low" items={leafyLow} sway={0.04} />
      <KitInstances name="moss" items={moss} sway={0.0} castShadow={false} />
      <KitInstances
        name="monstera"
        items={entryPots.map((p, i) => ({ position: [p[0], p[1] + 0.56, p[2]] as Vec3, rotation: i * 1.3, scale: i < 2 ? 1.25 : 0.95 }))}
        sway={0.04}
      />
      {entryPots.map((p, i) => (
        <BigPot key={i} position={p} scale={i < 2 ? 1 : 0.8} />
      ))}
      <KitInstances name="rock_a" items={[{ position: [BOUNDS.minX - 4, terrainHeight(BOUNDS.minX - 4, 6), 6], rotation: 1, scale: 1.3 }]} />
      <KitInstances name="rock_tall" items={[{ position: [BOUNDS.maxX + 3, terrainHeight(BOUNDS.maxX + 3, 18), 18], rotation: 2 }]} />

      {lanterns.map((p, i) => (
        <RattanLantern key={i} position={p} size={0.22} rope={treeLanterns[i][3]} />
      ))}
      <Lamp position={[lanterns[0][0], lanterns[0][1] - 0.3, lanterns[0][2]]} intensity={6} distance={8} />
      <Lamp position={[lanterns[2][0], lanterns[2][1] - 0.3, lanterns[2][2]]} intensity={5} distance={7} />

      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider position={[TREE[0], 2, TREE[2]]} args={[2, 0.55]} />
        {[...palmsTall.slice(0, 4), ...palmsBend.slice(0, 3), ...palmsShort].map((item, i) => (
          <CylinderCollider key={i} position={[item.position[0], 1.5, item.position[2]]} args={[1.5, 0.3]} />
        ))}
        {entryPots.map((p, i) => (
          <CylinderCollider key={`pot${i}`} position={[p[0], p[1] + 0.5, p[2]]} args={[0.5, i < 2 ? 0.42 : 0.34]} />
        ))}
        {bananas.slice(1, 2).map((item, i) => (
          <CylinderCollider key={`ban${i}`} position={[item.position[0], 1, item.position[2]]} args={[1, 0.25]} />
        ))}
        <CuboidCollider position={[-19.2, 0.4, 8.9]} args={[1.7, 0.4, 1.2]} />
        <CuboidCollider position={[11, 0.4, 12]} args={[1.7, 0.4, 3]} />
      </RigidBody>
    </group>
  );
}
