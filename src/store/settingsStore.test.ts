import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { defaults, presets, sanitize, useSettings } from "./settingsStore";

describe("Pengaturan", () => {
  beforeEach(() => useSettings.setState({ ...defaults, stored: false }));
  test("data tersimpan yang rusak kembali ke default dan dibatasi", () => {
    const clean = sanitize({
      graphics: { preset: "ultra", resolution: 9, bloom: "ya" },
      audio: { master: -2, music: 0.3 },
      controls: { sensitivity: Number.NaN, invertY: true },
    });
    assert.equal(clean.graphics.preset, "medium");
    assert.equal(clean.graphics.resolution, 1);
    assert.equal(clean.graphics.bloom, defaults.graphics.bloom);
    assert.equal(clean.audio.master, 0);
    assert.equal(clean.audio.music, 0.3);
    assert.equal(clean.controls.sensitivity, defaults.controls.sensitivity);
    assert.equal(clean.controls.invertY, true);
    assert.deepEqual(sanitize(null), sanitize({}));
  });
  test("preset mengisi semua opsi grafis; ubah manual menjadi kustom", () => {
    const s = useSettings.getState;
    s().applyPreset("low");
    assert.equal(s().graphics.preset, "low");
    assert.equal(s().graphics.bloom, presets.low.bloom);
    assert.equal(s().graphics.resolution, presets.low.resolution);
    s().setGraphics({ bloom: true });
    assert.equal(s().graphics.preset, "custom");
    s().setGraphics({ showFps: true });
    assert.equal(s().graphics.preset, "custom");
    s().applyPreset("high");
    assert.equal(s().graphics.ao, true);
    assert.equal(s().graphics.showFps, true);
  });
  test("FPS saja tidak mengubah preset; deteksi perangkat tidak menyimpan", () => {
    const s = useSettings.getState;
    s().setGraphics({ showFps: true });
    assert.equal(s().graphics.preset, "medium");
    useSettings.setState({ stored: false });
    s().applyPreset("low", false);
    assert.equal(s().stored, false);
    assert.equal(s().graphics.preset, "low");
  });
});
