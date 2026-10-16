import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { useGameStore } from "@/store/gameStore";
import { GROUND_TOP } from "../world/layout";
import { runtime } from "../runtime";

export function GameCamera() {
  const { gl, camera } = useThree();
  const { world, rapier } = useRapier();
  const vectors = useMemo(
    () => ({ target: new Vector3(), desired: new Vector3(), dir: new Vector3() }),
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
        0.75,
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
        6.5,
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
    // Portrait (HP) memakai FOV vertikal lebih lebar agar dunia tidak terasa ter-zoom.
    const fov = camera instanceof PerspectiveCamera ? MathUtils.clamp(56 + (1 - camera.aspect) * 26, 56, 70) : 56;
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - fov) > 0.1) {
      camera.setFocalLength(camera.getFilmHeight() / (2 * Math.tan(fov * Math.PI / 360)));
    }
    const { target, desired, dir } = vectors;
    target.set(runtime.player.x, runtime.player.y + 0.55, runtime.player.z);
    // Layar portrait (HP) butuh kamera sedikit lebih jauh agar karakter tidak memenuhi layar.
    const aspect = camera instanceof PerspectiveCamera ? camera.aspect : 1.6;
    const distance = runtime.distance * MathUtils.clamp(1.45 - aspect * 0.6, 1, 1.2);
    const horizontal = distance * Math.cos(runtime.pitch);
    desired.set(
      runtime.player.x + Math.sin(runtime.yaw) * horizontal,
      Math.max(runtime.player.y + 0.6 + Math.sin(runtime.pitch) * distance, GROUND_TOP + 0.35),
      runtime.player.z + Math.cos(runtime.yaw) * horizontal,
    );
    // Kamera ditarik maju bila ada dinding/plafon antara karakter dan kamera.
    dir.subVectors(desired, target);
    const length = dir.length();
    dir.divideScalar(length || 1);
    const hit = world.castRay(
      new rapier.Ray(target, dir),
      length,
      true,
      rapier.QueryFilterFlags.EXCLUDE_DYNAMIC | rapier.QueryFilterFlags.EXCLUDE_SENSORS,
    );
    const blocked = !!hit;
    if (hit) desired.copy(target).addScaledVector(dir, Math.max(hit.timeOfImpact - 0.3, 0.35));
    // Mendekat seketika saat terhalang agar tidak menembus dinding; menjauh dengan halus.
    if (blocked && camera.position.distanceTo(target) > desired.distanceTo(target))
      camera.position.copy(desired);
    else
      camera.position.lerp(desired, 1 - Math.exp(-6 * Math.min(delta, 0.1)));
    camera.lookAt(target);
  });
  return null;
}
