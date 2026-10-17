import { useGameStore } from "@/store/gameStore";

// Waktu terakhir kursor dilepas: Esc yang sama tidak ikut membuka pengaturan.
let releasedAt = 0;

export function gameCanvas() {
  return document.querySelector<HTMLCanvasElement>(".game-canvas canvas");
}

export function justReleased() {
  return performance.now() - releasedAt < 250;
}

export function markReleased() {
  releasedAt = performance.now();
}

export function releasePointer() {
  if (document.pointerLockElement) document.exitPointerLock();
}

/**
 * Kunci/lepas kursor. Browser mewajibkan gestur pengguna; Chrome tidak
 * menganggap Alt tunggal sebagai gestur, jadi kegagalan diberi petunjuk.
 */
export async function togglePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock();
    return;
  }
  const state = useGameStore.getState();
  if (state.phase !== "playing" || state.menuOpen || state.mapOpen) return;
  const canvas = gameCanvas();
  if (!canvas) return;
  try {
    const request = canvas.requestPointerLock() as Promise<void> | undefined;
    if (request) await request;
  } catch {
    useGameStore.getState().say("Klik dunia sekali, lalu tekan M untuk mengunci kursor.");
  }
}
