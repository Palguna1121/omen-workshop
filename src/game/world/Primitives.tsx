import type { Vec3 } from "../config";

export function Block({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = "#d1c3ae",
  rotation,
  emissive,
}: {
  position?: Vec3;
  size?: Vec3;
  color?: string;
  rotation?: Vec3;
  emissive?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        emissive={emissive}
        emissiveIntensity={emissive ? 0.6 : 0}
      />
    </mesh>
  );
}

export function Plant({
  position,
  scale = 1,
}: {
  position: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.17, 0.4, 8]} />
        <meshStandardMaterial color="#b66c4c" />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.9, 6]} />
        <meshStandardMaterial color="#66553c" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.4) * 0.17,
            0.55 + i * 0.12,
            Math.cos(i * 2.4) * 0.17,
          ]}
          rotation={[0.3, i * 2.4, 0.6]}
          scale={[0.18, 0.4, 0.08]}
          castShadow
        >
          <sphereGeometry args={[1, 7, 5]} />
          <meshStandardMaterial color={i % 2 ? "#6a8661" : "#829773"} />
        </mesh>
      ))}
    </group>
  );
}

export function Tree({
  position,
  scale = 1,
}: {
  position: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.28, 2.8, 6]} />
        <meshStandardMaterial color="#766148" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 2.8 + i * 0.9, 0]} castShadow>
          <coneGeometry args={[1.6 - i * 0.35, 2.3, 7]} />
          <meshStandardMaterial color={["#68846f", "#7b9278", "#8da084"][i]} />
        </mesh>
      ))}
    </group>
  );
}
