import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

// Sintesis lokal: tidak ada download musik atau audio berlisensi.
let context: AudioContext | null = null;

export async function enableAudioFromGesture() {
  try {
    context ??= new AudioContext();
    await context.resume();
    useGameStore.getState().setAudio(context.state === "running");
  } catch {
    useGameStore.getState().setAudio(false);
  }
}

export function AudioHelper() {
  const enabled = useGameStore((s) => s.audioEnabled);
  const phase = useGameStore((s) => s.phase);
  useEffect(() => {
    if (!enabled || phase !== "playing" || !context) return;
    const audio = context;
    const master = audio.createGain();
    master.gain.value = 0.018;
    master.connect(audio.destination);
    const oscillators = [130.81, 164.81, 196].map((frequency) => {
      const oscillator = audio.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(master);
      oscillator.start();
      return oscillator;
    });
    const mute = () =>
      master.gain.setTargetAtTime(
        document.hidden ? 0 : 0.018,
        audio.currentTime,
        0.2,
      );
    document.addEventListener("visibilitychange", mute);
    mute();
    return () => {
      document.removeEventListener("visibilitychange", mute);
      oscillators.forEach((osc) => {
        osc.stop();
        osc.disconnect();
      });
      master.disconnect();
    };
  }, [enabled, phase]);
  useEffect(
    () => () => {
      void context?.close();
      context = null;
      useGameStore.getState().setAudio(false);
    },
    [],
  );
  return null;
}
