import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGameStore } from "@/store/gameStore";
import { Block } from "./Primitives";

export function Portal() {
  const ring = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ring.current && !useGameStore.getState().reducedMotion)
      ring.current.rotation.z += delta * 0.12;
  });
  return (
    <group position={[4.3, 0, 3.3]}>
      <Block position={[0, 0.2, 0]} size={[1.4, 0.4, 1.2]} color="#526e66" />
      <group ref={ring} position={[0, 1.5, 0]}>
        <mesh>
          <torusGeometry args={[0.82, 0.075, 8, 32]} />
          <meshStandardMaterial
            color="#759f92"
            emissive="#67ac94"
            emissiveIntensity={0.9}
          />
        </mesh>
        <mesh rotation={[0, 0.45, 0.45]}>
          <torusGeometry args={[0.52, 0.025, 6, 24]} />
          <meshStandardMaterial
            color="#f2d99e"
            emissive="#d6b976"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.25]} />
          <meshStandardMaterial
            color="#a6d3bb"
            emissive="#7bc9a9"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
      <pointLight
        position={[0, 1.3, 0]}
        color="#80b89e"
        intensity={3}
        distance={4}
      />
    </group>
  );
}
