import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  closeAudio,
  disableAudio,
  enableAudio,
  startAmbient,
  startPortalHum,
  startRadio,
  setVolumes,
  type Loop,
} from "./sound";
import { useSettings } from "@/store/settingsStore";

// Pilihan bisu eksplisit dari pengguna dihormati saat tombol Masuk ditekan.
let userMuted = false;

/** Loop yang volumenya diatur per frame oleh SoundDriver (jarak ke sumber). */
export const loops: { portal: Loop | null; radio: Loop | null } = {
  portal: null,
  radio: null,
};

export async function enableAudioFromGesture({ respectMute = false } = {}) {
  if (respectMute && userMuted) return;
  userMuted = false;
  try {
    useGameStore.getState().setAudio(await enableAudio());
  } catch {
    useGameStore.getState().setAudio(false);
  }
}

export async function muteAudio() {
  userMuted = true;
  useGameStore.getState().setAudio(false);
  await disableAudio();
}

/** Mengelola ambient bed, dengung portal, dan radio sesuai state. */
export function AudioHelper() {
  const enabled = useGameStore((s) => s.audioEnabled);
  const live = useGameStore((s) => s.phase !== "loading");
  const radio = useGameStore((s) => s.toggles.radio);
  useEffect(() => {
    if (!enabled || !live) return;
    const stopAmbient = startAmbient();
    loops.portal = startPortalHum();
    return () => {
      stopAmbient();
      loops.portal?.stop();
      loops.portal = null;
    };
  }, [enabled, live]);
  useEffect(() => {
    if (!enabled || !radio) return;
    loops.radio = startRadio();
    return () => {
      loops.radio?.stop();
      loops.radio = null;
    };
  }, [enabled, radio]);
  useEffect(() => {
    // Volume per bus mengikuti pengaturan (juga sebelum audio aktif).
    setVolumes(useSettings.getState().audio);
    return useSettings.subscribe((state) => setVolumes(state.audio));
  }, []);
  useEffect(() => {
    // Tab tersembunyi: hentikan semua suara; kembali bila masih diaktifkan.
    const visibility = () => {
      if (document.hidden) void disableAudio();
      else if (useGameStore.getState().audioEnabled) void enableAudio();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(
    () => () => {
      void closeAudio();
      useGameStore.getState().setAudio(false);
    },
    [],
  );
  return null;
}
