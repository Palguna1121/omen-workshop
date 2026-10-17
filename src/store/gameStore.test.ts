import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { crystals } from "@/game/config";
import { useGameStore } from "./gameStore";

describe("Siklus dunia", () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: "loading",
      reducedMotion: false,
      nearest: null,
      seated: null,
      menuOpen: false,
      introStep: 0,
      found: [],
      knocks: 0,
      peekAt: 0,
      toggles: { pc: false, workbench: false, radio: false },
    });
  });
  test("loading → ready → intro → bermain", () => {
    const state = useGameStore.getState;
    state().ready();
    assert.equal(state().phase, "ready");
    state().start();
    assert.equal(state().phase, "intro");
    state().finishIntro();
    assert.equal(state().phase, "playing");
    state().ready();
    assert.equal(state().phase, "playing");
  });
  test("reduced motion langsung memberikan kontrol karakter", () => {
    useGameStore.getState().configure(true);
    useGameStore.getState().start();
    assert.equal(useGameStore.getState().phase, "playing");
  });
  test("kristal unik, id asing ditolak, reset menyembunyikan lagi", () => {
    const state = useGameStore.getState;
    assert.equal(state().collect(crystals[0].id), true);
    assert.equal(state().collect(crystals[0].id), false);
    assert.equal(state().collect("bukan-kristal"), false);
    assert.deepEqual(state().found, [crystals[0].id]);
    const round = state().crystalRound;
    state().resetCrystals();
    assert.deepEqual(state().found, []);
    assert.equal(state().crystalRound, round + 1);
  });
  test("toggle radio/PC dan ketukan kedua memunculkan sosok di jendela", () => {
    const state = useGameStore.getState;
    state().toggle("radio");
    assert.equal(state().toggles.radio, true);
    state().toggle("radio");
    assert.equal(state().toggles.radio, false);
    state().toggle("pc", true);
    assert.equal(state().toggles.pc, true);
    assert.equal(state().knock(), 1);
    assert.equal(state().peekAt, 0);
    assert.equal(state().knock(), 2);
    assert.ok(state().peekAt > 0);
  });
  test("ulang intro membuat Omen berdiri tanpa menghapus kristal", () => {
    const state = useGameStore.getState;
    state().collect(crystals[1].id);
    state().setSeated("sofa");
    state().replayIntro();
    assert.equal(state().phase, "intro");
    assert.equal(state().seated, null);
    assert.deepEqual(state().found, [crystals[1].id]);
  });
});
