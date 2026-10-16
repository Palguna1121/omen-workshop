import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  CircleGeometry,
  Color,
  DodecahedronGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
} from "three";
import { useGameStore } from "@/store/gameStore";
import { FOG, PLOT, SEA_LEVEL, SUN_VISUAL, sky } from "./environment";
import { KitInstances, type KitItem, type KitName } from "./Kit";
import { glow, palette, surface } from "./palette";
import { noiseGLSL } from "./Sky";

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x: number, y: number) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 4; i++) {
    v += a * noise(x, y);
    x *= 2.03;
    y *= 2.03;
    a *= 0.5;
  }
  return v;
}

const SEA_DIR = { x: -0.86, z: -0.5 };
const BACK_DIR = { x: 0.35, z: -0.94 };

/** Tinggi lanskap: plateau plot, bukit di belakang, lembah depan, pantai ke arah matahari. */
export function terrainHeight(x: number, z: number) {
  const ox = x - PLOT.x;
  const oz = z - PLOT.z;
  const dx = Math.max(Math.abs(ox) - PLOT.halfX, 0);
  const dz = Math.max(Math.abs(oz) - PLOT.halfZ, 0);
  const d = Math.hypot(dx, dz);
  const len = Math.hypot(ox, oz) || 1;
  const nx = ox / len;
  const nz = oz / len;
  const wSea = Math.max(0, nx * SEA_DIR.x + nz * SEA_DIR.z);
  const wBack = Math.max(0, nx * BACK_DIR.x + nz * BACK_DIR.z);
  const n = fbm(x * 0.025, z * 0.025);
  let target = -21 + (n - 0.5) * 10;
  target += (24 + n * 26) * Math.pow(wBack, 1.4);
  target = target + (-36 - target) * Math.pow(wSea, 1.1);
  // Lereng landai dulu (taman di bawah tembok), lalu turun ke lembah/laut.
  const t = 1 - Math.exp(-((d / 13) ** 2));
  return -0.35 + (target + 0.35) * t + (n - 0.5) * 6 * t;
}

function Terrain() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(760, 760, 190, 190);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const grass = new Color("#2c4a31");
    const grassLight = new Color("#4f6f37");
    const rock = new Color("#5b4552");
    const sand = new Color("#c8916e");
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);
      const slope = Math.abs(terrainHeight(x + 1.5, z) - y) + Math.abs(terrainHeight(x, z + 1.5) - y);
      c.copy(grass).lerp(grassLight, noise(x * 0.08, z * 0.08) * 0.7);
      if (slope > 2.2) c.lerp(rock, Math.min((slope - 2.2) / 2, 1));
      if (y < SEA_LEVEL + 2.5) c.lerp(sand, Math.min((SEA_LEVEL + 2.5 - y) / 2.5, 1));
      c.toArray(colors, i * 3);
    }
    g.setAttribute("color", new BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    [],
  );
  return <mesh geometry={geometry} material={material} position={[0, -0.02, 0]} receiveShadow />;
}

const seaTime = { value: 0 };

function Sea() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        fog: false,
        uniforms: {
          uTime: seaTime,
          uSun: { value: SUN_VISUAL.clone() },
          uDeep: { value: new Color("#2d1f4f") },
          uMid: { value: new Color("#7a3f78") },
          uHorizon: { value: new Color(sky.horizon) },
          uHorizonSun: { value: new Color(sky.horizonSun) },
          uSunColor: { value: new Color(sky.sun) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uSun, uDeep, uMid, uHorizon, uHorizonSun, uSunColor;
          varying vec3 vWorld;
          ${noiseGLSL}
          void main() {
            vec3 V = normalize(vWorld - cameraPosition);
            float dist = length(vWorld.xz - cameraPosition.xz);
            vec2 p = vWorld.xz * 0.06;
            float t = uTime * 0.25;
            vec3 n = normalize(vec3(
              (vnoise(p * 3.0 + t) - 0.5) * 0.3 + sin(p.x * 5.0 + t * 3.0) * 0.03,
              1.0,
              (vnoise(p * 3.7 - t) - 0.5) * 0.3));
            vec3 R = reflect(V, n);
            float fres = pow(1.0 - max(dot(-V, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
            float az = dot(normalize(V.xz), normalize(uSun.xz)) * 0.5 + 0.5;
            vec3 horizon = mix(uHorizon, uHorizonSun, pow(az, 3.0));
            vec3 col = mix(uDeep, uMid, smoothstep(0.0, 0.8, fres));
            col = mix(col, horizon, fres * 0.85);
            float spec = pow(max(dot(R, uSun), 0.0), 60.0);
            col += uSunColor * spec * 2.5;
            float glitter = step(0.86, vnoise(vWorld.xz * 0.9 + vec2(t * 4.0, -t * 3.0)))
              * pow(max(dot(R, uSun), 0.0), 8.0);
            col += uSunColor * glitter * 3.0;
            col = mix(col, horizon, smoothstep(180.0, 760.0, dist));
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useFrame(({ clock }) => {
    if (!useGameStore.getState().reducedMotion) seaTime.value = clock.elapsedTime;
  });
  const geometry = useMemo(() => {
    const g = new CircleGeometry(900, 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return <mesh geometry={geometry} material={material} position={[0, SEA_LEVEL, 0]} />;
}

function scatter(
  count: number,
  seed: number,
  accept: (x: number, z: number, h: number) => boolean,
  radius: [number, number],
) {
  const points: [number, number, number][] = [];
  let i = 0;
  while (points.length < count && i < count * 40) {
    i++;
    const a = hash(seed + i, i * 0.37) * Math.PI * 2;
    const r = radius[0] + hash(i * 1.7, seed) * (radius[1] - radius[0]);
    const x = PLOT.x + Math.cos(a) * r;
    const z = PLOT.z + Math.sin(a) * r;
    const h = terrainHeight(x, z);
    if (accept(x, z, h)) points.push([x, h, z]);
  }
  return points;
}

const jungleKinds: KitName[] = ["palm_tall", "tree_round", "palm_bend", "tree_oak", "palm_tall", "tree_round"];

/** Hutan tropis jauh dari pohon kit; tanpa bayangan, satu draw call per jenis bagian. */
function Jungle() {
  const quality = useGameStore((s) => s.quality);
  const groups = useMemo(() => {
    const points = scatter(
      520,
      3,
      (x, z, h) => {
        const dx = Math.max(Math.abs(x - PLOT.x) - PLOT.halfX, 0);
        const dz = Math.max(Math.abs(z - PLOT.z) - PLOT.halfZ, 0);
        return Math.hypot(dx, dz) > 9 && h > SEA_LEVEL + 3;
      },
      [24, 240],
    );
    const result = new Map<KitName, KitItem[]>();
    points.forEach(([x, y, z], i) => {
      const kind = jungleKinds[Math.floor(hash(i, 21) * jungleKinds.length)];
      const list = result.get(kind) ?? [];
      list.push({ position: [x, y - 0.3, z], rotation: hash(i, 2) * 6.28, scale: 1.2 + hash(i, 9) * 0.9 });
      result.set(kind, list);
    });
    return [...result];
  }, []);
  return (
    <>
      {groups.map(([name, items]) => (
        <KitInstances
          key={name}
          name={name}
          items={quality === "low" ? items.filter((_, i) => i % 2 === 0) : items}
          castShadow={false}
          receiveShadow={false}
        />
      ))}
    </>
  );
}

/** Lampu desa di lembah: memberi rasa ada kehidupan di kejauhan. */
function TownLights() {
  const ref = useRef<InstancedMesh>(null);
  const points = useMemo(
    () =>
      scatter(
        220,
        11,
        (x, z, h) => {
          const ox = x - PLOT.x;
          const oz = z - PLOT.z;
          const front = oz > 10 || ox * SEA_DIR.x + oz * SEA_DIR.z > 20;
          return front && h > SEA_LEVEL + 0.8 && h < -8;
        },
        [30, 220],
      ),
    [],
  );
  const geometry = useMemo(() => new SphereGeometry(0.35, 6, 4), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    points.forEach(([x, y, z], i) => {
      const s = 0.6 + hash(i, 3) * 0.9;
      m.makeScale(s, s, s).setPosition(x, y + 0.6, z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, glow(palette.amber, 6), points.length]}
    />
  );
}

/** Tebing laut, pulau, dan pagoda sebagai siluet di depan matahari. */
function Islands() {
  const rock = useMemo(() => {
    const g = new DodecahedronGeometry(1, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const k = 1 + (noise(x * 2.3 + 5, z * 2.3 + y) - 0.5) * 0.55;
      p.setXYZ(i, x * k, y * k, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const stone = surface({ color: "#3e2a3e", roughness: 1, flat: true });
  const moss = surface({ color: "#2c4a33", roughness: 1, flat: true });
  const roof = surface({ color: "#2a1f2c", roughness: 0.9 });
  const wall = surface({ color: "#8c5a4a", roughness: 0.9 });
  const stacks: [number, number, number, number, number][] = [
    // x, z, radius, height, rotation
    [-150, -95, 14, 26, 0.3],
    [-170, -120, 7, 34, 1.1],
    [-128, -70, 5, 16, 2],
    [-215, -60, 22, 20, 0.7],
    [-240, -150, 10, 22, 2.4],
    [-110, -150, 9, 18, 1.6],
  ];
  return (
    <group>
      {stacks.map(([x, z, r, h, rot], i) => (
        <group key={i} position={[x, SEA_LEVEL - 2, z]} rotation={[0, rot, 0]}>
          <mesh geometry={rock} material={stone} scale={[r, h, r * 0.85]} position={[0, h * 0.45, 0]} />
          <mesh geometry={rock} material={moss} scale={[r * 0.8, h * 0.18, r * 0.7]} position={[0, h * 1.32, 0]} />
        </group>
      ))}
      <group position={[-215, SEA_LEVEL + 13, -60]}>
        {[0, 1, 2, 3].map((tier) => (
          <group key={tier} position={[0, 2 + tier * 3.2, 0]}>
            <mesh material={wall} position={[0, 0.9, 0]}>
              <boxGeometry args={[5.5 - tier, 2, 5.5 - tier]} />
            </mesh>
            <mesh material={roof} position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[(7.4 - tier * 1.2) * 0.75, 1.6, 4]} />
            </mesh>
            <mesh material={glow(palette.amber, 5)} position={[0, 0.9, (5.5 - tier) / 2 + 0.02]}>
              <planeGeometry args={[1.2, 1]} />
            </mesh>
          </group>
        ))}
        <mesh material={roof} position={[0, 16, 0]}>
          <coneGeometry args={[0.4, 4, 6]} />
        </mesh>
      </group>
    </group>
  );
}

/** Burung kecil yang terbang memutar jauh di langit. */
function Birds() {
  const group = useRef<Group>(null);
  const flock = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        radius: 60 + hash(i, 2) * 50,
        height: 22 + hash(i, 5) * 14,
        speed: 0.05 + hash(i, 7) * 0.04,
        phase: hash(i, 9) * Math.PI * 2,
      })),
    [],
  );
  const material = surface({ color: "#2a1c34", roughness: 1, side: 2 });
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g || useGameStore.getState().reducedMotion) return;
    const t = clock.elapsedTime;
    g.children.forEach((bird, i) => {
      const b = flock[i];
      const a = b.phase + t * b.speed;
      bird.position.set(-70 + Math.cos(a) * b.radius, b.height + Math.sin(t * 0.5 + i) * 2, -60 + Math.sin(a) * b.radius);
      bird.rotation.y = -a;
      const flap = Math.sin(t * 9 + i * 2) * 0.55;
      bird.children[0].rotation.z = flap;
      bird.children[1].rotation.z = -flap;
    });
  });
  return (
    <group ref={group}>
      {flock.map((_, i) => (
        <group key={i}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh material={material} position={[side * 0.8, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 0.4]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Scenery() {
  return (
    <group>
      <Terrain />
      <Sea />
      <Jungle />
      <TownLights />
      <Islands />
      <Birds />
    </group>
  );
}

export { FOG };
