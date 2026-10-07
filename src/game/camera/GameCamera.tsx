import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { useGameStore } from "@/store/gameStore";
import { runtime } from "../runtime";

export function GameCamera() {
  const { gl, camera } = useThree();
  const vectors = useMemo(
    () => ({ target: new Vector3(), desired: new Vector3() }),
    [],
  );
  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    let lastX = 0,
      lastY = 0;
    const down = (event: PointerEvent) => {
      const state = useGameStore.getState();
      if (state.phase !== "playing" || state.section || state.menuOpen) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      runtime.yaw -= (event.clientX - lastX) * 0.005;
      runtime.pitch = MathUtils.clamp(
        runtime.pitch + (event.clientY - lastY) * 0.004,
        -0.08,
        0.68,
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const up = () => {
      dragging = false;
    };
    const wheel = (event: WheelEvent) => {
      if (useGameStore.getState().phase !== "playing") return;
      event.preventDefault();
      runtime.distance = MathUtils.clamp(
        runtime.distance + event.deltaY * 0.003,
        2,
        5,
      );
    };
    const context = (event: Event) => event.preventDefault();
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("contextmenu", context);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", up);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("contextmenu", context);
    };
  }, [gl]);
  useFrame((_, delta) => {
    if (useGameStore.getState().phase !== "playing") return;
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - 56) > 0.1) {
      camera.setFocalLength(camera.getFilmHeight() / (2 * Math.tan(56 * Math.PI / 360)));
    }
    vectors.target.set(
      runtime.player.x,
      runtime.player.y + 0.55,
      runtime.player.z,
    );
    const horizontal = runtime.distance * Math.cos(runtime.pitch);
    // Kamera tetap berada di dalam batas dinding hub.
    vectors.desired.set(
      MathUtils.clamp(
        runtime.player.x + Math.sin(runtime.yaw) * horizontal,
        -5.6,
        5.6,
      ),
      MathUtils.clamp(
        runtime.player.y + 0.6 + Math.sin(runtime.pitch) * runtime.distance,
        1.3,
        3.7,
      ),
      MathUtils.clamp(
        runtime.player.z + Math.cos(runtime.yaw) * horizontal,
        -4.5,
        4.7,
      ),
    );
    camera.position.lerp(
      vectors.desired,
      1 - Math.exp(-6 * Math.min(delta, 0.1)),
    );
    camera.lookAt(vectors.target);
  });
  return null;
}
