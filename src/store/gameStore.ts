import { create } from "zustand";
import { crystals, type SpotId } from "@/game/config";

export type GamePhase = "loading" | "ready" | "intro" | "playing";
export type Toggle = "pc" | "workbench" | "radio";

const FOUND_KEY = "workshop-omen:kristal";

function readFound(): string[] {
  try {
    const raw = globalThis.localStorage?.getItem(FOUND_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    const valid = new Set(crystals.map((c) => c.id));
    return Array.isArray(list) ? list.filter((id): id is string => typeof id === "string" && valid.has(id)) : [];
  } catch {
    return [];
  }
}

function writeFound(found: string[]) {
  try {
    globalThis.localStorage?.setItem(FOUND_KEY, JSON.stringify(found));
  } catch {
    // Mode privat/penyimpanan diblokir: progres tetap jalan selama sesi.
  }
}

type GameState = {
  phase: GamePhase;
  introStep: number;
  nearest: SpotId | null;
  /** Spot tempat Omen sedang duduk. */
  seated: SpotId | null;
  menuOpen: boolean;
  audioEnabled: boolean;
  reducedMotion: boolean;
  toggles: Record<Toggle, boolean>;
  /** Cap waktu (ms) peristiwa sesaat untuk animasi/suara. */
  bikeRevAt: number;
  flashAt: number;
  peekAt: number;
  celebrateAt: number;
  knocks: number;
  found: string[];
  /** Naik setiap kristal disembunyikan lagi; me-remount komponen kristal. */
  crystalRound: number;
  toast: { id: number; text: string } | null;
  ready: () => void;
  start: () => void;
  finishIntro: () => void;
  replayIntro: () => void;
  setIntroStep: (step: number) => void;
  setNearest: (id: SpotId | null) => void;
  setSeated: (id: SpotId | null) => void;
  toggle: (key: Toggle, value?: boolean) => void;
  rev: () => void;
  flash: () => void;
  knock: () => number;
  celebrate: () => void;
  collect: (id: string) => boolean;
  hydrateFound: () => void;
  resetCrystals: () => void;
  say: (text: string) => void;
  toggleMenu: () => void;
  setAudio: (enabled: boolean) => void;
  /** Peta besar (Tab / klik minimap). */
  mapOpen: boolean;
  /** Kursor terkunci (pointer lock) untuk kamera bebas. */
  pointerLocked: boolean;
  toggleMap: (open?: boolean) => void;
  setPointerLocked: (locked: boolean) => void;
  configure: (reducedMotion: boolean) => void;
};

let toastId = 0;

export const useGameStore = create<GameState>((set, get) => ({
  phase: "loading",
  introStep: 0,
  nearest: null,
  seated: null,
  menuOpen: false,
  audioEnabled: false,
  mapOpen: false,
  pointerLocked: false,
  reducedMotion: false,
  toggles: { pc: false, workbench: false, radio: false },
  bikeRevAt: 0,
  flashAt: 0,
  peekAt: 0,
  celebrateAt: 0,
  knocks: 0,
  found: [],
  crystalRound: 0,
  toast: null,
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
      seated: null,
    }),
  setIntroStep: (introStep) => set({ introStep }),
  setNearest: (nearest) => {
    if (get().nearest !== nearest) set({ nearest });
  },
  setSeated: (seated) => set({ seated }),
  toggle: (key, value) =>
    set((state) => ({
      toggles: { ...state.toggles, [key]: value ?? !state.toggles[key] },
    })),
  rev: () => set({ bikeRevAt: performance.now() }),
  flash: () => set({ flashAt: performance.now() }),
  knock: () => {
    const knocks = get().knocks + 1;
    set({ knocks, ...(knocks >= 2 ? { peekAt: performance.now() } : {}) });
    return knocks;
  },
  celebrate: () => set({ celebrateAt: performance.now() }),
  collect: (id) => {
    const found = get().found;
    if (found.includes(id) || !crystals.some((c) => c.id === id)) return false;
    const next = [...found, id];
    set({ found: next });
    writeFound(next);
    return true;
  },
  hydrateFound: () => set({ found: readFound() }),
  resetCrystals: () => {
    set((state) => ({ found: [], crystalRound: state.crystalRound + 1, celebrateAt: 0 }));
    writeFound([]);
  },
  say: (text) => set({ toast: { id: ++toastId, text } }),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen, mapOpen: false })),
  setAudio: (audioEnabled) => set({ audioEnabled }),
  toggleMap: (open) => set((state) => ({ mapOpen: open ?? !state.mapOpen })),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  configure: (reducedMotion) => set({ reducedMotion }),
}));
