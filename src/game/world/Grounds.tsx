import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { Vec3 } from "../config";
import { BOUNDS, GROUND_TOP, HOUSE } from "./layout";
import { Lamp, PillarLantern } from "./Lanterns";
import { Block } from "./Primitives";
import { palette, surface } from "./palette";
import { StaticBatch } from "./StaticBatch";
import { pavingTexture, stoneWallTexture } from "./textures";

const WALL_TOP = 0.85;

/** Tembok batu penahan yang menerus ke tebing di bawah plot. */
function RetainingWall({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const along = x1 === x2 ? [0.5, length] : [length, 0.5];
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const wall = surface({ color: "#b8a3a0", map: stoneWallTexture(), roughness: 0.95 });
  const depth = 3.2;
  return (
    <>
      <Block
        position={[cx, WALL_TOP - depth / 2, cz]}
        size={[along[0], depth, along[1]]}
        material={wall}
        tile={2}
        map={stoneWallTexture()}
      />
      <Block
        position={[cx, WALL_TOP + 0.05, cz]}
        size={[along[0] + 0.1, 0.1, along[1] + 0.1]}
        color={palette.stoneDark}
      />
    </>
  );
}

function pillarsAlong(from: [number, number], to: [number, number], count: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t] as [number, number];
  });
}

function FenceRails({ from, to }: { from: [number, number]; to: [number, number] }) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const alongX = from[1] === to[1];
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[1] + to[1]) / 2;
  return (
    <>
      {[1.25, 1.6].map((y) => (
        <Block
          key={y}
          position={[cx, y, cz]}
          size={alongX ? [length, 0.09, 0.09] : [0.09, 0.09, length]}
          color={palette.wood}
        />
      ))}
    </>
  );
}

/** Halaman: ubin basah, kebun, tembok batu, pilar lentera, dan collider batas. */
export function Grounds() {
  const paving = surface({ color: "#d9c4c4", map: pavingTexture(), roughness: 0.32, metalness: 0.05 });
  const grass = surface({ color: "#38552f", roughness: 1 });
  const soil = surface({ color: "#4a3329", roughness: 1 });
  const hedge = surface({ color: palette.leafDark, roughness: 1, flat: true });
  const front = pillarsAlong([BOUNDS.minX, BOUNDS.maxZ], [BOUNDS.maxX, BOUNDS.maxZ], 9);
  const left = pillarsAlong([BOUNDS.minX, BOUNDS.minZ], [BOUNDS.minX, BOUNDS.maxZ], 6);
  const lit: Vec3[] = [
    [front[2][0], 2.4, front[2][1] - 0.2],
    [front[5][0], 2.4, front[5][1] - 0.2],
    [left[4][0] + 0.2, 2.4, left[4][1]],
  ];
  return (
    <group>
      <StaticBatch>
        {/* Jalan masuk dan halaman depan: material glossy memantulkan langit sunset. */}
        <Block
          position={[(BOUNDS.minX + 9) / 2, GROUND_TOP - 0.15, (5 + BOUNDS.maxZ) / 2]}
          size={[9 - BOUNDS.minX, 0.3, BOUNDS.maxZ - 5]}
          material={paving}
          map={pavingTexture()}
          tile={2.4}
        />
        {/* Jalur batu di samping rumah menuju taman kiri. */}
        <Block
          position={[-19.2, GROUND_TOP - 0.15, -2]}
          size={[3.6, 0.3, 14]}
          material={paving}
          map={pavingTexture()}
          tile={2.4}
        />
        {/* Kebun kanan, belakang, dan petak tanah. */}
        <Block position={[11, GROUND_TOP - 0.17, 3]} size={[4, 0.3, 25]} material={grass} />
        <Block position={[-4, GROUND_TOP - 0.17, -8]} size={[34, 0.3, 3]} material={grass} />
        <Block position={[7.6, GROUND_TOP - 0.17, -2]} size={[3.2, 0.3, 14]} material={grass} />
        <Block position={[-19.2, GROUND_TOP + 0.05, 8.9]} size={[3.4, 0.2, 2.4]} material={soil} />
        <Block position={[11, GROUND_TOP + 0.05, 12]} size={[3.4, 0.2, 6]} material={soil} />
        {/* Tembok batas depan dan kiri menerus ke tebing. */}
        <RetainingWall from={[BOUNDS.minX, BOUNDS.maxZ]} to={[BOUNDS.maxX, BOUNDS.maxZ]} />
        <RetainingWall from={[BOUNDS.minX, BOUNDS.minZ]} to={[BOUNDS.minX, BOUNDS.maxZ]} />
        <RetainingWall from={[BOUNDS.maxX, BOUNDS.minZ]} to={[BOUNDS.maxX, BOUNDS.maxZ]} />
        <RetainingWall from={[BOUNDS.minX, BOUNDS.minZ]} to={[BOUNDS.maxX, BOUNDS.minZ]} />
        {front.map(([x, z], i) => (
          <PillarLantern key={`f${i}`} position={[x, WALL_TOP, z]} />
        ))}
        {left.slice(1).map(([x, z], i) => (
          <PillarLantern key={`l${i}`} position={[x, WALL_TOP, z]} />
        ))}
        {front.slice(0, -1).map(([x, z], i) => (
          <FenceRails key={`fr${i}`} from={[x + 0.3, z]} to={[front[i + 1][0] - 0.3, z]} />
        ))}
        {left.slice(0, -1).map(([x, z], i) => (
          <FenceRails key={`lr${i}`} from={[x, z + 0.3]} to={[x, left[i + 1][1] - 0.3]} />
        ))}
        {/* Inti pagar tanaman rendah; semak kit menutupinya (Vegetation). */}
        <mesh material={hedge} position={[BOUNDS.maxX - 0.4, 0.55, 3]} receiveShadow>
          <boxGeometry args={[0.7, 1.0, 25]} />
        </mesh>
        <mesh material={hedge} position={[-4, 0.55, BOUNDS.minZ + 0.4]} receiveShadow>
          <boxGeometry args={[34, 1.0, 0.7]} />
        </mesh>
      </StaticBatch>
      {lit.map((p, i) => (
        <Lamp key={i} position={p} intensity={5} distance={7} />
      ))}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[(BOUNDS.minX + BOUNDS.maxX) / 2, GROUND_TOP - 0.2, (BOUNDS.minZ + BOUNDS.maxZ) / 2]} args={[30, 0.2, 30]} />
        {/* Collider batas lebih tinggi dari puncak lompatan. */}
        <CuboidCollider position={[(BOUNDS.minX + BOUNDS.maxX) / 2, 2, BOUNDS.maxZ - 0.1]} args={[20, 2, 0.45]} />
        <CuboidCollider position={[BOUNDS.minX + 0.1, 2, (BOUNDS.minZ + BOUNDS.maxZ) / 2]} args={[0.45, 2, 15]} />
        <CuboidCollider position={[BOUNDS.maxX - 0.4, 2, (BOUNDS.minZ + BOUNDS.maxZ) / 2]} args={[0.6, 2, 15]} />
        <CuboidCollider position={[(BOUNDS.minX + BOUNDS.maxX) / 2, 2, BOUNDS.minZ + 0.4]} args={[20, 2, 0.6]} />
        {/* Tangga teras: ramp tak terlihat agar capsule naik mulus. */}
        <CuboidCollider
          position={[HOUSE.stairs.x, (GROUND_TOP + HOUSE.floor) / 2 - 0.08, HOUSE.porch.maxZ + HOUSE.stairs.depth / 2]}
          rotation={[Math.atan2(HOUSE.floor - GROUND_TOP, HOUSE.stairs.depth), 0, 0]}
          args={[HOUSE.stairs.half, 0.08, Math.hypot(HOUSE.stairs.depth, HOUSE.floor) / 2]}
        />
      </RigidBody>
    </group>
  );
}
