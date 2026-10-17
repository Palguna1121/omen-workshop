import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { useGameStore } from "@/store/gameStore";
import { GROUND_TOP } from "../world/layout";
import { runtime } from "../runtime";
import { useSettings } from "@/store/settingsStore";
import { markReleased } from "./pointerLock";

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
    const look = (dx: number, dy: number, scale: number) => {
      const { sensitivity, invertY } = useSettings.getState().controls;
      runtime.yaw -= dx * scale * sensitivity;
      runtime.pitch = MathUtils.clamp(
        runtime.pitch + dy * scale * 0.8 * sensitivity * (invertY ? -1 : 1),
        -0.08,
        0.75,
      );
    };
    const down = (event: PointerEvent) => {
      const state = useGameStore.getState();
      if (document.pointerLockElement) return;
      if (state.phase !== "playing" || state.menuOpen || state.mapOpen) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      look(event.clientX - lastX, event.clientY - lastY, 0.005);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    // Pointer lock (M/Alt): kamera mengikuti gerak mouse tanpa drag.
    const lockedMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      const state = useGameStore.getState();
      if (state.phase !== "playing" || state.menuOpen || state.mapOpen) return;
      look(event.movementX, event.movementY, 0.0028);
    };
    const lockChange = () => {
      const locked = document.pointerLockElement === canvas;
      if (!locked) markReleased();
      dragging = false;
      useGameStore.getState().setPointerLocked(locked);
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
    document.addEventListener("mousemove", lockedMove);
    document.addEventListener("pointerlockchange", lockChange);
    // Buka menu/peta atau keluar dari fase bermain: kursor dilepas.
    const unsubscribe = useGameStore.subscribe((state) => {
      if ((state.menuOpen || state.mapOpen || state.phase !== "playing") && document.pointerLockElement)
        document.exitPointerLock();
    });
    return () => {
      document.removeEventListener("mousemove", lockedMove);
      document.removeEventListener("pointerlockchange", lockChange);
      unsubscribe();
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
    if (runtime.pose) {
      // Saat duduk, kamera membidik model di kursi, bukan capsule.
      const [px, py, pz] = runtime.pose.position;
      target.set(px, py + 1.15, pz);
    } else target.set(runtime.player.x, runtime.player.y + 0.55, runtime.player.z);
    // Layar portrait (HP) butuh kamera sedikit lebih jauh agar karakter tidak memenuhi layar.
    const aspect = camera instanceof PerspectiveCamera ? camera.aspect : 1.6;
    const distance = runtime.distance * MathUtils.clamp(1.45 - aspect * 0.6, 1, 1.2);
    const horizontal = distance * Math.cos(runtime.pitch);
    desired.set(
      target.x + Math.sin(runtime.yaw) * horizontal,
      Math.max(target.y + 0.05 + Math.sin(runtime.pitch) * distance, GROUND_TOP + 0.35),
      target.z + Math.cos(runtime.yaw) * horizontal,
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
