import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { GROUND_TOP, HOUSE } from "./layout";
import { Lamp, RattanLantern, StringLights, WallSconce } from "./Lanterns";
import { Block } from "./Primitives";
import { palette, surface } from "./palette";
import { StaticBatch } from "./StaticBatch";
import {
  bannerTexture,
  carvedTexture,
  plankTexture,
  roofTexture,
  stoneWallTexture,
  stuccoTexture,
} from "./textures";

const W = HOUSE.maxX - HOUSE.minX;
const D = HOUSE.maxZ - HOUSE.minZ;
const CX = (HOUSE.minX + HOUSE.maxX) / 2;
const CZ = (HOUSE.minZ + HOUSE.maxZ) / 2;
const PITCH = Math.atan2(HOUSE.ridge - HOUSE.eave, D / 2);

/** Jendela hangat dengan kusen dan kisi kayu. */
function Window({
  position,
  size = [1.4, 1.3],
  rotationY = 0,
}: {
  position: [number, number, number];
  size?: [number, number];
  rotationY?: number;
}) {
  const [w, h] = size;
  const frame = palette.woodDeep;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Block position={[0, 0, -0.02]} size={[w, h, 0.05]} glowColor="#ffb466" glowIntensity={1.7} />
      <Block position={[0, h / 2 + 0.06, 0.04]} size={[w + 0.3, 0.12, 0.14]} color={frame} />
      <Block position={[0, -h / 2 - 0.08, 0.06]} size={[w + 0.4, 0.1, 0.22]} color={frame} />
      {[-1, 1].map((s) => (
        <Block key={s} position={[(s * (w + 0.12)) / 2, 0, 0.04]} size={[0.12, h + 0.12, 0.14]} color={frame} />
      ))}
      <Block position={[0, 0, 0.03]} size={[0.06, h, 0.06]} color={frame} />
      <Block position={[0, h * 0.12, 0.03]} size={[w, 0.06, 0.06]} color={frame} />
    </group>
  );
}

/** Spanduk ungu berlambang. Dipakai juga di garasi. */
export function Banner({
  position,
  size = [0.8, 1.7],
  rotationY = 0,
}: {
  position: [number, number, number];
  size?: [number, number];
  rotationY?: number;
}) {
  const material = surface({ color: "#ffffff", map: bannerTexture(), roughness: 0.9, side: 2 });
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Block position={[0, size[1] / 2 + 0.05, 0.02]} size={[size[0] + 0.25, 0.06, 0.06]} color={palette.woodDeep} />
      <mesh material={material} castShadow>
        <planeGeometry args={size} />
      </mesh>
    </group>
  );
}

/** Rumah dua lantai: plinth batu, teras kayu, balkon, genteng gelap. */
export function House() {
  const stucco = surface({ color: palette.stucco, map: stuccoTexture(), roughness: 0.95 });
  const stone = surface({ color: "#c2aca8", map: stoneWallTexture(), roughness: 0.95 });
  const deck = surface({ color: "#ffffff", map: plankTexture("warm"), roughness: 0.6 });
  const roof = surface({ color: "#ffffff", map: roofTexture(), roughness: 0.7 });
  const beam = palette.wood;
  const porchW = HOUSE.porch.maxX - HOUSE.porch.minX;
  const porchCX = (HOUSE.porch.minX + HOUSE.porch.maxX) / 2;
  const porchD = HOUSE.porch.maxZ - HOUSE.maxZ;
  const porchCZ = (HOUSE.porch.maxZ + HOUSE.maxZ) / 2;
  const floorH = HOUSE.upper - HOUSE.floor;
  const upperH = HOUSE.eave - HOUSE.upper;
  const stepH = (HOUSE.floor - GROUND_TOP) / HOUSE.stairs.steps;
  const stepD = HOUSE.stairs.depth / HOUSE.stairs.steps;
  const roofRun = D / 2 + 0.8;
  const roofLen = roofRun / Math.cos(PITCH);
  const posts = [-16.6, -12.75, -10.45, -7.2];
  return (
    <group>
      <StaticBatch>
        {/* Plinth batu menaikkan rumah dari halaman. */}
        <Block position={[CX, (GROUND_TOP + HOUSE.floor) / 2, CZ]} size={[W, HOUSE.floor - GROUND_TOP, D]} material={stone} map={stoneWallTexture()} />
        <Block position={[porchCX, (GROUND_TOP + HOUSE.floor) / 2 - 0.04, porchCZ]} size={[porchW, HOUSE.floor - GROUND_TOP - 0.08, porchD]} material={stone} map={stoneWallTexture()} />
        <Block position={[porchCX, HOUSE.floor - 0.05, porchCZ + 0.05]} size={[porchW + 0.2, 0.1, porchD + 0.1]} material={deck} map={plankTexture("warm")} tile={2} />
        {/* Tangga batu dengan strip LED di bawah tiap anak tangga. */}
        {Array.from({ length: HOUSE.stairs.steps }, (_, i) => {
          const top = GROUND_TOP + (i + 1) * stepH;
          const z = HOUSE.porch.maxZ + HOUSE.stairs.depth - (i + 0.5) * stepD;
          return (
            <group key={i}>
              <Block position={[HOUSE.stairs.x, (GROUND_TOP + top) / 2, z]} size={[HOUSE.stairs.half * 2, top - GROUND_TOP, stepD]} material={stone} map={stoneWallTexture()} />
              <Block position={[HOUSE.stairs.x, top - 0.035, z + stepD / 2 - 0.04]} size={[HOUSE.stairs.half * 2 - 0.1, 0.03, 0.03]} glowColor={palette.orange} glowIntensity={3} />
            </group>
          );
        })}
        {[-1, 1].map((s) => (
          <Block
            key={s}
            position={[HOUSE.stairs.x + s * (HOUSE.stairs.half + 0.2), (GROUND_TOP + HOUSE.floor) / 2 + 0.15, HOUSE.porch.maxZ + HOUSE.stairs.depth / 2]}
            size={[0.4, HOUSE.floor - GROUND_TOP + 0.3, HOUSE.stairs.depth]}
            material={stone}
            map={stoneWallTexture()}
          />
        ))}

        {/* Dinding lantai bawah dan atas. */}
        <Block position={[CX, HOUSE.floor + floorH / 2, HOUSE.maxZ - 0.12]} size={[W, floorH, 0.25]} material={stucco} map={stuccoTexture()} />
        <Block position={[CX, HOUSE.upper + upperH / 2, HOUSE.maxZ - 0.12]} size={[W, upperH, 0.25]} material={stucco} map={stuccoTexture()} />
        <Block position={[CX, HOUSE.floor + (HOUSE.eave - HOUSE.floor) / 2, HOUSE.minZ + 0.12]} size={[W, HOUSE.eave - HOUSE.floor, 0.25]} material={stucco} map={stuccoTexture()} />
        {[HOUSE.minX + 0.12, HOUSE.maxX - 0.12].map((x) => (
          <Block key={x} position={[x, HOUSE.floor + (HOUSE.eave - HOUSE.floor) / 2, CZ]} size={[0.25, HOUSE.eave - HOUSE.floor, D]} material={stucco} map={stuccoTexture()} />
        ))}
        {/* Gable: diamond pipih; separuh bawah tersembunyi di dalam rumah. */}
        {[HOUSE.minX + 0.125, HOUSE.maxX - 0.125].map((x) => (
          <group key={`g${x}`} position={[x, HOUSE.eave, CZ]} scale={[1, (HOUSE.ridge - HOUSE.eave) / (D / 2), 1]}>
            <Block rotation={[Math.PI / 4, 0, 0]} size={[0.2, (D / 2) * Math.SQRT2, (D / 2) * Math.SQRT2]} material={stucco} map={stuccoTexture()} />
          </group>
        ))}
        {/* Bak tanaman batu menutup celah teras dan dinding garasi. */}
        <Block position={[-6.6, 0.55, 4]} size={[0.8, 0.95, 2.2]} material={stone} map={stoneWallTexture()} />
        <Block position={[-6.6, 1.05, 4]} size={[0.7, 0.06, 2.1]} color="#3a2a22" />

        {/* Rangka kayu fasad. */}
        {[HOUSE.minX + 0.1, -14.2, -9, HOUSE.maxX - 0.1].map((x) => (
          <Block key={`p${x}`} position={[x, (HOUSE.floor + HOUSE.eave) / 2, HOUSE.maxZ + 0.04]} size={[0.22, HOUSE.eave - HOUSE.floor, 0.12]} color={beam} />
        ))}
        {[HOUSE.floor + 0.08, HOUSE.upper, HOUSE.eave - 0.1].map((y) => (
          <Block key={`b${y}`} position={[CX, y, HOUSE.maxZ + 0.05]} size={[W + 0.1, 0.2, 0.14]} color={beam} />
        ))}

        {/* Pintu kayu berukir. */}
        <group position={[HOUSE.stairs.x, HOUSE.floor, HOUSE.maxZ + 0.02]}>
          <Block position={[0, 1.2, 0]} size={[1.4, 2.4, 0.08]} map={plankTexture("dark")} tile={1.2} color="#ffffff" />
          <mesh position={[0, 1.45, 0.05]} material={surface({ color: "#ffffff", map: carvedTexture() })}>
            <planeGeometry args={[0.9, 0.9]} />
          </mesh>
          <Block position={[0, 2.5, 0.06]} size={[1.75, 0.2, 0.16]} color={palette.woodDeep} />
          {[-1, 1].map((s) => (
            <Block key={s} position={[s * 0.8, 1.25, 0.06]} size={[0.16, 2.5, 0.16]} color={palette.woodDeep} />
          ))}
          <Block position={[0.5, 1.1, 0.08]} size={[0.06, 0.2, 0.06]} color="#d8a85a" metalness={0.6} roughness={0.35} />
        </group>
        <Window position={[-15.4, 2.75, HOUSE.maxZ + 0.02]} />
        <Window position={[-8.1, 2.75, HOUSE.maxZ + 0.02]} />
        {[-15.5, -11.9, -8.3].map((x) => (
          <Window key={`u${x}`} position={[x, 5.95, HOUSE.maxZ + 0.02]} size={[1.3, 1.2]} />
        ))}
        {[-4.2, 0.2].map((z) => (
          <Window key={`s${z}`} position={[HOUSE.minX - 0.02, 2.75, z]} rotationY={-Math.PI / 2} />
        ))}
        <Window position={[HOUSE.minX - 0.02, 5.95, -2]} rotationY={-Math.PI / 2} size={[1.3, 1.2]} />

        {/* Balkon di atas teras, ditopang tiang kayu. */}
        <Block position={[porchCX, HOUSE.upper + 0.08, porchCZ + 0.05]} size={[porchW + 0.2, 0.22, porchD + 0.1]} material={deck} map={plankTexture("warm")} />
        {posts.map((x) => (
          <Block key={`post${x}`} position={[x, (HOUSE.floor + HOUSE.upper) / 2, HOUSE.porch.maxZ - 0.15]} size={[0.24, floorH, 0.24]} color={beam} />
        ))}
        <Block position={[porchCX, HOUSE.upper + 0.95, HOUSE.porch.maxZ - 0.05]} size={[porchW + 0.2, 0.1, 0.12]} color={beam} />
        <Block position={[porchCX, HOUSE.upper + 0.32, HOUSE.porch.maxZ - 0.05]} size={[porchW + 0.2, 0.08, 0.1]} color={beam} />
        {Array.from({ length: 26 }, (_, i) => (
          <Block key={`bal${i}`} position={[HOUSE.porch.minX + 0.2 + i * (porchW - 0.4) / 25, HOUSE.upper + 0.62, HOUSE.porch.maxZ - 0.05]} size={[0.06, 0.6, 0.06]} color={palette.woodWarm} />
        ))}
        {[HOUSE.porch.minX, HOUSE.porch.maxX].map((x) => (
          <Block key={`side${x}`} position={[x, HOUSE.upper + 0.62, porchCZ]} size={[0.1, 0.62, porchD]} color={palette.woodWarm} />
        ))}
        {/* Pagar teras bawah, terbuka di depan tangga. */}
        {[
          [HOUSE.porch.minX, HOUSE.stairs.x - HOUSE.stairs.half - 0.4],
          [HOUSE.stairs.x + HOUSE.stairs.half + 0.4, HOUSE.porch.maxX],
        ].map(([a, b]) => (
          <group key={`rail${a}`}>
            <Block position={[(a + b) / 2, HOUSE.floor + 0.85, HOUSE.porch.maxZ - 0.05]} size={[b - a, 0.09, 0.1]} color={beam} />
            {Array.from({ length: Math.round((b - a) / 0.32) }, (_, i) => (
              <Block key={i} position={[a + 0.16 + i * 0.32, HOUSE.floor + 0.42, HOUSE.porch.maxZ - 0.05]} size={[0.05, 0.8, 0.05]} color={palette.woodWarm} />
            ))}
          </group>
        ))}

        {/* Atap pelana genteng gelap dengan lisplang kayu. */}
        {[1, -1].map((s) => (
          <group
            key={`roof${s}`}
            position={[CX, (HOUSE.ridge + HOUSE.eave - 0.8 * Math.tan(PITCH)) / 2 + 0.12, CZ + (s * roofRun) / 2]}
            rotation={[s * PITCH, 0, 0]}
          >
            <Block size={[W + 1.3, 0.16, roofLen]} material={roof} map={roofTexture()} tile={1.2} />
            <Block position={[0, -0.05, (s * roofLen) / 2]} size={[W + 1.3, 0.26, 0.12]} color={palette.woodDeep} />
            {[-1, 1].map((e) => (
              <Block key={e} position={[(e * (W + 1.3)) / 2, -0.04, 0]} size={[0.14, 0.3, roofLen]} color={palette.woodDeep} />
            ))}
          </group>
        ))}
        <Block position={[CX, HOUSE.ridge + 0.22, CZ]} size={[W + 1.4, 0.2, 0.34]} color={palette.roofEdge} />
      </StaticBatch>

      {/* Ornamen hidup: lampion, lampu dinding, spanduk, lampu kabel. */}
      <Banner position={[-13.55, 3.15, HOUSE.maxZ + 0.08]} />
      <Banner position={[-9.65, 3.15, HOUSE.maxZ + 0.08]} />
      <WallSconce position={[HOUSE.stairs.x - 1.05, HOUSE.floor + 1.5, HOUSE.maxZ + 0.06]} height={0.7} />
      <WallSconce position={[HOUSE.stairs.x + 1.05, HOUSE.floor + 1.5, HOUSE.maxZ + 0.06]} height={0.7} />
      <RattanLantern position={[-14.6, HOUSE.upper - 0.75, porchCZ + 0.4]} size={0.24} rope={0.4} />
      <RattanLantern position={[-8.7, HOUSE.upper - 0.75, porchCZ + 0.4]} size={0.24} rope={0.4} />
      <StringLights from={[HOUSE.minX - 0.4, 6.62, HOUSE.maxZ + 0.72]} to={[HOUSE.maxX + 0.4, 6.62, HOUSE.maxZ + 0.72]} sag={0.4} count={24} />
      <Lamp position={[HOUSE.stairs.x, HOUSE.upper - 0.6, porchCZ + 0.6]} intensity={9} distance={9} essential />
      <Lamp position={[-15, HOUSE.upper - 0.8, porchCZ + 0.5]} intensity={4} distance={6} />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[CX, HOUSE.eave / 2, CZ]} args={[W / 2, HOUSE.eave / 2, D / 2]} />
        <CuboidCollider position={[(HOUSE.porch.minX + HOUSE.porch.maxX) / 2, HOUSE.floor / 2, porchCZ]} args={[porchW / 2, HOUSE.floor / 2, porchD / 2]} />
        {[
          [HOUSE.porch.minX, HOUSE.stairs.x - HOUSE.stairs.half - 0.4],
          [HOUSE.stairs.x + HOUSE.stairs.half + 0.4, HOUSE.porch.maxX],
        ].map(([a, b]) => (
          <CuboidCollider key={a} position={[(a + b) / 2, HOUSE.floor + 1.2, HOUSE.porch.maxZ - 0.05]} args={[(b - a) / 2, 1.2, 0.08]} />
        ))}
        {[-1, 1].map((s) => (
          <CuboidCollider
            key={s}
            position={[HOUSE.stairs.x + s * (HOUSE.stairs.half + 0.2), 1.6, HOUSE.porch.maxZ + HOUSE.stairs.depth / 2]}
            args={[0.2, 1.6, HOUSE.stairs.depth / 2]}
          />
        ))}
        {[HOUSE.porch.minX, HOUSE.porch.maxX].map((x) => (
          <CuboidCollider key={x} position={[x, HOUSE.floor + 1.5, (HOUSE.maxZ + HOUSE.porch.maxZ) / 2]} args={[0.08, 1.5, (HOUSE.porch.maxZ - HOUSE.maxZ) / 2]} />
        ))}
        <CuboidCollider position={[-6.6, 0.6, 4]} args={[0.42, 0.6, 1.1]} />
        {posts.map((x) => (
          <CuboidCollider key={`pc${x}`} position={[x, HOUSE.floor + 1.5, HOUSE.porch.maxZ - 0.15]} args={[0.14, 1.5, 0.14]} />
        ))}
      </RigidBody>
    </group>
  );
}
