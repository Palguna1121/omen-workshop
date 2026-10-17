import { Vector3 } from "three";
import { PLAYER_SPAWN, type Vec3 } from "./config";

// Data per-frame di luar React: tidak memicu rerender 60 kali per detik.
export const runtime = {
  player: new Vector3(...PLAYER_SPAWN),
  yaw: 0,
  pitch: 0.3,
  distance: 3.6,
  speed: 0,
  /** Arah hadap model (radian, rotasi Y) untuk panah peta. */
  heading: Math.PI,
  grounded: true,
  jumpRequested: false,
  mobile: { x: 0, y: 0 },
  /** Pose duduk aktif: model dipindah ke kursi, capsule tetap di tempat. */
  pose: null as { position: Vec3; rotationY: number } | null,
  /** Permintaan pindah tempat; diproses Player sebelum langkah physics. */
  teleport: null as { position: Vec3; yaw: number } | null,
};

export function requestJump() {
  runtime.jumpRequested = true;
}

export function resetRuntime() {
  runtime.player.set(...PLAYER_SPAWN);
  runtime.yaw = 0;
  runtime.pitch = 0.3;
  runtime.speed = 0;
  runtime.grounded = true;
  runtime.jumpRequested = false;
  runtime.mobile.x = runtime.mobile.y = 0;
  runtime.pose = null;
  runtime.teleport = null;
}
