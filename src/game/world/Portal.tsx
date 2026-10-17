import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from "three";
import { useGameStore } from "@/store/gameStore";
import { crystals } from "../config";
import { GARAGE } from "./layout";
import { Lamp } from "./Lanterns";
import { Block } from "./Primitives";
import { palette } from "./palette";
import { noiseGLSL } from "./Sky";

// Uniform dibagi kedua portal; warna berubah keemasan setelah semua kristal ditemukan.
const uniforms = {
  uTime: { value: 0 },
  uA: { value: new Color("#7b3fe4").multiplyScalar(2.2) },
  uB: { value: new Color("#3ee8ff").multiplyScalar(2.6) },
  uCore: { value: new Color("#ffffff").multiplyScalar(2.5) },
};
const base = { a: uniforms.uA.value.clone(), b: uniforms.uB.value.clone() };
const gold = { a: new Color("#ff9a3c").multiplyScalar(2.4), b: new Color("#ffe08a").multiplyScalar(2.6) };

function createPortalMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    toneMapped: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uA, uB, uCore;
      varying vec2 vUv;
      ${noiseGLSL}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        p.y *= 0.82;
        float r = length(p);
        float a = atan(p.y, p.x);
        float swirl = a + uTime * 0.8 + r * 5.0;
        vec2 q = vec2(cos(swirl), sin(swirl)) * r * 2.4;
        float n = fbm(q * 1.6 + uTime * 0.15);
        float bands = smoothstep(0.35, 0.95, sin(swirl * 3.0 + n * 6.0) * 0.5 + 0.5);
        vec3 col = mix(uA, uB, bands * n);
        col += uCore * pow(max(0.0, 1.0 - r * 1.8), 3.0);
        float edge = smoothstep(1.0, 0.82, r);
        float rim = smoothstep(0.78, 0.93, r) * edge;
        col += uB * rim * 1.2;
        gl_FragColor = vec4(col * edge * (0.55 + n * 0.6), edge);
      }`,
  });
}

function usePortalClock() {
  useFrame(({ clock }, delta) => {
    const state = useGameStore.getState();
    if (!state.reducedMotion) uniforms.uTime.value = clock.elapsedTime;
    const complete = state.found.length === crystals.length;
    const k = 1 - Math.exp(-2 * Math.min(delta, 0.1));
    uniforms.uA.value.lerp(complete ? gold.a : base.a, k);
    uniforms.uB.value.lerp(complete ? gold.b : base.b, k);
  });
}

/** Portal batu di dinding kanan garasi (lengkung batunya ada di Interior). */
export function Portal() {
  const material = useMemo(() => createPortalMaterial(), []);
  usePortalClock();
  return (
    <group position={[GARAGE.maxX - 0.52, 1.5, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh material={material} position={[0, 0.05, 0]}>
        <planeGeometry args={[1.75, 2.05]} />
      </mesh>
      <Lamp position={[0, 0, 0.8]} color="#8f6bff" intensity={7} distance={6} essential flicker={0.12} />
    </group>
  );
}

const ROOF = GARAGE.ceiling + 0.38;

/** Portal kecil di teras atap untuk kembali ke garasi; termasuk collider atap. */
export function RoofPortal() {
  const material = useMemo(() => createPortalMaterial(), []);
  return (
    <group>
      <group position={[-3.3, ROOF, -2.95]}>
        <Block position={[0, 0.1, 0]} size={[1.5, 0.2, 0.7]} color={palette.stoneDark} />
        <Block position={[0, 0.22, 0.36]} size={[1.4, 0.025, 0.03]} glowColor={palette.cyan} glowIntensity={4} />
        <mesh position={[0, 1.05, 0]} material={material}>
          <circleGeometry args={[0.62, 40]} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <torusGeometry args={[0.68, 0.09, 10, 40]} />
          <meshStandardMaterial color={palette.stone} roughness={0.9} />
        </mesh>
        <Lamp position={[0, 1.05, 0.6]} color="#8f6bff" intensity={5} distance={5} flicker={0.12} />
      </group>
      <RigidBody type="fixed" colliders={false}>
        {/* Parapet atap dan pergola: tidak jatuh tanpa sengaja, tapi tetap bisa dilompati. */}
        <CuboidCollider position={[0, ROOF + 0.5, GARAGE.minZ - 0.15]} args={[6.3, 0.5, 0.15]} />
        <CuboidCollider position={[0, ROOF + 0.5, GARAGE.maxZ + 0.15]} args={[6.3, 0.5, 0.15]} />
        <CuboidCollider position={[GARAGE.minX - 0.15, ROOF + 0.5, 0]} args={[0.15, 0.5, 5.3]} />
        <CuboidCollider position={[GARAGE.maxX + 0.15, ROOF + 0.5, 0]} args={[0.15, 0.5, 5.3]} />
        {[-4.2, 4.2].flatMap((x) =>
          [-3.6, 2.6].map((z) => (
            <CuboidCollider key={`${x}${z}`} position={[x, ROOF + 1.25, z]} args={[0.12, 1.25, 0.12]} />
          )),
        )}
        <CuboidCollider position={[-3.3, ROOF + 0.9, -2.95]} args={[0.75, 0.9, 0.3]} />
      </RigidBody>
    </group>
  );
}
