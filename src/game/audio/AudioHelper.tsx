import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

// Sintesis lokal: tidak ada download musik atau audio berlisensi.
// Lapisan: drone hangat, angin senja, dan jangkrik.
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
    // Angin senja: noise lowpass dengan hembusan pelan dari LFO.
    const noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const wind = audio.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const windFilter = audio.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 520;
    const windGain = audio.createGain();
    windGain.gain.value = 0.55;
    const gust = audio.createOscillator();
    gust.frequency.value = 0.08;
    const gustDepth = audio.createGain();
    gustDepth.gain.value = 0.35;
    gust.connect(gustDepth).connect(windGain.gain);
    wind.connect(windFilter).connect(windGain).connect(master);
    wind.start();
    gust.start();
    // Jangkrik: denyut pendek bernada tinggi pada jeda acak.
    const crickets = audio.createGain();
    crickets.gain.value = 0.35;
    crickets.connect(master);
    let chirpTimer = 0;
    const chirp = () => {
      const start = audio.currentTime + 0.02;
      const tone = audio.createOscillator();
      const env = audio.createGain();
      tone.frequency.value = 4200 + Math.random() * 600;
      env.gain.value = 0;
      for (let i = 0; i < 3; i++) {
        env.gain.setValueAtTime(0, start + i * 0.06);
        env.gain.linearRampToValueAtTime(1, start + i * 0.06 + 0.01);
        env.gain.linearRampToValueAtTime(0, start + i * 0.06 + 0.04);
      }
      tone.connect(env).connect(crickets);
      tone.start(start);
      tone.stop(start + 0.25);
      tone.onended = () => {
        tone.disconnect();
        env.disconnect();
      };
      chirpTimer = window.setTimeout(chirp, 600 + Math.random() * 2200);
    };
    chirp();
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
      window.clearTimeout(chirpTimer);
      wind.stop();
      gust.stop();
      wind.disconnect();
      gust.disconnect();
      windFilter.disconnect();
      windGain.disconnect();
      crickets.disconnect();
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
