import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  Vector3,
} from "three";
import { useGameStore } from "@/store/gameStore";
import { KitInstances } from "./Kit";
import { HOUSE } from "./layout";
import { DESK_ORIGIN, Motorcycle, monitors } from "./Interior";
import { Block } from "./Primitives";
import { glow, palette, surface } from "./palette";
import { codeTexture, noteTexture, puffTexture, screenTexture } from "./textures";

const now = () => performance.now();

let screenSet: {
  code: ReturnType<typeof codeTexture>;
  off: MeshBasicMaterial;
  main: MeshBasicMaterial;
  side: MeshBasicMaterial;
} | null = null;
// Material layar dibuat sekali (level modul) karena dianimasikan tiap frame.
function screenMaterials() {
  if (!screenSet) {
    const code = codeTexture();
    code.repeat.set(1, 0.42);
    screenSet = {
      code,
      off: new MeshBasicMaterial({ map: screenTexture(0), color: new Color(0.16, 0.16, 0.22), toneMapped: false }),
      main: new MeshBasicMaterial({ map: screenTexture(0), color: new Color(1.9, 1.9, 1.9), toneMapped: false }),
      side: new MeshBasicMaterial({ map: code, color: new Color(1.7, 1.7, 1.7), toneMapped: false }),
    };
  }
  return screenSet;
}

/** Tiga monitor: standby redup, menyala terang dengan kode bergulir saat PC hidup. */
function DeskScreens() {
  const pc = useGameStore((s) => s.toggles.pc);
  const materials = screenMaterials();
  useFrame(({ clock }, delta) => {
    if (!pc || useGameStore.getState().reducedMotion) return;
    const set = screenMaterials();
    set.code.offset.y = (set.code.offset.y + delta * 0.06) % 1;
    set.main.color.setScalar(1.75 + Math.sin(clock.elapsedTime * 2) * 0.2);
  });
  return (
    <group position={DESK_ORIGIN}>
      {monitors.map(([x, y, z, rot, w, h], i) => (
        <mesh key={i} position={[x, y, z + 0.027]} rotation={[0, rot, 0]} material={pc ? (i ? materials.side : materials.main) : materials.off}>
          <planeGeometry args={[w, h]} />
        </mesh>
      ))}
      {pc && <pointLight position={[0, 1.5, 0.5]} color="#7fd8ff" intensity={4} distance={4} decay={2} />}
    </group>
  );
}

const shapes = ["ico", "knot", "octa", "dodeca"] as const;
const scratch = new Matrix4();
const sparkParticles = Array.from({ length: 28 }, (_, i) => ({ p: new Vector3(), v: new Vector3(), life: (i * 0.37) % 1 }));

/** Workbench: kepala printer bergerak, cetakan tumbuh, hologram berganti bentuk, percikan. */
function WorkbenchFX() {
  const on = useGameStore((s) => s.toggles.workbench);
  const head = useRef<Mesh>(null);
  const print = useRef<Mesh>(null);
  const holo = useRef<Group>(null);
  const sparks = useRef<InstancedMesh>(null);
  const shapeRefs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }, delta) => {
    const particles = sparkParticles;
    const m = scratch;
    const t = clock.elapsedTime;
    const reduced = useGameStore.getState().reducedMotion;
    const dt = Math.min(delta, 0.05);
    if (head.current) head.current.position.x = on && !reduced ? Math.sin(t * 3.1) * 0.18 : 0;
    if (print.current) print.current.scale.y = on ? 0.05 + ((t * 0.12) % 1) * 0.95 : 0.05;
    if (holo.current) {
      holo.current.rotation.y += dt * (on ? 2.2 : 0.4) * (reduced ? 0 : 1);
      holo.current.position.y = 0.5 + (reduced ? 0 : Math.sin(t * 1.6) * 0.05);
      const active = on ? Math.floor(t / 2.5) % shapes.length : 0;
      shapeRefs.current.forEach((mesh, i) => {
        if (mesh) mesh.visible = i === active;
      });
    }
    const mesh = sparks.current;
    if (!mesh) return;
    particles.forEach((s, i) => {
      if (on && !reduced) {
        s.life -= dt * 1.6;
        if (s.life <= 0) {
          s.life = 0.5 + Math.random() * 0.5;
          s.p.set(0, 0, 0);
          s.v.set((Math.random() - 0.5) * 1.6, 1 + Math.random() * 1.4, (Math.random() - 0.2) * 1.2);
        }
        s.v.y -= 6 * dt;
        s.p.addScaledVector(s.v, dt);
      }
      const scale = on && !reduced ? Math.max(s.life, 0) * 0.9 : 0;
      m.makeScale(scale, scale, scale).setPosition(s.p);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={[3.3, 0, -4.3]}>
      {/* Printer 3D (rangka statis ada di Interior). */}
      <group position={[1.0, 1.0, -0.1]}>
        <mesh ref={head} position={[0, 0.48, -0.15]} material={surface("#c7c3d0")}>
          <boxGeometry args={[0.1, 0.12, 0.1]} />
        </mesh>
        <Block position={[0, 0.08, 0.05]} size={[0.4, 0.02, 0.36]} glowColor={palette.cyan} glowIntensity={on ? 2.6 : 0.8} />
        <mesh ref={print} position={[0, 0.1, 0.0]} material={glow("#b88bff", on ? 2.2 : 0.9)}>
          <cylinderGeometry args={[0.07, 0.09, 0.22, 6]} />
        </mesh>
      </group>
      {/* Hologram. */}
      <group position={[0, 1.0, 0.15]}>
        <Block position={[0, 0.04, 0]} size={[0.5, 0.08, 0.5]} color="#2b2633" />
        <Block position={[0, 0.09, 0]} size={[0.42, 0.01, 0.42]} glowColor={palette.cyan} glowIntensity={on ? 3 : 1.4} />
        <group ref={holo} position={[0, 0.5, 0]}>
          {shapes.map((shape, i) => (
            <mesh key={shape} ref={(mesh) => { shapeRefs.current[i] = mesh; }} visible={i === 0} material={glow("#9b5cff", on ? 3 : 1.6)}>
              {shape === "ico" && <icosahedronGeometry args={[0.2, 0]} />}
              {shape === "knot" && <torusKnotGeometry args={[0.13, 0.04, 48, 6]} />}
              {shape === "octa" && <octahedronGeometry args={[0.22, 0]} />}
              {shape === "dodeca" && <dodecahedronGeometry args={[0.2, 0]} />}
            </mesh>
          ))}
          {on && (
            <mesh rotation={[Math.PI / 2, 0, 0]} material={glow(palette.cyan, 2.4)}>
              <torusGeometry args={[0.3, 0.006, 4, 40]} />
            </mesh>
          )}
        </group>
      </group>
      {/* Percikan dari ragum/toolbox. */}
      <instancedMesh ref={sparks} args={[undefined, undefined, sparkParticles.length]} position={[-1.05, 1.28, 0.1]} material={glow("#ffb35c", 6)} frustumCulled={false}>
        <sphereGeometry args={[0.018, 4, 3]} />
      </instancedMesh>
      {on && <pointLight position={[0, 1.8, 0.6]} color="#ffb35c" intensity={5} distance={5} decay={2} />}
    </group>
  );
}

/** Radio tua di kabinet: lampu dial dan not musik melayang saat menyala. */
function RadioFX() {
  const on = useGameStore((s) => s.toggles.radio);
  const notes = useRef<Group>(null);
  const material = useMemo(
    () => new MeshBasicMaterial({ map: noteTexture(), transparent: true, depthWrite: false, toneMapped: false, color: new Color(2, 2.2, 2.6), side: DoubleSide }),
    [],
  );
  useFrame(({ clock, camera }) => {
    const g = notes.current;
    if (!g) return;
    const reduced = useGameStore.getState().reducedMotion;
    g.visible = on;
    g.children.forEach((child, i) => {
      const k = reduced ? 0.5 : (clock.elapsedTime * 0.4 + i / 3) % 1;
      child.position.set(Math.sin(k * 5 + i * 2) * 0.18, k * 0.9, Math.cos(k * 3 + i) * 0.05);
      child.scale.setScalar(0.12 * Math.sin(k * Math.PI));
      child.quaternion.copy(camera.quaternion);
    });
  });
  return (
    <group position={[0.3, 0.82, -4.42]}>
      <KitInstances name="radio" items={[{ position: [0, 0, 0], scale: 1.6 }]} />
      <Block position={[0.12, 0.24, 0.1]} size={[0.14, 0.05, 0.01]} glowColor="#ffcf8a" glowIntensity={on ? 4 : 0.6} />
      <group ref={notes} position={[0, 0.5, 0.1]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={material}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Motor: getar mesin, lampu depan, cahaya bawah, asap knalpot saat dipanaskan. */
function BikeFX() {
  const bike = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const under = useRef<Mesh>(null);
  const smoke = useRef<Group>(null);
  const puffs = useMemo(
    () => [0, 1, 2, 3, 4].map(() => new MeshBasicMaterial({ map: puffTexture(), transparent: true, depthWrite: false, color: "#b9b2c8", opacity: 0 })),
    [],
  );
  const base = useMemo(() => new Vector3(2.75, 0.08, 3.3), []);
  useFrame(({ clock, camera }) => {
    const since = (now() - useGameStore.getState().bikeRevAt) / 1000;
    const active = since >= 0 && since < 2.3;
    const reduced = useGameStore.getState().reducedMotion;
    const power = active ? Math.min(1, since * 4) * (since > 1.8 ? (2.3 - since) / 0.5 : 1) : 0;
    if (bike.current) {
      const shake = reduced ? 0 : power * 0.012;
      bike.current.position.set(base.x + (Math.random() - 0.5) * shake, base.y + (Math.random() - 0.5) * shake, base.z);
    }
    if (light.current) light.current.intensity = power * 6;
    if (under.current) {
      // Cahaya bawah hanya menyala saat mesin dipanaskan.
      under.current.visible = power > 0.01;
      (under.current.material as MeshBasicMaterial).opacity = power * 0.7;
    }
    const g = smoke.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const k = (clock.elapsedTime * 1.2 + i / 5) % 1;
      child.position.set(Math.sin(i * 2) * 0.05 * k, 0.05 + k * 0.5, k * 0.6);
      child.scale.setScalar(0.08 + k * 0.3);
      child.quaternion.copy(camera.quaternion);
      puffs[i].opacity = active && !reduced ? Math.sin(k * Math.PI) * 0.35 * power : 0;
    });
  });
  return (
    <group>
      <group ref={bike} position={base.toArray()} rotation={[0, -0.55, 0]}>
        <Motorcycle position={[0, 0, 0]} />
        <pointLight ref={light} position={[0, 0.98, -1.1]} color="#cdf7ff" intensity={0} distance={6} decay={2} />
        <mesh ref={under} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[1.4, 2.6]} />
          <meshBasicMaterial map={puffTexture()} color={new Color(0.2, 2.2, 2.6)} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={smoke} position={[0.14, 0.4, 0.78]}>
          {puffs.map((material, i) => (
            <mesh key={i} material={material}>
              <planeGeometry args={[1, 1]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/** Sosok hooded mengintip dari jendela atas setelah pintu diketuk dua kali. */
function DoorPeek() {
  const figure = useRef<Group>(null);
  useFrame(() => {
    const g = figure.current;
    if (!g) return;
    const since = (now() - useGameStore.getState().peekAt) / 1000;
    const peekAt = useGameStore.getState().peekAt;
    const k = peekAt && since < 3.2 ? Math.min(1, since * 3) * Math.min(1, (3.2 - since) * 3) : 0;
    g.visible = k > 0.01;
    g.position.y = 5.55 + k * 0.35;
  });
  const cloak = surface({ color: "#2a1d3a", roughness: 0.8 });
  return (
    <group ref={figure} position={[-11.9, 5.55, HOUSE.maxZ + 0.06]} visible={false}>
      <mesh material={cloak} position={[0, -0.05, 0]}>
        <coneGeometry args={[0.32, 0.6, 7]} />
      </mesh>
      <mesh material={surface("#0c0a14")} position={[0, -0.02, 0.12]}>
        <sphereGeometry args={[0.15, 10, 8]} />
      </mesh>
      {[-0.05, 0, 0.05].map((x) => (
        <mesh key={x} position={[x, -0.01, 0.27]} material={glow(palette.cyan, 5)}>
          <boxGeometry args={[0.022, 0.07, 0.01]} />
        </mesh>
      ))}
    </group>
  );
}

const FIREWORK_COUNT = 420;
const fireworkSparks = Array.from({ length: FIREWORK_COUNT }, () => ({ p: new Vector3(), v: new Vector3(), life: 0, color: new Color() }));
const fireworkColors = ["#ffb35c", "#b06bff", "#5fe9ff", "#ff6fae", "#fff1c4"].map((c) => new Color(c).multiplyScalar(5));
const fireworkClock = { next: 0 };
const hidden = new Matrix4().makeScale(0, 0, 0);

/** Kembang api di atas laut setelah semua kristal ditemukan. */
function Fireworks() {
  const celebrateAt = useGameStore((s) => s.celebrateAt);
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    // Semua partikel mulai tak terlihat (skala 0), bukan bola di titik origin.
    const g = mesh.current;
    if (!g) return;
    for (let i = 0; i < FIREWORK_COUNT; i++) {
      g.setMatrixAt(i, hidden);
      g.setColorAt(i, fireworkColors[0]);
    }
    g.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(({ clock }, delta) => {
    const g = mesh.current;
    if (!g || !celebrateAt) return;
    const since = (now() - celebrateAt) / 1000;
    const dt = Math.min(delta, 0.05);
    if (since < 16 && clock.elapsedTime > fireworkClock.next) {
      fireworkClock.next = clock.elapsedTime + 0.5 + Math.random() * 0.6;
      const center = new Vector3(-55 + Math.random() * 40, 18 + Math.random() * 16, -40 - Math.random() * 30);
      const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
      let spawned = 0;
      for (const s of fireworkSparks) {
        if (s.life > 0) continue;
        s.p.copy(center);
        s.v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(6 + Math.random() * 3);
        s.life = 1.6;
        s.color.copy(color);
        if (++spawned >= 70) break;
      }
    }
    fireworkSparks.forEach((s, i) => {
      if (s.life > 0) {
        s.life -= dt;
        s.v.multiplyScalar(0.985);
        s.v.y -= 3 * dt;
        s.p.addScaledVector(s.v, dt);
      }
      const scale = Math.max(s.life, 0) * 0.25;
      scratch.makeScale(scale, scale, scale).setPosition(s.p);
      g.setMatrixAt(i, scratch);
      g.setColorAt(i, s.color);
    });
    g.instanceMatrix.needsUpdate = true;
    if (g.instanceColor) g.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, FIREWORK_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.5, 6, 4]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

export function Interactive() {
  return (
    <>
      <DeskScreens />
      <WorkbenchFX />
      <RadioFX />
      <BikeFX />
      <DoorPeek />
      <Fireworks />
    </>
  );
}

