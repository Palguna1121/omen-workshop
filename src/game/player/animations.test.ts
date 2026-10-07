import { test } from "node:test";
import assert from "node:assert/strict";
import { AnimationClip, AnimationMixer, Bone, Group, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from "three";
import { inPlaceAnimations, withWorkshopAnimations } from "./animations";

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
