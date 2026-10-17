import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { requestJump, runtime } from "../runtime";
import { interact, standUp } from "../interaction/actions";
import { justReleased, releasePointer, togglePointerLock } from "../camera/pointerLock";

const keyFallbacks: Record<string, string> = {
  w: "KeyW",
  a: "KeyA",
  s: "KeyS",
  d: "KeyD",
  e: "KeyE",
  Shift: "ShiftLeft",
  " ": "Space",
};
const inputCode = (event: KeyboardEvent) =>
  event.code ||
  keyFallbacks[event.key] ||
  keyFallbacks[event.key.toLowerCase()] ||
  event.key;

export function useController() {
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      const state = useGameStore.getState();
      const code = inputCode(event);
      if (code === "Escape") {
        if (event.repeat) return;
        event.preventDefault();
        // Esc yang melepas pointer lock tidak sekaligus membuka pengaturan.
        if (justReleased() || document.pointerLockElement) return;
        if (state.mapOpen) state.toggleMap(false);
        else if (state.seated) standUp();
        else if (state.phase === "intro") state.finishIntro();
        else if (state.phase === "playing") state.toggleMenu();
        return;
      }
      if (code === "AltLeft" || code === "AltRight" || code === "KeyM") {
        // Alt diblok agar Firefox/Windows tidak membuka menu bar.
        event.preventDefault();
        if (!event.repeat && state.phase === "playing" && !state.menuOpen) void togglePointerLock();
        return;
      }
      if (code === "Tab" && state.phase === "playing" && !state.menuOpen) {
        event.preventDefault();
        if (!event.repeat) {
          releasePointer();
          state.toggleMap();
        }
        return;
      }
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "input,textarea,select,[contenteditable=true],dialog",
        )
      )
        return;
      if (state.phase !== "playing" || state.menuOpen || state.mapOpen) return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          code,
        )
      )
        event.preventDefault();
      if (code === "Space") {
        // Satu permintaan per tekan; menahan Space tidak melompat otomatis.
        if (!event.repeat && !keys.current.has(code)) requestJump();
        keys.current.add(code);
      } else if (code === "KeyE" && !event.repeat && (state.nearest || state.seated)) {
        interact(state.nearest);
        keys.current.clear();
      } else keys.current.add(code);
    };
    const onUp = (event: KeyboardEvent) => {
      const code = inputCode(event);
      if (code === "AltLeft" || code === "AltRight") event.preventDefault();
      keys.current.delete(code);
    };
    const clear = () => {
      keys.current.clear();
      runtime.mobile.x = runtime.mobile.y = 0;
      runtime.jumpRequested = false;
    };
    const visibility = () => {
      if (document.hidden) clear();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    const unsubscribe = useGameStore.subscribe((state, previous) => {
      if (
        state.menuOpen !== previous.menuOpen ||
        state.mapOpen !== previous.mapOpen ||
        state.phase !== previous.phase
      )
        clear();
    });
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
      unsubscribe();
      clear();
    };
  }, []);
  return keys;
}
