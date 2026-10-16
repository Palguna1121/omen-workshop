import { create } from "zustand";
import type { SectionId } from "@/game/config";

export type GamePhase = "loading" | "ready" | "intro" | "playing";
/** low: tanpa post/shadow; medium: bloom+SMAA; high: + ambient occlusion. */
export type Quality = "low" | "medium" | "high";
type GameState = {
  phase: GamePhase;
  introStep: number;
  section: SectionId | null;
  nearest: SectionId | null;
  menuOpen: boolean;
  audioEnabled: boolean;
  quality: Quality;
  reducedMotion: boolean;
  visited: SectionId[];
  ready: () => void;
  start: () => void;
  finishIntro: () => void;
  replayIntro: () => void;
  setIntroStep: (step: number) => void;
  setNearest: (id: SectionId | null) => void;
  openSection: (id: SectionId) => void;
  closeSection: () => void;
  toggleMenu: () => void;
  setAudio: (enabled: boolean) => void;
  configure: (quality: Quality, reducedMotion: boolean) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: "loading",
  introStep: 0,
  section: null,
  nearest: null,
  menuOpen: false,
  audioEnabled: false,
  quality: "medium",
  reducedMotion: false,
  visited: [],
  ready: () =>
    set((state) => (state.phase === "loading" ? { phase: "ready" } : {})),
  start: () =>
    set({ phase: get().reducedMotion ? "playing" : "intro", introStep: 0 }),
  finishIntro: () => set({ phase: "playing", introStep: 3 }),
  replayIntro: () =>
    set({
      phase: get().reducedMotion ? "playing" : "intro",
      introStep: 0,
      menuOpen: false,
      section: null,
    }),
  setIntroStep: (introStep) => set({ introStep }),
  setNearest: (nearest) => {
    if (get().nearest !== nearest) set({ nearest });
  },
  openSection: (section) =>
    set((state) => ({
      section,
      menuOpen: false,
      visited: state.visited.includes(section)
        ? state.visited
        : [...state.visited, section],
    })),
  closeSection: () => set({ section: null }),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  setAudio: (audioEnabled) => set({ audioEnabled }),
  configure: (quality, reducedMotion) => set({ quality, reducedMotion }),
}));
