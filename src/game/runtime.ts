import { Vector3 } from "three";
import { PLAYER_SPAWN } from "./config";

// Data per-frame di luar React: tidak memicu rerender 60 kali per detik.
export const runtime = {
  player: new Vector3(...PLAYER_SPAWN),
  yaw: 0,
  pitch: 0.3,
  distance: 3.6,
  speed: 0,
  grounded: true,
  jumpRequested: false,
  mobile: { x: 0, y: 0 },
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
}
