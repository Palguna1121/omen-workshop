import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Banner } from "./House";
import { GARAGE, GROUND_TOP } from "./layout";
import { Lamp, StringLights, WallSconce } from "./Lanterns";
import { Block } from "./Primitives";
import { palette, surface } from "./palette";
import { StaticBatch } from "./StaticBatch";
import { plankTexture, roofTexture, stuccoTexture } from "./textures";

const T = 0.3;
const H = GARAGE.ceiling;
const ROOF = H + 0.35;

/** Cangkang garasi: dinding, bukaan rolling door, atap teras, pergola. */
export function Garage() {
  const stucco = surface({ color: palette.stucco, map: stuccoTexture(), roughness: 0.95 });
  const plaster = surface({ color: "#d9a988", map: stuccoTexture(), roughness: 0.95 });
  const redPanel = surface({ color: "#7a2c36", roughness: 0.8 });
  const floor = surface({ color: "#ffffff", map: plankTexture("warm"), roughness: 0.42 });
  const ceiling = surface({ color: "#ffffff", map: plankTexture("dark"), roughness: 0.8 });
  const roof = surface({ color: "#ffffff", map: roofTexture(), roughness: 0.7 });
  const width = GARAGE.maxX - GARAGE.minX;
  const depth = GARAGE.maxZ - GARAGE.minZ;
  const pillar = GARAGE.maxX - GARAGE.doorHalf + T / 2;
  return (
    <group>
      <StaticBatch>
        {/* Lantai papan kayu hangat; sedikit glossy untuk pantulan neon. */}
        <Block position={[0, GROUND_TOP - 0.06, 0]} size={[width, 0.14, depth]} material={floor} map={plankTexture("warm")} tile={2.2} />
        {/* Dinding: belakang panel merah ala referensi garasi, samping plester hangat. */}
        <Block position={[0, H / 2, GARAGE.minZ]} size={[width + T, H, T]} material={plaster} map={stuccoTexture()} />
        <Block position={[0, 2.25, GARAGE.minZ + T / 2 + 0.02]} size={[width - 0.3, 3, 0.04]} material={redPanel} />
        {[GARAGE.minX, GARAGE.maxX].map((x) => (
          <Block key={x} position={[x, H / 2, 0]} size={[T, H, depth]} material={plaster} map={stuccoTexture()} />
        ))}
        {/* Wainscot kayu dan list atas di semua dinding dalam. */}
        <Block position={[0, 0.55, GARAGE.minZ + T / 2 + 0.05]} size={[width - 0.3, 0.95, 0.06]} map={plankTexture("dark")} color="#ffffff" />
        {[GARAGE.minX + T / 2 + 0.03, GARAGE.maxX - T / 2 - 0.03].map((x) => (
          <Block key={`w${x}`} position={[x, 0.55, 0]} size={[0.06, 0.95, depth - 0.3]} map={plankTexture("dark")} color="#ffffff" />
        ))}
        {[GARAGE.minZ + T / 2 + 0.06].map((z) => (
          <Block key={z} position={[0, 3.78, z]} size={[width - 0.3, 0.12, 0.1]} color={palette.wood} />
        ))}
        {/* Pilar depan di kiri-kanan bukaan pintu. */}
        {[-1, 1].map((s) => (
          <Block key={`pf${s}`} position={[s * (GARAGE.doorHalf + pillar / 2), H / 2, GARAGE.maxZ]} size={[pillar, H, T]} material={stucco} map={stuccoTexture()} />
        ))}
        {/* Header, rumah rolling door, dan rangka kayu bukaan. */}
        <Block position={[0, (GARAGE.doorTop + H) / 2, GARAGE.maxZ]} size={[GARAGE.doorHalf * 2, H - GARAGE.doorTop, T]} material={stucco} map={stuccoTexture()} />
        <Block position={[0, GARAGE.doorTop + 0.32, GARAGE.maxZ - 0.35]} size={[GARAGE.doorHalf * 2 - 0.1, 0.5, 0.42]} color={palette.steel} metalness={0.5} roughness={0.5} />
        <Block position={[0, GARAGE.doorTop + 0.05, GARAGE.maxZ + 0.19]} size={[GARAGE.doorHalf * 2 + 0.3, 0.16, 0.1]} color={palette.woodDeep} />
        {[-1, 1].map((s) => (
          <Block key={`jamb${s}`} position={[s * (GARAGE.doorHalf + 0.06), GARAGE.doorTop / 2, GARAGE.maxZ + 0.19]} size={[0.14, GARAGE.doorTop, 0.1]} color={palette.woodDeep} />
        ))}
        {/* Neon oranye di atas bukaan garasi, seperti referensi. */}
        <Block position={[0, GARAGE.doorTop + 0.22, GARAGE.maxZ + 0.28]} size={[GARAGE.doorHalf * 2 - 1.2, 0.07, 0.07]} glowColor={palette.orange} glowIntensity={6} />
        <Block position={[0, GARAGE.doorTop + 0.22, GARAGE.maxZ + 0.22]} size={[GARAGE.doorHalf * 2 - 1.0, 0.16, 0.06]} color={palette.steel} />

        {/* Plafon papan gelap dengan balok melintang. */}
        <Block position={[0, H + 0.05, 0]} size={[width, 0.1, depth]} material={ceiling} map={plankTexture("dark")} tile={2.4} />
        {[-3.4, 0, 3.4].map((z) => (
          <Block key={`beam${z}`} position={[0, H - 0.14, z]} size={[width - 0.3, 0.26, 0.24]} color={palette.wood} />
        ))}
        {[-4, 4].map((x) => (
          <Block key={`girder${x}`} position={[x, H - 0.3, 0]} size={[0.24, 0.2, depth - 0.3]} color={palette.woodDeep} />
        ))}

        {/* Atap datar sebagai teras atas: parapet, pagar kayu, pergola. */}
        <Block position={[0, H + 0.2, 0]} size={[width + 0.6, 0.3, depth + 0.6]} material={stucco} map={stuccoTexture()} />
        <Block position={[0, H + 0.36, 0]} size={[width - 0.3, 0.04, depth - 0.3]} map={plankTexture("warm")} color="#ffffff" />
        {[
          [0, GARAGE.minZ - 0.15, width + 0.6, 0.3],
          [GARAGE.minX - 0.15, 0, 0.3, depth + 0.6],
          [GARAGE.maxX + 0.15, 0, 0.3, depth + 0.6],
          [0, GARAGE.maxZ + 0.15, width + 0.6, 0.3],
        ].map(([x, z, w, d], i) => (
          <group key={`parapet${i}`}>
            <Block position={[x, ROOF + 0.3, z]} size={[w, 0.6, d]} material={stucco} map={stuccoTexture()} />
            <Block position={[x, ROOF + 0.95, z]} size={[w, 0.08, d * 0.5]} color={palette.wood} />
          </group>
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <Block key={`rf${i}`} position={[GARAGE.minX + 0.2 + i * 0.77, ROOF + 0.78, GARAGE.maxZ + 0.15]} size={[0.06, 0.35, 0.06]} color={palette.woodWarm} />
        ))}
        {[-4.2, 4.2].flatMap((x) =>
          [-3.6, 2.6].map((z) => (
            <Block key={`pg${x}${z}`} position={[x, ROOF + 1.25, z]} size={[0.2, 2.5, 0.2]} color={palette.wood} />
          )),
        )}
        {[-3.6, 2.6].map((z) => (
          <Block key={`pgb${z}`} position={[0, ROOF + 2.55, z]} size={[9.2, 0.18, 0.22]} color={palette.wood} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <Block key={`pgr${i}`} position={[-4.2 + i * 1.4, ROOF + 2.7, -0.5]} size={[0.12, 0.14, 7.2]} color={palette.woodWarm} />
        ))}
        <mesh position={[0, ROOF + 2.45, -0.5]} rotation={[-Math.PI / 2, 0, 0]} material={surface({ color: palette.fabricCream, roughness: 1, side: 2 })}>
          <planeGeometry args={[8.4, 6.2]} />
        </mesh>

        {/* Awning genteng di atas pintu garasi. */}
        <group position={[0, H + 0.62, GARAGE.maxZ + 0.75]} rotation={[0.42, 0, 0]}>
          <Block size={[width + 0.9, 0.12, 1.75]} material={roof} map={roofTexture()} tile={1.2} />
          <Block position={[0, -0.05, 0.87]} size={[width + 0.9, 0.2, 0.1]} color={palette.woodDeep} />
        </group>
        {[-5.2, -1.7, 1.7, 5.2].map((x) => (
          <Block key={`br${x}`} position={[x, H + 0.15, GARAGE.maxZ + 0.55]} size={[0.12, 0.12, 0.9]} rotation={[0.42, 0, 0]} color={palette.woodDeep} />
        ))}
      </StaticBatch>

      <WallSconce position={[-(GARAGE.doorHalf + pillar / 2 - 0.05), 2.3, GARAGE.maxZ + T / 2 + 0.03]} height={0.95} />
      <WallSconce position={[GARAGE.doorHalf + pillar / 2 - 0.05, 2.3, GARAGE.maxZ + T / 2 + 0.03]} height={0.95} />
      <Banner position={[GARAGE.maxX + T / 2 + 0.04, 2.5, 3.6]} rotationY={Math.PI / 2} size={[0.75, 1.6]} />
      <StringLights from={[-4.2, ROOF + 2.3, -3.6]} to={[4.2, ROOF + 2.3, 2.6]} sag={0.5} count={18} />
      <StringLights from={[4.2, ROOF + 2.3, -3.6]} to={[-4.2, ROOF + 2.3, 2.6]} sag={0.5} count={18} />
      <Lamp position={[0, GARAGE.doorTop - 0.1, GARAGE.maxZ + 0.9]} color={palette.orange} intensity={10} distance={9} essential />
      <Lamp position={[0, ROOF + 1.6, -0.5]} color="#ffd08a" intensity={5} distance={7} />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[0, H / 2, GARAGE.minZ]} args={[width / 2 + T / 2, H / 2, T / 2]} />
        <CuboidCollider position={[GARAGE.minX, H / 2, 0]} args={[T / 2, H / 2, depth / 2]} />
        <CuboidCollider position={[GARAGE.maxX, H / 2, 0]} args={[T / 2, H / 2, depth / 2]} />
        {[-1, 1].map((s) => (
          <CuboidCollider key={s} position={[s * (GARAGE.doorHalf + pillar / 2), H / 2, GARAGE.maxZ]} args={[pillar / 2, H / 2, T / 2]} />
        ))}
        <CuboidCollider position={[0, (GARAGE.doorTop + H) / 2 + 0.1, GARAGE.maxZ - 0.2]} args={[GARAGE.doorHalf, (H - GARAGE.doorTop) / 2 + 0.1, 0.4]} />
        <CuboidCollider position={[0, H + 0.2, 0]} args={[width / 2 + 0.3, 0.2, depth / 2 + 0.3]} />
      </RigidBody>
    </group>
  );
}
