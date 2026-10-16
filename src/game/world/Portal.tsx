import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from "three";
import { useGameStore } from "@/store/gameStore";
import { GARAGE } from "./layout";
import { Lamp } from "./Lanterns";
import { noiseGLSL } from "./Sky";

const portalTime = { value: 0 };

/** Permukaan portal: pusaran noise ungu-cyan di dalam lengkung batu. */
export function Portal() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        toneMapped: false,
        uniforms: {
          uTime: portalTime,
          uA: { value: new Color("#7b3fe4").multiplyScalar(2.2) },
          uB: { value: new Color("#3ee8ff").multiplyScalar(2.6) },
          uCore: { value: new Color("#ffffff").multiplyScalar(2.5) },
        },
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
      }),
    [],
  );
  useFrame(({ clock }) => {
    if (!useGameStore.getState().reducedMotion) portalTime.value = clock.elapsedTime;
  });
  return (
    <group position={[GARAGE.maxX - 0.52, 1.5, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh material={material} position={[0, 0.05, 0]}>
        <planeGeometry args={[1.75, 2.05]} />
      </mesh>
      <Lamp position={[0, 0, 0.8]} color="#8f6bff" intensity={7} distance={6} essential flicker={0.12} />
    </group>
  );
}
