import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color, Mesh, ShaderMaterial } from "three";
import { useGameStore } from "@/store/gameStore";
import { SUN_VISUAL, sky } from "./environment";

export const noiseGLSL = /* glsl */ `
float hash12(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1,0)), f.x),
             mix(hash12(i + vec2(0,1)), hash12(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}`;

// Uniform waktu dibagi semua material langit; dimutasi di useFrame (level modul).
const skyTime = { value: 0 };

export function createSkyMaterial() {
  return new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    uniforms: {
      uTime: skyTime,
      uSun: { value: SUN_VISUAL.clone() },
      uZenith: { value: new Color(sky.zenith) },
      uUpper: { value: new Color(sky.upper) },
      uHorizon: { value: new Color(sky.horizon) },
      uHorizonSun: { value: new Color(sky.horizonSun) },
      uSunColor: { value: new Color(sky.sun) },
      uCloudLit: { value: new Color(sky.cloudLit) },
      uCloudDark: { value: new Color(sky.cloudDark) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uSun, uZenith, uUpper, uHorizon, uHorizonSun, uSunColor, uCloudLit, uCloudDark;
      varying vec3 vDir;
      ${noiseGLSL}
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        float sunDot = dot(d, uSun);
        float s = max(sunDot, 0.0);
        float az = dot(normalize(d.xz + 1e-5), normalize(uSun.xz)) * 0.5 + 0.5;
        vec3 horizon = mix(uHorizon, uHorizonSun, pow(az, 3.0));
        vec3 col = mix(horizon, uUpper, smoothstep(0.0, 0.3, h));
        col = mix(col, uZenith, smoothstep(0.26, 0.85, h));
        col = mix(col, horizon * 0.75, smoothstep(0.0, -0.2, h));
        col += uSunColor * (pow(s, 5.0) * 0.32 + pow(s, 60.0) * 0.9);
        col += uSunColor * smoothstep(0.9990, 0.9995, sunDot) * 7.0;
        if (h > -0.02) {
          vec2 uv = d.xz / (max(h, 0.0) + 0.1);
          float n = fbm(uv * 0.75 + vec2(uTime * 0.006, uTime * 0.0025));
          float band = smoothstep(0.01, 0.1, h) * (1.0 - smoothstep(0.42, 0.78, h));
          float c = smoothstep(0.48, 0.76, n) * band;
          float lit = clamp(pow(s, 2.5) * 1.6 + pow(az, 2.0) * 0.55 - h * 0.6, 0.0, 1.0);
          vec3 cloud = mix(uCloudDark, uCloudLit, lit);
          cloud += uSunColor * pow(s, 10.0) * smoothstep(0.52, 0.7, n) * 1.4;
          col = mix(col, cloud, c * 0.92);
          vec2 sp = floor(d.xz / (h + 0.06) * 110.0);
          float star = step(0.9965, hash12(sp)) * smoothstep(0.38, 0.95, h) * (1.0 - c);
          col += vec3(star) * (0.6 + 0.4 * sin(uTime * 2.0 + hash12(sp) * 40.0));
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/** Kubah langit sunset yang mengikuti kamera. */
export function SkyDome({ follow = true }: { follow?: boolean }) {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(() => createSkyMaterial(), []);
  useFrame(({ camera, clock }) => {
    if (follow && !useGameStore.getState().reducedMotion) skyTime.value = clock.elapsedTime;
    if (follow && mesh.current) mesh.current.position.copy(camera.position);
  });
  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[500, 48, 24]} />
    </mesh>
  );
}
