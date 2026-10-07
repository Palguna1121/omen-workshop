import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { requestJump, runtime } from "../runtime";

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
        if (state.section) state.closeSection();
        else if (state.phase === "intro") state.finishIntro();
        else if (state.phase === "playing") state.toggleMenu();
        return;
      }
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "input,textarea,select,[contenteditable=true],dialog",
        )
      )
        return;
      if (state.phase !== "playing" || state.section || state.menuOpen) return;
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
      } else if (code === "KeyE" && !event.repeat && state.nearest) {
        state.openSection(state.nearest);
        keys.current.clear();
      } else keys.current.add(code);
    };
    const onUp = (event: KeyboardEvent) =>
      keys.current.delete(inputCode(event));
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
        state.section !== previous.section ||
        state.menuOpen !== previous.menuOpen ||
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
