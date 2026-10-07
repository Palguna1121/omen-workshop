import { Float } from "@react-three/drei";
import { useGameStore } from "@/store/gameStore";
import { Block } from "./Primitives";

export function LabEquipment() {
  const reduced = useGameStore((s) => s.reducedMotion);
  return (
    <group>
      {/* Semua alat berada di atas meja yang sudah memiliki collider. */}
      <group position={[4.45, 1.1, -3.35]}>
        <Block size={[0.7, 0.1, 0.65]} color="#333b43" />
        {[-0.3, 0.3].map((x) => (
          <Block key={x} position={[x, 0.36, -0.2]} size={[0.04, 0.7, 0.04]} color="#4d535b" />
        ))}
        <Block position={[0, 0.72, -0.2]} size={[0.65, 0.06, 0.08]} color="#4d535b" />
        <Block position={[0, 0.45, -0.2]} size={[0.45, 0.04, 0.08]} color="#bf9464" />
        <Block position={[0, 0.34, -0.15]} size={[0.08, 0.18, 0.08]} color="#678b87" />
        <mesh position={[0, 0.15, 0]}>
          <torusKnotGeometry args={[0.12, 0.045, 32, 6]} />
          <meshStandardMaterial color="#8daab1" roughness={0.65} />
        </mesh>
      </group>
      <group position={[3.1, 1.25, -3.2]}>
        <Block size={[0.65, 0.22, 0.6]} color="#384e4d" />
        <Block position={[0, 0.13, 0]} size={[0.55, 0.025, 0.5]} color="#76c7cb" emissive="#6ebfcd" />
        <Float speed={reduced ? 0 : 1.5} floatIntensity={reduced ? 0 : 0.2} rotationIntensity={reduced ? 0 : 0.25}>
          <mesh position={[0, 0.45, 0]}>
            <icosahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color="#7e6ea2" emissive="#7083ad" emissiveIntensity={0.35} wireframe />
          </mesh>
        </Float>
      </group>
      <group position={[-5.05, 1.32, -3.4]}>
        <Block size={[0.28, 0.5, 0.45]} color="#34434b" />
        {[0, 1, 2].map((i) => (
          <Block key={i} position={[0, 0.14 - i * 0.12, 0.235]} size={[0.16, 0.04, 0.015]} color="#7cd3d2" emissive="#75bfc9" />
        ))}
      </group>
      <group position={[0, 3.25, -4.79]}>
        <Block size={[1.05, 0.5, 0.06]} color="#51455f" />
        {[-0.18, 0, 0.18].map((x) => (
          <Block key={x} position={[x, 0, 0.05]} size={[0.045, 0.25, 0.035]} rotation={[0, 0, -0.15]} color="#95d6da" emissive="#75bdc4" />
        ))}
      </group>
    </group>
  );
}
