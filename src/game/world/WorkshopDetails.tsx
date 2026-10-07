import { RoundedBox } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Block, Plant } from "./Primitives";

export function WorkshopDetails() {
  return (
    <group>
      {/* Rak buku dan bahan eksperimen berada di atas meja komputer. */}
      <Block position={[-4, 2.8, -4.53]} size={[2.8, 0.09, 0.5]} color="#99734f" />
      {Array.from({ length: 7 }, (_, i) => (
        <group key={`book-${i}`} position={[-5.1 + i * 0.16, 3.04, -4.46]} rotation={[0, 0, i === 6 ? -0.14 : 0]}>
          <Block size={[0.12, 0.4 + (i % 3) * 0.07, 0.28]} color={["#476c67", "#b9805b", "#b9b08a"][i % 3]} />
          <Block position={[0, -0.09, 0.147]} size={[0.095, 0.025, 0.012]} color="#ddd0aa" />
        </group>
      ))}
      <Block position={[-3.45, 3.05, -4.46]} size={[0.5, 0.43, 0.36]} color="#87918a" />
      <Block position={[-3.45, 3.07, -4.27]} size={[0.2, 0.08, 0.015]} color="#eee0ba" />
      <Plant position={[-2.92, 2.85, -4.48]} scale={0.48} />

      {/* Lampu kecil pada kabel, tanpa tambahan shadow map per bohlam. */}
      {Array.from({ length: 11 }, (_, i) => {
        const y1 = 3.38 - Math.sin(i / 11 * Math.PI) * 0.2;
        const y2 = 3.38 - Math.sin((i + 1) / 11 * Math.PI) * 0.2;
        return <Block key={`wire-${i}`} position={[-5.05 + (i + 0.5) * 0.92, (y1 + y2) / 2, -4.5]} size={[Math.hypot(0.92, y2 - y1), 0.018, 0.018]} rotation={[0, 0, Math.atan2(y2 - y1, 0.92)]} color="#48483e" />;
      })}
      {Array.from({ length: 12 }, (_, i) => (
        <group key={`bulb-${i}`} position={[-5.05 + i * 0.92, 3.3 - Math.sin(i / 11 * Math.PI) * 0.2, -4.5]}>
          <Block position={[0, 0.04, 0]} size={[0.025, 0.14, 0.025]} color="#48483e" />
          <mesh>
            <sphereGeometry args={[0.052, 8, 6]} />
            <meshStandardMaterial color="#ffe7b0" emissive="#ffbe62" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}

      {/* Alat pada pegboard: palu, obeng, dan kunci, bukan batang kosong. */}
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
        <group key={`tool-${x}`} position={[3.7 + x, 2.18 + (i % 2) * 0.16, -4.61]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.12]}>
          <Block size={[0.055, 0.42, 0.04]} color={i % 2 ? "#ba7750" : "#52685f"} />
          {i === 0 ? (
            <Block position={[0, 0.23, 0]} size={[0.3, 0.11, 0.09]} color="#8d9993" />
          ) : i % 2 ? (
            <Block position={[0, 0.31, 0]} size={[0.026, 0.24, 0.025]} color="#b6bcb1" />
          ) : (
            <mesh position={[0, 0.25, 0]}>
              <torusGeometry args={[0.08, 0.025, 6, 10, Math.PI * 1.5]} />
              <meshStandardMaterial color="#afb6ae" metalness={0.45} roughness={0.55} />
            </mesh>
          )}
        </group>
      ))}
      <group position={[4.57, 1.22, -3.13]}>
        <Block size={[0.52, 0.26, 0.3]} color="#a86743" />
        <Block position={[0, 0.21, 0]} size={[0.27, 0.045, 0.04]} color="#3e4c45" />
        {[-0.14, 0.14].map((x) => <Block key={x} position={[x, 0.16, 0]} size={[0.04, 0.14, 0.04]} color="#3e4c45" />)}
        <Block position={[0, 0.015, 0.16]} size={[0.08, 0.07, 0.025]} color="#d7c39a" />
      </group>

      {/* Benda kecil yang memberi skala manusia pada sudut santai. */}
      {[-0.9, 0.9].map((z, i) => (
        <RoundedBox key={z} args={[0.43, 0.5, 0.45]} radius={0.08} smoothness={2} position={[-4.7, 1.04, 1.7 + z]} rotation={[0, 0.15, -0.16]} castShadow receiveShadow>
          <meshStandardMaterial color={i ? "#c79966" : "#657e83"} roughness={0.95} />
        </RoundedBox>
      ))}
      {[-1.1, -0.7, 0.7, 1.1].map((z) => (
        <Block key={`rug-${z}`} position={[-3.4, 0.161, 1.5 + z]} size={[2.7, 0.005, 0.06]} color="#a87d59" />
      ))}
      <group position={[-3.08, 0.63, 1.86]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.075, 0.16, 12]} />
          <meshStandardMaterial color="#68857c" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.074, 12]} />
          <meshStandardMaterial color="#493b2f" />
        </mesh>
        <mesh position={[0.095, 0, 0]}>
          <torusGeometry args={[0.045, 0.018, 6, 10]} />
          <meshStandardMaterial color="#68857c" />
        </mesh>
      </group>
      <group position={[3.7, 0, -1.62]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 12]} />
          <meshStandardMaterial color="#a77e56" roughness={0.9} />
        </mesh>
        {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
          <Block key={`${x}-${z}`} position={[x * 0.21, 0.29, z * 0.21]} size={[0.055, 0.5, 0.055]} color="#40544d" />
        )))}
      </group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[3.7, 0.3, -1.62]} args={[0.3, 0.3, 0.3]} />
      </RigidBody>
    </group>
  );
}
