import { test } from "node:test";
import assert from "node:assert/strict";
import { AnimationClip, AnimationMixer, Bone, Group, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from "three";
import { configureJumpAction, inPlaceAnimations, pauseCharacterAnimation, prepareCharacterClips, withWorkshopAnimations } from "./animations";

test("idle bernapas dengan kaki tetap menapak, loop utuh dan walk sumber tetap utuh", () => {
  const scene = new Group();
  const hips = new Bone();
  hips.name = "mixamorigHips";
  hips.position.y = 1;
  const spine = new Bone();
  spine.name = "mixamorigSpine2";
  const leg = new Bone();
  leg.name = "mixamorigLeftUpLeg";
  leg.position.set(0.15, -0.5, 0);
  const foot = new Bone();
  foot.name = "mixamorigLeftFoot";
  foot.position.y = -0.5;
  scene.add(hips);
  hips.add(spine, leg);
  leg.add(foot);
  const walk = new AnimationClip("walk", 1, [
    new VectorKeyframeTrack(`${hips.name}.position`, [0, 1], [0, 1, 0, 1, 1.1, 2]),
    new QuaternionKeyframeTrack(`${leg.name}.quaternion`, [0, 1], [0, 0, 0, 1, 0.2, 0, 0, Math.sqrt(0.96)]),
  ]);
  const source = JSON.stringify(AnimationClip.toJSON(walk));
  const clips = withWorkshopAnimations(inPlaceAnimations([walk]), scene, "walk", "idle", "jump");
  const idle = clips.find((clip) => clip.name === "idle")!;
  assert.ok(idle.validate());
  assert.ok(clips.find((clip) => clip.name === "jump")!.validate());
  const mixer = new AnimationMixer(scene);
  mixer.clipAction(idle).play();
  mixer.update(0);
  const planted = foot.getWorldPosition(new Vector3());
  const start = spine.quaternion.clone();
  mixer.update(1.2);
  assert.ok(spine.quaternion.angleTo(start) > 0.02, "idle harus mengubah tubuh");
  assert.ok(foot.getWorldPosition(new Vector3()).distanceTo(planted) < 1e-6, "idle tidak menggeser kaki");
  mixer.update(3.6);
  assert.ok(spine.quaternion.angleTo(start) < 1e-5, "ujung loop harus menyambung");
  assert.equal(JSON.stringify(AnimationClip.toJSON(walk)), source);
  assert.deepEqual(Array.from(clips[0].tracks[0].values), [0, 1, 0, 0, Math.fround(1.1), 0]);
});

test("klip asli dipakai, walk in-place, dan jump tidak menambahkan root motion atau mengulang hop", () => {
  const scene = new Group();
  const hips = new Bone();
  hips.name = "mixamorigHips";
  scene.add(hips);
  const position = `${hips.name}.position`;
  const idle = new AnimationClip("idle", 15, [new VectorKeyframeTrack(position, [0, 15], [0, 1, 0, 0.1, 1.02, 0.03])]);
  const walk = new AnimationClip("walk", 1, [new VectorKeyframeTrack(position, [0, 1], [0, 1, 0, 2, 1.1, 3])]);
  const jump = new AnimationClip("jump", 2, [new VectorKeyframeTrack(position, [0, 0.2, 0.4, 0.6, 2], [0, 1, 0, 0.1, 1.5, 0.2, 0.2, 0.9, 0.3, 0.3, 1.6, 0.4, 0.4, 1, 0.5])]);
  const sources = [idle, walk, jump];
  const original = sources.map((clip) => JSON.stringify(AnimationClip.toJSON(clip)));
  const clips = prepareCharacterClips(sources, scene, { idle: "idle", walk: "walk", run: "run", jump: "jump" }, { startFrame: 0, endFrame: 11, fps: 24 });
  assert.equal(clips.length, 3, "klip prosedural tidak ditambahkan saat klip asli ada");
  assert.deepEqual(Array.from(clips[0].tracks[0].values), Array.from(idle.tracks[0].values), "idle mempertahankan weight shift");
  assert.deepEqual(Array.from(clips[1].tracks[0].values), [0, 1, 0, 0, Math.fround(1.1), 0]);
  const excerpt = clips[2];
  assert.ok(excerpt.validate());
  assert.ok(excerpt.duration < 0.5 && excerpt.duration > 0.3);
  assert.deepEqual(Array.from(excerpt.tracks[0].values), [0, 1, 0, 0, 1, 0, 0, 1, 0]);
  const mixer = new AnimationMixer(scene);
  const action = mixer.clipAction(excerpt);
  configureJumpAction(action, 1.08);
  action.play();
  mixer.update(0.54);
  assert.ok(Math.abs(action.time - excerpt.duration / 2) < 1e-5, "hop mengikuti lama terbang physics");
  mixer.update(0.8);
  assert.ok(action.paused, "satu hop selesai lalu menahan frame terakhir");
  assert.equal(action.time, excerpt.duration);
  assert.deepEqual(sources.map((clip) => JSON.stringify(AnimationClip.toJSON(clip))), original);
});

test("mixer dapat berhenti bersama physics saat panel terbuka", () => {
  const scene = new Group();
  const clip = new AnimationClip("idle", 1, [new VectorKeyframeTrack(".position", [0, 1], [0, 0, 0, 1, 0, 0])]);
  const mixer = new AnimationMixer(scene);
  const action = mixer.clipAction(clip).play();
  mixer.update(0.2);
  pauseCharacterAnimation(mixer, true);
  mixer.update(0.5);
  assert.ok(Math.abs(action.time - 0.2) < 1e-5);
  pauseCharacterAnimation(mixer, false);
  mixer.update(0.1);
  assert.ok(Math.abs(action.time - 0.3) < 1e-5);
});
