import {
  AnimationClip,
  AnimationUtils,
  Bone,
  LoopOnce,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
  type AnimationAction,
  type AnimationMixer,
  type KeyframeTrack,
  type Object3D,
} from "three";

export function inPlaceAnimations(clips: AnimationClip[], names?: readonly string[], scene?: Object3D) {
  return clips.map((source) => {
    const clip = source.clone();
    if (names && !names.includes(source.name)) return clip;
    for (const track of clip.tracks) {
      if (
        track instanceof VectorKeyframeTrack &&
        /(?:hips|root)\.position$/i.test(track.name)
      ) {
        // Ekspor run dimulai dengan offset Z. Gunakan anchor bind pose agar
        // model tetap sejajar dengan collider ketika klip berganti.
        const root = scene?.getObjectByName(track.name.slice(0, -".position".length));
        const x = root?.position.x ?? track.values[0];
        const z = root?.position.z ?? track.values[2];
        for (let i = 0; i < track.values.length; i += 3) {
          track.values[i] = x;
          track.values[i + 2] = z;
        }
      }
    }
    return clip;
  });
}

export function prepareCharacterClips(
  clips: AnimationClip[],
  scene: Object3D,
  names: { idle: string; walk: string; run: string; jump: string; relax?: string },
  segment: { startFrame: number; endFrame: number; fps: number },
) {
  // Idle mempertahankan perpindahan berat badan lokal dari animator.
  const prepared = inPlaceAnimations(clips, [names.walk, names.run, ...(names.relax ? [names.relax] : [])], scene);
  const jumpIndex = prepared.findIndex((clip) => clip.name === names.jump);
  if (jumpIndex !== -1) {
    const excerpt = AnimationUtils.subclip(
      prepared[jumpIndex], names.jump,
      segment.startFrame, segment.endFrame, segment.fps,
    );
    const jump = excerpt.duration > 0 && excerpt.tracks.length ? excerpt : prepared[jumpIndex];
    for (const track of jump.tracks) {
      if (!(track instanceof VectorKeyframeTrack) || !/(?:hips|root)\.position$/i.test(track.name)) continue;
      // Physics memindahkan tubuh, termasuk tinggi lompat; jangan tambahkan
      // perpindahan root dari file untuk kedua kalinya.
      const origin = track.values.slice(0, 3);
      for (let i = 0; i < track.values.length; i += 3) track.values.set(origin, i);
    }
    prepared[jumpIndex] = jump;
  }
  return withWorkshopAnimations(prepared, scene, names.walk, names.idle, names.jump);
}

export function configureJumpAction(action: AnimationAction, flightDuration: number) {
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.setEffectiveTimeScale(action.getClip().duration / flightDuration);
}

export function pauseCharacterAnimation(mixer: AnimationMixer, paused: boolean) {
  mixer.timeScale = paused ? 0 : 1;
}

function sample(track: KeyframeTrack | undefined, fallback: number[]) {
  if (!track) return fallback;
  const frame = Math.max(0, Array.from(track.times).findIndex((time) => time >= 0.25));
  const size = track.getValueSize();
  return Array.from(track.values.slice(frame * size, (frame + 1) * size));
}

// Klip lokal melengkapi aset walk tanpa mengubah file GLB atau animasi sumber.
// Kaki/hips memakai bind pose agar idle tidak menahan pose langkah satu kaki.
export function withWorkshopAnimations(
  clips: AnimationClip[],
  scene: Object3D,
  walkName: string,
  idleName: string,
  jumpName: string,
) {
  if (clips.some((clip) => clip.name === idleName) && clips.some((clip) => clip.name === jumpName)) return clips;
  const walk = clips.find((clip) => clip.name === walkName);
  const sourceTracks = new Map(walk?.tracks.map((track) => [track.name, track]));
  const idle: KeyframeTrack[] = [];
  const jump: KeyframeTrack[] = [];
  const times = Array.from({ length: 17 }, (_, i) => i * 0.3);
  scene.traverse((bone) => {
    if (!(bone instanceof Bone)) return;
    const lowerBody = /Hips|UpLeg|Leg|Foot|Toe/i.test(bone.name);
    const position = lowerBody ? bone.position.toArray() : sample(sourceTracks.get(`${bone.name}.position`), bone.position.toArray());
    const orientation = lowerBody ? bone.quaternion.toArray() : sample(sourceTracks.get(`${bone.name}.quaternion`), bone.quaternion.toArray());
    const scale = bone.scale.toArray();
    for (const tracks of [idle, jump]) {
      tracks.push(new VectorKeyframeTrack(`${bone.name}.position`, [0, 4.8], [...position, ...position]));
      tracks.push(new VectorKeyframeTrack(`${bone.name}.scale`, [0, 4.8], [...scale, ...scale]));
    }
    const base = new Quaternion().fromArray(orientation);
    const values: number[] = [];
    for (let i = 0; i < times.length; i++) {
      const wave = Math.sin(i * Math.PI / 8);
      const rotation = new Quaternion();
      if (/Spine2$/i.test(bone.name)) rotation.setFromAxisAngle(new Vector3(0, 0, 1), wave * 0.026);
      else if (/Head$/i.test(bone.name)) rotation.setFromAxisAngle(new Vector3(0, 1, 0), wave * 0.032);
      else if (/(?:Left|Right)Arm$/i.test(bone.name)) rotation.setFromAxisAngle(new Vector3(1, 0, 0), wave * 0.028);
      values.push(...base.clone().multiply(rotation).toArray());
    }
    idle.push(new QuaternionKeyframeTrack(`${bone.name}.quaternion`, times, values));
    const air = base.clone();
    if (/(?:Left|Right)Arm$/i.test(bone.name)) air.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), 0.22));
    if (/(?:Left|Right)Leg$/i.test(bone.name)) air.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -0.2));
    jump.push(new QuaternionKeyframeTrack(`${bone.name}.quaternion`, [0, 4.8], [...air.toArray(), ...air.toArray()]));
  });
  const result = [...clips];
  if (idle.length && !clips.some((clip) => clip.name === idleName)) result.push(new AnimationClip(idleName, 4.8, idle));
  if (jump.length && !clips.some((clip) => clip.name === jumpName)) result.push(new AnimationClip(jumpName, 4.8, jump));
  return result;
}
