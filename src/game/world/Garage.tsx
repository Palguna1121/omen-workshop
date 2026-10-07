import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Block, Plant } from "./Primitives";

function Desk({ x, workbench = false }: { x: number; workbench?: boolean }) {
  return (
    <group position={[x, 0, -3.3]}>
      <Block position={[0, 1, 0]} size={[2.7, 0.14, 1.15]} color="#a3774d" />
      {[-1.15, 1.15].map((v) => (
        <Block
          key={v}
          position={[v, 0.5, 0]}
          size={[0.15, 1, 0.9]}
          color="#536760"
        />
      ))}
      {workbench ? (
        <>
          <Block
            position={[0, 2.2, -1.48]}
            size={[2.6, 1.6, 0.1]}
            color="#ab936d"
          />
          <Block
            position={[-0.5, 1.17, 0]}
            size={[0.85, 0.16, 0.7]}
            color="#556b67"
          />
          <Block
            position={[0.6, 1.2, -0.05]}
            size={[0.6, 0.25, 0.65]}
            color="#c7bd9d"
          />
          <Block
            position={[0.6, 1.34, -0.05]}
            size={[0.65, 0.05, 0.7]}
            color="#e3c393"
          />
        </>
      ) : (
        <>
          <Block
            position={[0, 1.65, -0.25]}
            size={[1.7, 1, 0.12]}
            color="#354945"
          />
          <Block
            position={[0, 1.65, -0.175]}
            size={[1.5, 0.8, 0.03]}
            color="#244c45"
            emissive="#326f63"
          />
          {Array.from({ length: 5 }, (_, i) => (
            <Block
              key={i}
              position={[-0.22 + (i % 2) * 0.07, 1.91 - i * 0.13, -0.15]}
              size={[0.85 - (i % 3) * 0.18, 0.025, 0.015]}
              color={i % 2 ? "#e9c58b" : "#9ac5b2"}
              emissive="#7abbaa"
            />
          ))}
          <Block
            position={[0, 1.25, -0.25]}
            size={[0.15, 0.35, 0.12]}
            color="#354945"
          />
          <Block
            position={[0, 1.1, 0.2]}
            size={[1, 0.05, 0.32]}
            color="#e2d9c6"
          />
          <Block
            position={[1, 1.23, 0]}
            size={[0.25, 0.32, 0.25]}
            color="#b7784d"
          />
          <Block
            position={[0, 0.45, 1.1]}
            size={[0.65, 0.12, 0.65]}
            color="#678777"
          />
          <Block
            position={[0, 0.82, 1.4]}
            size={[0.65, 0.7, 0.12]}
            color="#678777"
          />
        </>
      )}
    </group>
  );
}

export function Garage() {
  return (
    <group>
      <Desk x={-4} />
      <Desk x={3.7} workbench />
      <Block
        position={[-4.8, 0.4, 1.7]}
        size={[1.4, 0.6, 2.7]}
        color="#a5b09a"
      />
      <Block
        position={[-5.4, 0.8, 1.7]}
        size={[0.3, 1.1, 2.7]}
        color="#899880"
      />
      {[-0.9, 0, 0.9].map((z) => (
        <Block
          key={z}
          position={[-4.5, 0.78, 1.7 + z]}
          size={[0.9, 0.17, 0.83]}
          color="#bfcaaf"
        />
      ))}
      <Block
        position={[-3.1, 0.4, 1.6]}
        size={[0.7, 0.15, 1.5]}
        color="#8e7054"
      />
      <Block
        position={[-3.1, 0.55, 1.6]}
        size={[0.4, 0.06, 0.55]}
        color="#e3d4b7"
      />
      <Block
        position={[-3.4, 0.14, 1.5]}
        size={[3, 0.035, 3.4]}
        color="#d7b082"
      />
      <Block
        position={[4.95, 1.2, 0.2]}
        size={[1.6, 2.4, 0.9]}
        color="#877357"
      />
      {Array.from({ length: 3 }, (_, i) => (
        <group key={i}>
          <Block
            position={[4.94, 0.55 + i * 0.7, 0.7]}
            size={[1.45, 0.59, 0.04]}
            color="#665843"
          />
          {Array.from({ length: 4 }, (_, j) => (
            <Block
              key={j}
              position={[4.42 + j * 0.29, 0.5 + i * 0.7, 0.76]}
              size={[0.19, 0.45 - j * 0.04, 0.3]}
              color={["#b89067", "#8caaa0", "#d6bd8f", "#b08469"][j]}
            />
          ))}
        </group>
      ))}
      <mesh position={[4.9, 2.7, 0.2]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#d1af5e"
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>
      <Block
        position={[0, 2.1, -4.78]}
        size={[2.5, 1.45, 0.12]}
        color="#8f6f51"
      />
      <Block
        position={[0, 2.1, -4.7]}
        size={[2.32, 1.27, 0.03]}
        color="#c6b694"
      />
      {[-0.7, 0, 0.7].map((x, i) => (
        <group key={x}>
          <Block
            position={[x, 2.2 - (i % 2) * 0.2, -4.66]}
            size={[0.55, 0.7, 0.025]}
            rotation={[0, 0, (i - 1) * 0.08]}
            color="#ece3cd"
          />
          <Block
            position={[x, 2.25 - (i % 2) * 0.2, -4.64]}
            size={[0.42, 0.42, 0.01]}
            color={["#8faa98", "#b98d6f", "#a5b7bc"][i]}
          />
        </group>
      ))}
      <Block
        position={[-5.78, 2.2, -0.15]}
        size={[0.12, 1.6, 1.6]}
        color="#786c53"
      />
      <Block
        position={[-5.69, 2.2, -0.15]}
        size={[0.03, 1.42, 1.42]}
        color="#bdd4c1"
        emissive="#bbc8a8"
      />
      <Block
        position={[-5.64, 2.2, -0.15]}
        size={[0.05, 1.42, 0.06]}
        color="#786c53"
      />
      <Block
        position={[-5.64, 2.2, -0.15]}
        size={[0.05, 0.06, 1.42]}
        color="#786c53"
      />
      <Plant position={[-5.1, 0.13, -4.25]} />
      <Plant position={[-5.2, 0.13, 3.7]} scale={1.3} />
      <Plant position={[2.1, 0.13, -4.2]} scale={0.85} />
      {[-3.5, 3.5].map((x) => (
        <group key={x}>
          <Block
            position={[x, 3.45, -1.8]}
            size={[0.025, 1, 0.025]}
            color="#554e40"
          />
          <mesh position={[x, 2.95, -1.8]}>
            <coneGeometry args={[0.45, 0.3, 12]} />
            <meshStandardMaterial
              color="#c69560"
              emissive="#ffd595"
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight
            position={[x, 2.8, -1.8]}
            color="#ffdc9c"
            intensity={8}
            distance={8}
            decay={2}
          />
        </group>
      ))}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[-4, 0.55, -3.3]} args={[1.35, 0.55, 0.58]} />
        <CuboidCollider
          position={[3.7, 0.55, -3.3]}
          args={[1.35, 0.55, 0.58]}
        />
        <CuboidCollider position={[-4.8, 0.55, 1.7]} args={[0.7, 0.55, 1.35]} />
        <CuboidCollider position={[-3.1, 0.3, 1.6]} args={[0.35, 0.3, 0.75]} />
        <CuboidCollider position={[4.95, 1.2, 0.2]} args={[0.8, 1.2, 0.45]} />
      </RigidBody>
    </group>
  );
}
