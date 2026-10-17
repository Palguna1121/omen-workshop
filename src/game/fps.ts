import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/** Nilai FPS terakhir (diperbarui tiap 0,5 detik dari dalam Canvas). */
export const fps = { value: 0 };

export function FpsMeter() {
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.frames++;
    a.time += delta;
    if (a.time >= 0.5) {
      fps.value = a.frames / a.time;
      a.frames = 0;
      a.time = 0;
    }
  });
  return null;
}
