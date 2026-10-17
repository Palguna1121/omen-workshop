import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { runtime } from "../runtime";
import { findNearestSpot } from "./proximity";

export function InteractionSystem() {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 0.12) return;
    elapsed.current = 0;
    const state = useGameStore.getState();
    state.setNearest(
      state.phase === "playing"
        ? findNearestSpot(runtime.player.x, runtime.player.z, runtime.player.y - 0.9)
        : null,
    );
  });
  return null;
}
