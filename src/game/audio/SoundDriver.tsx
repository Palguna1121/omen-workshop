import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { GARAGE } from "../world/layout";
import { runtime } from "../runtime";
import { loops } from "./AudioHelper";
import { sfx } from "./sound";

const PORTAL = [GARAGE.maxX - 0.6, 1.5, -0.9] as const;
const RADIO = [0, 1, -4.5] as const;

function distance(p: readonly number[]) {
  return Math.hypot(runtime.player.x - p[0], runtime.player.y - p[1], runtime.player.z - p[2]);
}

/** Suara yang mengikuti posisi pemain: langkah kaki, dengung portal, volume radio. */
export function SoundDriver() {
  const stride = useRef(0);
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!state.audioEnabled) return;
    const dt = Math.min(delta, 0.1);
    if (state.phase === "playing" && !state.menuOpen && runtime.grounded && !runtime.pose && runtime.speed > 0.3) {
      const before = stride.current;
      stride.current += dt * (runtime.speed > 4 ? 3.1 : 2.4);
      if (Math.floor(stride.current) !== Math.floor(before)) {
        const { x, y, z } = runtime.player;
        const indoors = Math.abs(x) < GARAGE.maxX && z > GARAGE.minZ && z < GARAGE.maxZ && y < 2;
        const porch = y > 1.6;
        sfx(indoors || porch ? "step-wood" : "step-stone");
      }
    } else stride.current = 0.6;
    loops.portal?.setLevel(Math.max(0, 1 - distance(PORTAL) / 9) ** 2);
    loops.radio?.setLevel(Math.max(0.1, Math.max(0, 1 - distance(RADIO) / 14) ** 1.5));
  });
  return null;
}
