import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { useGameStore } from "./gameStore";

describe("Siklus pengalaman", () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: "loading",
      reducedMotion: false,
      section: null,
      nearest: null,
      menuOpen: false,
      visited: [],
      introStep: 0,
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
    useGameStore.getState().configure("low", true);
    useGameStore.getState().start();
    assert.equal(useGameStore.getState().phase, "playing");
  });
  test("kunjungan unik dan pembukaan panel menutup menu", () => {
    const state = useGameStore.getState;
    state().toggleMenu();
    state().openSection("projects");
    state().closeSection();
    state().openSection("projects");
    assert.deepEqual(state().visited, ["projects"]);
    assert.equal(state().section, "projects");
    assert.equal(state().menuOpen, false);
  });
  test("ulang intro membersihkan panel tanpa menghapus progres", () => {
    const state = useGameStore.getState;
    state().openSection("skills");
    state().replayIntro();
    assert.equal(state().phase, "intro");
    assert.equal(state().section, null);
    assert.deepEqual(state().visited, ["skills"]);
  });
});
