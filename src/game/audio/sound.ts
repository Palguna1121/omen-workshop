// Semua suara disintesis WebAudio di browser: tidak ada file audio/lisensi.
// Struktur: destination ← master ← bus { ambient (bed, portal), music (radio), effects (SFX) }.

type Bus = "ambient" | "music" | "effects";
export type Volumes = { master: number; ambient: number; music: number; effects: number };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let buses: Record<Bus, GainNode> | null = null;
let noiseBuffer: AudioBuffer | null = null;
let volumes: Volumes = { master: 0.8, ambient: 0.7, music: 0.7, effects: 0.85 };

/** Konteks + node tujuan default (bus efek). */
export function audio() {
  return ctx && master && buses && ctx.state === "running"
    ? { ctx, master: buses.effects, buses }
    : null;
}

/** Terapkan volume (0–1) dari pengaturan; aman dipanggil sebelum audio aktif. */
export function setVolumes(next: Volumes) {
  volumes = next;
  if (!ctx || !master || !buses) return;
  const now = ctx.currentTime;
  master.gain.setTargetAtTime(volumes.master * 0.7, now, 0.05);
  buses.ambient.gain.setTargetAtTime(volumes.ambient, now, 0.05);
  buses.music.gain.setTargetAtTime(volumes.music, now, 0.05);
  buses.effects.gain.setTargetAtTime(volumes.effects, now, 0.05);
}

export async function enableAudio() {
  ctx ??= new AudioContext();
  if (!master) {
    master = ctx.createGain();
    master.connect(ctx.destination);
    const bus = () => {
      const gain = ctx!.createGain();
      gain.connect(master!);
      return gain;
    };
    buses = { ambient: bus(), music: bus(), effects: bus() };
    setVolumes(volumes);
  }
  await ctx.resume();
  return ctx.state === "running";
}

export async function disableAudio() {
  await ctx?.suspend();
}

export async function closeAudio() {
  const closing = ctx;
  ctx = null;
  master = null;
  buses = null;
  noiseBuffer = null;
  await closing?.close();
}

function noise(c: AudioContext) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== c.sampleRate) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Nada dengan amplop attack/decay sederhana. */
function tone(
  freq: number,
  at: number,
  duration: number,
  {
    type = "sine" as OscillatorType,
    gain = 0.3,
    attack = 0.005,
    to,
    dest,
  }: { type?: OscillatorType; gain?: number; attack?: number; to?: number; dest?: AudioNode } = {},
) {
  const a = audio();
  if (!a) return;
  const osc = a.ctx.createOscillator();
  const env = a.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + duration);
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(env).connect(dest ?? a.master);
  osc.start(at);
  osc.stop(at + duration + 0.05);
  osc.onended = () => env.disconnect();
}

/** Semburan noise terfilter. */
function burst(
  at: number,
  duration: number,
  { type = "bandpass" as BiquadFilterType, freq = 1000, to, q = 1, gain = 0.3, dest }: {
    type?: BiquadFilterType;
    freq?: number;
    to?: number;
    q?: number;
    gain?: number;
    dest?: AudioNode;
  } = {},
) {
  const a = audio();
  if (!a) return;
  const src = a.ctx.createBufferSource();
  src.buffer = noise(a.ctx);
  const filter = a.ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, at);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, at + duration);
  const env = a.ctx.createGain();
  env.gain.setValueAtTime(gain, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  src.connect(filter).connect(env).connect(dest ?? a.master);
  src.start(at, Math.random());
  src.stop(at + duration + 0.05);
  src.onended = () => env.disconnect();
}

export type Sfx =
  | "step-wood"
  | "step-stone"
  | "sit"
  | "boot"
  | "workbench"
  | "rev"
  | "teleport"
  | "knock"
  | "crystal"
  | "complete"
  | "meow"
  | "flap"
  | "click";

export function sfx(name: Sfx) {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime + 0.01;
  switch (name) {
    case "step-wood":
      burst(t, 0.06, { freq: 1900, q: 1.4, gain: 0.12 });
      tone(140, t, 0.06, { gain: 0.08 });
      break;
    case "step-stone":
      burst(t, 0.05, { freq: 900, q: 0.9, gain: 0.1 });
      tone(85, t, 0.05, { gain: 0.06 });
      break;
    case "sit":
      tone(80, t, 0.22, { gain: 0.3, to: 55 });
      burst(t, 0.18, { type: "lowpass", freq: 600, gain: 0.12 });
      break;
    case "boot":
      [660, 880, 1320].forEach((f, i) => tone(f, t + i * 0.11, 0.1, { type: "triangle", gain: 0.12 }));
      tone(110, t, 1.2, { type: "sawtooth", gain: 0.03, attack: 0.3 });
      break;
    case "workbench":
      tone(120, t, 0.9, { type: "sawtooth", gain: 0.06, to: 260, attack: 0.1 });
      for (let i = 0; i < 6; i++) burst(t + 0.15 + i * 0.09 + Math.random() * 0.05, 0.03, { freq: 4000, q: 2, gain: 0.08 });
      break;
    case "rev": {
      const filter = a.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 700;
      filter.connect(a.master);
      [0, 6].forEach((detune) => {
        const osc = a.ctx.createOscillator();
        const env = a.ctx.createGain();
        osc.type = "sawtooth";
        osc.detune.value = detune * 10;
        osc.frequency.setValueAtTime(48, t);
        osc.frequency.exponentialRampToValueAtTime(170, t + 0.45);
        osc.frequency.exponentialRampToValueAtTime(95, t + 1.0);
        osc.frequency.exponentialRampToValueAtTime(140, t + 1.3);
        osc.frequency.exponentialRampToValueAtTime(50, t + 2.2);
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.14, t + 0.08);
        env.gain.setValueAtTime(0.14, t + 1.6);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
        osc.connect(env).connect(filter);
        osc.start(t);
        osc.stop(t + 2.4);
      });
      window.setTimeout(() => filter.disconnect(), 2600);
      break;
    }
    case "teleport":
      burst(t, 0.8, { freq: 250, to: 3200, q: 3, gain: 0.25 });
      [880, 1320, 1760].forEach((f, i) => tone(f, t + 0.15 + i * 0.07, 0.7, { type: "sine", gain: 0.06 }));
      break;
    case "knock":
      for (let i = 0; i < 3; i++) {
        tone(105, t + i * 0.19, 0.12, { gain: 0.35, to: 70 });
        burst(t + i * 0.19, 0.07, { freq: 420, q: 1.5, gain: 0.25 });
      }
      break;
    case "crystal":
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) =>
        tone(f, t + i * 0.08, 0.9, { type: "triangle", gain: 0.12 }),
      );
      break;
    case "complete":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        tone(f, t + i * 0.12, 1.6, { type: "triangle", gain: 0.12 }),
      );
      [261.6, 329.6, 392].forEach((f) => tone(f, t + 0.6, 2.2, { type: "sine", gain: 0.08, attack: 0.2 }));
      break;
    case "meow": {
      const osc = a.ctx.createOscillator();
      const filter = a.ctx.createBiquadFilter();
      const env = a.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.linearRampToValueAtTime(760, t + 0.18);
      osc.frequency.linearRampToValueAtTime(430, t + 0.6);
      filter.type = "bandpass";
      filter.Q.value = 4;
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.linearRampToValueAtTime(1800, t + 0.2);
      filter.frequency.linearRampToValueAtTime(800, t + 0.6);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.18, t + 0.06);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      osc.connect(filter).connect(env).connect(a.master);
      osc.start(t);
      osc.stop(t + 0.7);
      osc.onended = () => env.disconnect();
      break;
    }
    case "flap":
      for (let i = 0; i < 5; i++) burst(t + i * 0.07, 0.05, { type: "lowpass", freq: 900, gain: 0.12 });
      break;
    case "click":
      tone(1400, t, 0.04, { type: "triangle", gain: 0.06 });
      break;
  }
}

/** Ambient malam: drone hangat, angin, ombak, jangkrik. Mengembalikan fungsi stop. */
export function startAmbient() {
  const a = audio();
  if (!a) return () => {};
  const { ctx: c } = a;
  const out = a.buses.ambient;
  const bed = c.createGain();
  bed.gain.value = 0;
  bed.gain.linearRampToValueAtTime(0.5, c.currentTime + 2);
  bed.connect(out);
  const nodes: AudioScheduledSourceNode[] = [];
  const drone = c.createGain();
  drone.gain.value = 0.035;
  drone.connect(bed);
  for (const f of [110, 164.81, 220]) {
    const osc = c.createOscillator();
    osc.frequency.value = f;
    osc.connect(drone);
    osc.start();
    nodes.push(osc);
  }
  const layer = (freq: number, gain: number, rate: number, depth: number) => {
    const src = c.createBufferSource();
    src.buffer = noise(c);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq;
    const g = c.createGain();
    g.gain.value = gain;
    const lfo = c.createOscillator();
    lfo.frequency.value = rate;
    const lfoGain = c.createGain();
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain).connect(g.gain);
    src.connect(filter).connect(g).connect(bed);
    src.start();
    lfo.start();
    nodes.push(src, lfo);
  };
  layer(480, 0.18, 0.07, 0.12); // angin
  layer(320, 0.22, 0.11, 0.2); // ombak jauh
  let timer = 0;
  const chirp = () => {
    const at = c.currentTime + 0.02;
    const freq = 4200 + Math.random() * 600;
    for (let i = 0; i < 3; i++) tone(freq, at + i * 0.06, 0.04, { gain: 0.025, dest: bed });
    timer = window.setTimeout(chirp, 500 + Math.random() * 2000);
  };
  chirp();
  return () => {
    window.clearTimeout(timer);
    const now = c.currentTime;
    bed.gain.cancelScheduledValues(now);
    bed.gain.setValueAtTime(bed.gain.value, now);
    bed.gain.linearRampToValueAtTime(0, now + 0.4);
    window.setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {}
        n.disconnect();
      });
      bed.disconnect();
    }, 500);
  };
}

/** Loop dengan volume yang diatur dari jarak (portal hum, radio). */
export type Loop = { setLevel: (level: number) => void; stop: () => void };

export function startPortalHum(): Loop {
  const a = audio();
  if (!a) return { setLevel: () => {}, stop: () => {} };
  const c = a.ctx;
  const g = c.createGain();
  g.gain.value = 0;
  g.connect(a.buses.ambient);
  const oscs = [55, 82.4, 110.5].map((f, i) => {
    const osc = c.createOscillator();
    osc.type = i === 2 ? "triangle" : "sine";
    osc.frequency.value = f;
    const og = c.createGain();
    og.gain.value = i === 2 ? 0.25 : 0.5;
    osc.connect(og).connect(g);
    osc.start();
    return osc;
  });
  const trem = c.createOscillator();
  trem.frequency.value = 0.6;
  const tremGain = c.createGain();
  tremGain.gain.value = 0.04;
  trem.connect(tremGain).connect(g.gain);
  trem.start();
  return {
    setLevel: (level) => g.gain.setTargetAtTime(level * 0.12, c.currentTime, 0.15),
    stop: () => {
      [...oscs, trem].forEach((o) => {
        o.stop();
        o.disconnect();
      });
      g.disconnect();
    },
  };
}

/** Radio lo-fi generatif: akor pad, bass, arpeggio, hi-hat lembut, kresek piringan. */
export function startRadio(): Loop {
  const a = audio();
  if (!a) return { setLevel: () => {}, stop: () => {} };
  const c = a.ctx;
  const out = c.createGain();
  out.gain.value = 0;
  const tone_ = c.createBiquadFilter();
  tone_.type = "lowpass";
  tone_.frequency.value = 2400;
  out.connect(tone_).connect(a.buses.music);
  const chords = [
    [57, 60, 64, 67], // Am7
    [53, 57, 60, 64], // Fmaj7
    [48, 52, 55, 59], // Cmaj7
    [55, 59, 62, 65], // G7
  ];
  const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
  const beat = 60 / 78;
  let next = c.currentTime + 0.1;
  let step = 0;
  const schedule = () => {
    while (next < c.currentTime + 0.4) {
      const chord = chords[Math.floor(step / 8) % chords.length];
      if (step % 8 === 0) {
        chord.forEach((n) => tone(midi(n), next, beat * 4, { type: "triangle", gain: 0.05, attack: 0.25, dest: out }));
        tone(midi(chord[0] - 12), next, beat * 2, { gain: 0.12, attack: 0.02, dest: out });
      }
      if (step % 8 === 4) tone(midi(chord[0] - 12), next, beat * 1.5, { gain: 0.09, dest: out });
      if (step % 2 === 1) burst(next, 0.04, { type: "highpass", freq: 7000, gain: 0.025, dest: out });
      if (step % 2 === 0 || Math.random() < 0.3) {
        const n = chord[(step + Math.floor(step / 3)) % 4] + 12;
        tone(midi(n), next, beat * 0.9, { type: "triangle", gain: 0.05, dest: out });
      }
      if (Math.random() < 0.6) burst(next + Math.random() * 0.2, 0.01, { type: "highpass", freq: 3000, gain: 0.02, dest: out });
      next += beat / 2;
      step++;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, 100);
  return {
    setLevel: (level) => out.gain.setTargetAtTime(level * 0.9, c.currentTime, 0.2),
    stop: () => {
      window.clearInterval(timer);
      out.gain.setTargetAtTime(0, c.currentTime, 0.1);
      window.setTimeout(() => {
        out.disconnect();
        tone_.disconnect();
      }, 600);
    },
  };
}
