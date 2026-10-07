import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Block, Plant, Tree } from "./Primitives";

export function House() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, 0]}
        receiveShadow
      >
        <circleGeometry args={[45, 48]} />
        <meshStandardMaterial color="#a8b79e" />
      </mesh>
      <Block position={[0, -0.1, 0]} size={[12.4, 0.3, 10.4]} color="#988b76" />
      {Array.from({ length: 12 }, (_, i) => (
        <Block
          key={i}
          position={[-5.5 + i, 0.075, 0]}
          size={[0.97, 0.08, 10]}
          color={i % 3 === 0 ? "#c5aa80" : "#ceb88f"}
        />
      ))}
      <Block position={[0, 2, -5]} size={[12, 4, 0.3]} color="#b8b7a2" />
      <Block position={[-6, 2, 0]} size={[0.3, 4, 10]} color="#c8bca4" />
      <Block position={[6, 2, 0]} size={[0.3, 4, 10]} color="#b9b6a1" />
      <Block position={[0, 4.08, 0]} size={[12, 0.18, 10]} color="#c4ad8c" />
      {/* Wainscot, plinth dan rangka membuat ruang terasa sebagai garasi kayu. */}
      <Block position={[0, 0.58, -4.81]} size={[11.7, 0.95, 0.06]} color="#647b70" />
      <Block position={[-5.81, 0.58, 0]} size={[0.06, 0.95, 9.7]} color="#647b70" />
      <Block position={[5.81, 0.58, 0]} size={[0.06, 0.95, 9.7]} color="#647b70" />
      <Block position={[0, 1.1, -4.76]} size={[11.7, 0.08, 0.1]} color="#9b7652" />
      <Block position={[-5.76, 1.1, 0]} size={[0.1, 0.08, 9.7]} color="#9b7652" />
      <Block position={[5.76, 1.1, 0]} size={[0.1, 0.08, 9.7]} color="#9b7652" />
      {[-5.7, -1.7, 1.7, 5.7].map((x) => (
        <Block key={`post-${x}`} position={[x, 2, -4.78]} size={[0.14, 3.8, 0.14]} color="#846b51" />
      ))}
      <Block position={[-4.15, 2, 5]} size={[3.7, 4, 0.3]} color="#e2d5bf" />
      <Block position={[4.15, 2, 5]} size={[3.7, 4, 0.3]} color="#e2d5bf" />
      <Block position={[0, 3.6, 5]} size={[4.6, 0.8, 0.35]} color="#7a6b58" />
      <Block
        position={[0, 3.24, 5.1]}
        size={[4.5, 0.1, 0.15]}
        color="#f6d895"
        emissive="#ffc65c"
      />
      {[-5.9, 5.9].map((x) => (
        <Block
          key={x}
          position={[x, 3.88, 0]}
          size={[0.16, 0.2, 10.5]}
          color="#796b58"
        />
      ))}
      {[-4.8, 0, 4.8].map((x) => (
        <Block
          key={x}
          position={[x, 3.95, 0]}
          size={[0.16, 0.2, 10]}
          color="#9a8263"
        />
      ))}
      <group>
          <Block
            position={[-3.2, 4.9, 0]}
            size={[6.9, 0.2, 11]}
            rotation={[0, 0, 0.31]}
            color="#677777"
          />
          <Block
            position={[3.2, 4.9, 0]}
            size={[6.9, 0.2, 11]}
            rotation={[0, 0, -0.31]}
            color="#617273"
          />
          <Block
            position={[0, 6.02, 0]}
            size={[0.22, 0.18, 11.1]}
            color="#506565"
          />
          {Array.from({ length: 8 }, (_, i) => (
            <group key={i}>
              <Block
                position={[-3.2, 5.02, -4.6 + i * 1.3]}
                size={[6.9, 0.035, 0.035]}
                rotation={[0, 0, 0.31]}
                color="#849190"
              />
              <Block
                position={[3.2, 5.02, -4.6 + i * 1.3]}
                size={[6.9, 0.035, 0.035]}
                rotation={[0, 0, -0.31]}
                color="#849190"
              />
            </group>
          ))}
      </group>
      <Block position={[8.5, 1.75, -1]} size={[5, 3.5, 8]} color="#b8bba3" />
      <Block
        position={[8.5, 3.7, -1]}
        size={[5.5, 0.25, 8.5]}
        color="#627575"
      />
      <Block
        position={[8.5, 1.8, 3.04]}
        size={[2.8, 1.7, 0.1]}
        color="#55726c"
        emissive="#acb783"
      />
      <Block
        position={[8.5, 1.8, 3.12]}
        size={[0.08, 1.8, 0.12]}
        color="#e0d2b8"
      />
      <Block
        position={[8.5, 1.8, 3.12]}
        size={[2.9, 0.08, 0.12]}
        color="#e0d2b8"
      />
      <Block position={[0, -0.02, 9]} size={[4.6, 0.1, 8]} color="#c1bba9" />
      {Array.from({ length: 6 }, (_, i) => (
        <Block
          key={i}
          position={[0, 0.04, 6 + i * 1.35]}
          size={[4.2, 0.03, 0.05]}
          color="#a4a392"
        />
      ))}
      <Plant position={[-2.9, 0.1, 5.7]} scale={1.4} />
      <Plant position={[3, 0.1, 5.7]} scale={1.4} />
      <Tree position={[-10, -0.2, -6]} scale={1.7} />
      <Tree position={[-12, -0.2, 5]} scale={1.4} />
      <Tree position={[14, -0.2, -7]} scale={1.8} />
      <Tree position={[15, -0.2, 7]} scale={1.3} />
      <Tree position={[-2, -0.2, -11]} scale={1.6} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[0, -0.12, 0]} args={[22, 0.2, 22]} />
        <CuboidCollider position={[0, 2, -5]} args={[6, 2, 0.15]} />
        <CuboidCollider position={[-6, 2, 0]} args={[0.15, 2, 5]} />
        <CuboidCollider position={[6, 2, 0]} args={[0.15, 2, 5]} />
        <CuboidCollider position={[0, 4.08, 0]} args={[6, 0.09, 5]} />
        <CuboidCollider position={[-4.15, 2, 5]} args={[1.85, 2, 0.15]} />
        <CuboidCollider position={[4.15, 2, 5]} args={[1.85, 2, 0.15]} />
        {/* Area bermain dibatasi pada hub, meskipun pintu terlihat terbuka. */}
        <CuboidCollider position={[0, 1, 5.2]} args={[2.3, 1, 0.1]} />
      </RigidBody>
    </group>
  );
}
