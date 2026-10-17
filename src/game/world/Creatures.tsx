import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, InstancedMesh, Matrix4, Mesh, Vector3 } from "three";
import { useGameStore } from "@/store/gameStore";
import type { Vec3 } from "../config";
import { sfx } from "../audio/sound";
import { runtime } from "../runtime";
import { glow, palette, surface } from "./palette";

const fur = () => surface({ color: "#17121d", roughness: 0.85 });

function near(position: Vec3, radius: number) {
  return Math.hypot(runtime.player.x - position[0], runtime.player.z - position[2]) < radius &&
    Math.abs(runtime.player.y - 0.9 - position[1]) < 1.5;
}

/** Kucing hitam tidur di bean bag; bangun, menoleh, dan mengeong saat didekati. */
function Cat({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const body = useRef<Mesh>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const awake = useRef(0);
  const lastMeow = useRef(-99);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const reduced = useGameStore.getState().reducedMotion;
    const close = useGameStore.getState().phase === "playing" && near(position, 2.4);
    awake.current += ((close ? 1 : 0) - awake.current) * (1 - Math.exp(-3 * Math.min(delta, 0.1)));
    if (close && awake.current > 0.6 && t - lastMeow.current > 12) {
      lastMeow.current = t;
      sfx("meow");
    }
    const a = awake.current;
    // Napas: skala dasar tubuh 0,15 di sumbu Y.
    if (body.current && !reduced) body.current.scale.y = 0.15 * (1 + Math.sin(t * 1.8) * 0.06 * (1 - a * 0.5));
    if (head.current) {
      head.current.rotation.z = -0.45 * (1 - a);
      head.current.position.y = 0.14 + a * 0.08;
      // Menoleh ke arah Omen saat bangun.
      const dx = runtime.player.x - position[0];
      const dz = runtime.player.z - position[2];
      const look = Math.atan2(dx, dz) - rotationY - Math.PI / 2;
      head.current.rotation.y = Math.atan2(Math.sin(look), Math.cos(look)) * a * 0.8;
    }
    if (eyes.current) eyes.current.scale.y = 0.1 + a * 0.9;
    if (tail.current && !reduced) tail.current.rotation.y = Math.sin(t * (1 + a * 3)) * 0.25 * (0.4 + a);
  });
  const material = fur();
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh ref={body} material={material} position={[0, 0.12, 0]} scale={[0.3, 0.15, 0.2]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      <group ref={head} position={[0.26, 0.14, 0]}>
        <mesh material={material} castShadow>
          <sphereGeometry args={[0.11, 14, 10]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={material} position={[0.0, 0.1, s * 0.06]} rotation={[s * 0.3, 0, -0.1]}>
            <coneGeometry args={[0.045, 0.09, 4]} />
          </mesh>
        ))}
        <group ref={eyes} position={[0.095, 0.02, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0, s * 0.04]} material={glow(palette.cyan, 4)}>
              <boxGeometry args={[0.012, 0.035, 0.022]} />
            </mesh>
          ))}
        </group>
      </group>
      <group ref={tail} position={[-0.26, 0.06, 0]}>
        <mesh material={material} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.028, 6, 16, Math.PI * 1.1]} />
        </mesh>
      </group>
    </group>
  );
}

/** Kunang-kunang di sekitar pohon besar; berkerumun mengitari Omen saat ia mendekat. */
function Fireflies({ center, count = 36 }: { center: Vec3; count?: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const flies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        pos: new Vector3(center[0], center[1] + 1.5, center[2]),
        phase: i * 1.7,
        radius: 1.5 + (i % 5) * 0.7,
        height: 0.8 + (i % 7) * 0.4,
        speed: 0.2 + (i % 3) * 0.08,
      })),
    [center, count],
  );
  const m = useMemo(() => new Matrix4(), []);
  const target = useMemo(() => new Vector3(), []);
  useFrame(({ clock }, delta) => {
    const g = mesh.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const reduced = useGameStore.getState().reducedMotion;
    const close = near(center, 7);
    const k = 1 - Math.exp(-1.5 * Math.min(delta, 0.1));
    flies.forEach((f, i) => {
      const a = f.phase + t * f.speed * (reduced ? 0 : 1);
      if (close) {
        const r = 0.6 + (i % 4) * 0.2;
        target.set(
          runtime.player.x + Math.cos(a * 2.2) * r,
          runtime.player.y + 0.6 + Math.sin(a * 1.7) * 0.35,
          runtime.player.z + Math.sin(a * 2.2) * r,
        );
      } else {
        target.set(center[0] + Math.cos(a) * f.radius, center[1] + f.height + Math.sin(a * 1.3) * 0.4, center[2] + Math.sin(a * 0.8) * f.radius);
      }
      f.pos.lerp(target, k);
      const blink = 0.6 + 0.4 * Math.sin(t * 3 + f.phase * 5);
      const s = 0.03 * blink;
      m.makeScale(s, s, s).setPosition(f.pos);
      g.setMatrixAt(i, m);
    });
    g.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} material={glow("#d9ff8a", 7)} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 4]} />
    </instancedMesh>
  );
}

/** Burung kecil bertengger di pagar; terbang menjauh saat didekati, lalu kembali. */
function PerchedBird({ perch }: { perch: Vec3 }) {
  const bird = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const wings = useRef<(Group | null)[]>([]);
  const flight = useRef({ t: -1, away: 0 });
  useFrame(({ clock }, delta) => {
    const g = bird.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const f = flight.current;
    const playing = useGameStore.getState().phase === "playing";
    if (f.t < 0) {
      // Bertengger: mematuk sesekali.
      g.position.set(...perch);
      g.visible = true;
      if (head.current) head.current.rotation.z = Math.sin(t * 6) > 0.85 ? -0.6 : 0;
      wings.current.forEach((w) => w && (w.rotation.z = 0));
      if (playing && near(perch, 3.2)) {
        f.t = 0;
        sfx("flap");
      }
      return;
    }
    if (f.t >= 0 && f.away === 0) {
      f.t += Math.min(delta, 0.1);
      g.position.set(perch[0] - f.t * 3, perch[1] + f.t * f.t * 1.6 + f.t, perch[2] + f.t * 4);
      wings.current.forEach((w, i) => w && (w.rotation.z = Math.sin(t * 28) * 0.9 * (i ? -1 : 1)));
      if (f.t > 4) {
        g.visible = false;
        f.away = t;
      }
      return;
    }
    // Kembali setelah 25 detik bila Omen sudah menjauh.
    if (t - f.away > 25 && !near(perch, 6)) {
      f.t = -1;
      f.away = 0;
    }
  });
  const feathers = surface({ color: "#3a2a44", roughness: 0.8 });
  return (
    <group ref={bird} position={perch} rotation={[0, -0.6, 0]}>
      <mesh material={feathers} scale={[0.09, 0.07, 0.06]} position={[0, 0.06, 0]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      <mesh ref={head} material={feathers} position={[0.07, 0.12, 0]}>
        <sphereGeometry args={[0.045, 10, 8]} />
      </mesh>
      <mesh material={surface(palette.amber)} position={[0.12, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.014, 0.04, 5]} />
      </mesh>
      {[-1, 1].map((s, i) => (
        <group key={s} ref={(w) => { wings.current[i] = w; }} position={[0, 0.08, s * 0.05]}>
          <mesh material={feathers} position={[-0.01, 0, s * 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 0.12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Robot penyedot debu kecil berkeliling lantai garasi. */
function RobotVacuum() {
  const robot = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const g = robot.current;
    if (!g || useGameStore.getState().reducedMotion) return;
    const t = clock.elapsedTime * 0.22;
    const x = Math.sin(t) * 1.8;
    const z = 0.9 + Math.sin(t * 2) * 1.2;
    const dx = Math.cos(t) * 1.8;
    const dz = Math.cos(t * 2) * 2.4;
    g.position.set(x, 0.1, z);
    g.rotation.y = Math.atan2(dx, dz);
    if (led.current) led.current.visible = Math.sin(clock.elapsedTime * 4) > 0;
  });
  return (
    <group ref={robot} position={[0, 0.1, 0.9]}>
      <mesh material={surface({ color: "#221d2b", metalness: 0.4, roughness: 0.4 })} castShadow>
        <cylinderGeometry args={[0.22, 0.23, 0.08, 24]} />
      </mesh>
      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow(palette.cyan, 2.4)}>
        <ringGeometry args={[0.15, 0.17, 32]} />
      </mesh>
      <mesh ref={led} position={[0, 0.05, 0.16]} material={glow("#9ff3c7", 5)}>
        <sphereGeometry args={[0.015, 6, 4]} />
      </mesh>
    </group>
  );
}

export function Creatures() {
  return (
    <>
      <Cat position={[-2.55, 0.7, 3.3]} rotationY={0.4} />
      <Fireflies center={[-18.4, 0.1, 11.4]} />
      <PerchedBird perch={[-6.1, 1.66, 15.5]} />
      <RobotVacuum />
    </>
  );
}

