import { create } from "zustand";

export type Preset = "low" | "medium" | "high";

export type Graphics = {
  /** Preset terakhir yang dipilih; "custom" bila ada opsi yang diubah manual. */
  preset: Preset | "custom";
  /** Pengali resolusi render terhadap DPR perangkat (maks 1,5). */
  resolution: number;
  bloom: boolean;
  shadows: boolean;
  ao: boolean;
  particles: boolean;
  /** Lampu sekunder (lentera kecil, lampu dekor). */
  extraLights: boolean;
  showFps: boolean;
};

export type Audio = {
  master: number;
  ambient: number;
  music: number;
  effects: number;
};

export type Controls = {
  sensitivity: number;
  invertY: boolean;
};

export const presets: Record<Preset, Omit<Graphics, "preset" | "showFps">> = {
  low: { resolution: 0.75, bloom: false, shadows: false, ao: false, particles: false, extraLights: false },
  medium: { resolution: 1, bloom: true, shadows: true, ao: false, particles: true, extraLights: true },
  high: { resolution: 1, bloom: true, shadows: true, ao: true, particles: true, extraLights: true },
};

export const defaults = {
  graphics: { preset: "medium", showFps: false, ...presets.medium } as Graphics,
  audio: { master: 0.8, ambient: 0.7, music: 0.7, effects: 0.85 } as Audio,
  controls: { sensitivity: 1, invertY: false } as Controls,
};

const KEY = "workshop-omen:pengaturan";
const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

/** Validasi data tersimpan: nilai rusak/asing kembali ke default. */
export function sanitize(raw: unknown) {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, Record<string, unknown>>;
  const g = data.graphics ?? {};
  const a = data.audio ?? {};
  const c = data.controls ?? {};
  const d = defaults;
  const preset = ["low", "medium", "high", "custom"].includes(g.preset as string)
    ? (g.preset as Graphics["preset"])
    : d.graphics.preset;
  return {
    graphics: {
      preset,
      resolution: clamp(g.resolution, 0.5, 1, d.graphics.resolution),
      bloom: bool(g.bloom, d.graphics.bloom),
      shadows: bool(g.shadows, d.graphics.shadows),
      ao: bool(g.ao, d.graphics.ao),
      particles: bool(g.particles, d.graphics.particles),
      extraLights: bool(g.extraLights, d.graphics.extraLights),
      showFps: bool(g.showFps, d.graphics.showFps),
    },
    audio: {
      master: clamp(a.master, 0, 1, d.audio.master),
      ambient: clamp(a.ambient, 0, 1, d.audio.ambient),
      music: clamp(a.music, 0, 1, d.audio.music),
      effects: clamp(a.effects, 0, 1, d.audio.effects),
    },
    controls: {
      sensitivity: clamp(c.sensitivity, 0.3, 2.5, d.controls.sensitivity),
      invertY: bool(c.invertY, d.controls.invertY),
    },
  };
}

type SettingsState = ReturnType<typeof sanitize> & {
  /** true bila pengguna sudah pernah menyimpan pengaturan (jangan timpa dengan deteksi perangkat). */
  stored: boolean;
  /** persist=false: dipakai deteksi perangkat, tidak disimpan. */
  applyPreset: (preset: Preset, persist?: boolean) => void;
  setGraphics: (patch: Partial<Omit<Graphics, "preset">>) => void;
  setAudio: (patch: Partial<Audio>) => void;
  setControls: (patch: Partial<Controls>) => void;
  hydrate: () => void;
  reset: () => void;
};

function save(state: SettingsState) {
  try {
    globalThis.localStorage?.setItem(
      KEY,
      JSON.stringify({ graphics: state.graphics, audio: state.audio, controls: state.controls }),
    );
  } catch {
    // Penyimpanan diblokir: pengaturan tetap berlaku selama sesi.
  }
}

export const useSettings = create<SettingsState>((set, get) => {
  const commit = (patch: Partial<SettingsState>) => {
    set({ ...patch, stored: true });
    save(get());
  };
  return {
    ...defaults,
    stored: false,
    applyPreset: (preset, persist = true) => {
      const graphics = { ...get().graphics, ...presets[preset], preset };
      if (persist) commit({ graphics });
      else set({ graphics });
    },
    setGraphics: (patch) => {
      const graphics = { ...get().graphics, ...patch };
      // Mengubah opsi selain FPS membuat preset menjadi "Kustom".
      const onlyFps = Object.keys(patch).every((key) => key === "showFps");
      commit({ graphics: onlyFps ? graphics : { ...graphics, preset: "custom" } });
    },
    setAudio: (patch) => commit({ audio: { ...get().audio, ...patch } }),
    setControls: (patch) => commit({ controls: { ...get().controls, ...patch } }),
    hydrate: () => {
      try {
        const raw = globalThis.localStorage?.getItem(KEY);
        if (raw) set({ ...sanitize(JSON.parse(raw)), stored: true });
      } catch {
        // Data rusak: tetap default.
      }
    },
    reset: () => commit({ ...defaults }),
  };
});
