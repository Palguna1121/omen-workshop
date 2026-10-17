import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  useAfterPhysicsStep,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { Group, MathUtils } from "three";
import { useGameStore } from "@/store/gameStore";
import { PLAYER_SPAWN, playerMotion } from "../config";
import { resetRuntime, runtime } from "../runtime";
import { Character } from "./Character";
import { useController } from "./Controller";
import { standUp } from "../interaction/actions";

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const keys = useController();
  const { world, rapier } = useRapier();
  useAfterPhysicsStep(() => {
    const position = body.current?.translation();
    if (position) runtime.player.set(position.x, position.y, position.z);
  });
  const phase = useGameStore((s) => s.phase);
  useEffect(() => {
    if (phase === "intro" || phase === "ready") {
      resetRuntime();
      body.current?.setTranslation(
        { x: PLAYER_SPAWN[0], y: PLAYER_SPAWN[1], z: PLAYER_SPAWN[2] },
        true,
      );
      body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [phase]);
  useFrame((_, delta) => {
    if (!body.current) return;
    const state = useGameStore.getState();
    const blocked = state.phase !== "playing" || state.menuOpen || state.mapOpen;
    // Teleport (portal) diproses sebelum gerak agar tidak ada satu frame melompat.
    if (runtime.teleport) {
      const [tx, ty, tz] = runtime.teleport.position;
      body.current.setTranslation({ x: tx, y: ty, z: tz }, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      runtime.player.set(tx, ty, tz);
      runtime.yaw = runtime.teleport.yaw;
      runtime.teleport = null;
      runtime.speed = 0;
      return;
    }
    const key = keys.current;
    let x = blocked
      ? 0
      : Number(key.has("KeyD") || key.has("ArrowRight")) -
        Number(key.has("KeyA") || key.has("ArrowLeft")) +
        runtime.mobile.x;
    let z = blocked
      ? 0
      : Number(key.has("KeyS") || key.has("ArrowDown")) -
        Number(key.has("KeyW") || key.has("ArrowUp")) +
        runtime.mobile.y;
    // Saat duduk, input gerak/lompat membuat Omen berdiri; capsule tetap diam.
    if (runtime.pose) {
      if (!blocked && (Math.abs(x) > 0.2 || Math.abs(z) > 0.2 || runtime.jumpRequested)) standUp();
      runtime.jumpRequested = false;
      x = z = 0;
    }
    const length = Math.hypot(x, z);
    if (length > 1) {
      x /= length;
      z /= length;
    }
    const speed = key.has("ShiftLeft") || key.has("ShiftRight") ? playerMotion.runSpeed : playerMotion.walkSpeed;
    const vx = (x * Math.cos(runtime.yaw) + z * Math.sin(runtime.yaw)) * speed;
    const vz = (-x * Math.sin(runtime.yaw) + z * Math.cos(runtime.yaw)) * speed;
    const velocity = body.current.linvel();
    const position = body.current.translation();
    // Ray hanya menerima permukaan di bawah kaki, mengecualikan capsule sendiri.
    const ground = world.castRayAndGetNormal(
      new rapier.Ray(position, { x: 0, y: -1, z: 0 }),
      0.91,
      true,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      undefined,
      body.current,
    );
    runtime.grounded = !!ground && ground.normal.y > 0.55 && velocity.y <= 0.5;
    const jumping = !blocked && runtime.jumpRequested && runtime.grounded;
    runtime.jumpRequested = false;
    if (jumping) runtime.grounded = false;
    body.current.setLinvel({ x: vx, y: jumping ? playerMotion.jumpSpeed : velocity.y, z: vz }, true);
    runtime.player.set(position.x, position.y, position.z);
    runtime.speed = Math.hypot(vx, vz);
    if (position.y < -5) {
      body.current.setTranslation(
        { x: PLAYER_SPAWN[0], y: PLAYER_SPAWN[1], z: PLAYER_SPAWN[2] },
        true,
      );
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      resetRuntime();
    }
    if (visual.current && runtime.pose) {
      // Model dipindah ke kursi; body physics tetap berdiri di depannya.
      const [px, py, pz] = runtime.pose.position;
      visual.current.position.set(px - position.x, py - position.y, pz - position.z);
      visual.current.rotation.y = runtime.pose.rotationY;
    } else if (visual.current && visual.current.position.y !== -0.82) {
      visual.current.position.set(0, -0.82, 0);
    }
    if (visual.current) runtime.heading = visual.current.rotation.y;
    if (visual.current && runtime.pose) {
      // Arah hadap sudah ditetapkan oleh pose.
    } else if (visual.current && runtime.speed > 0.1) {
      const target = Math.atan2(vx, vz);
      const angle = Math.atan2(
        Math.sin(target - visual.current.rotation.y),
        Math.cos(target - visual.current.rotation.y),
      );
      visual.current.rotation.y +=
        angle * (1 - Math.exp(-12 * Math.min(delta, 0.05)));
    } else if (visual.current)
      visual.current.rotation.y = MathUtils.euclideanModulo(
        visual.current.rotation.y,
        Math.PI * 2,
      );
  }, -2);
  return (
    <RigidBody
      ref={body}
      position={PLAYER_SPAWN}
      colliders={false}
      enabledRotations={[false, false, false]}
      friction={0}
      restitution={0}
      ccd
      canSleep={false}
    >
      <CapsuleCollider args={[0.52, 0.3]} />
      <group ref={visual} position={[0, -0.82, 0]} rotation={[0, Math.PI, 0]}>
        <Character />
      </group>
    </RigidBody>
  );
}
