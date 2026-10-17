import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { findNearestSpot } from "./proximity";

describe("Interaksi berdasarkan jarak", () => {
  test("halaman spawn, tengah garasi, dan titik jauh tidak memicu spot", () => {
    assert.equal(findNearestSpot(0, 9.5), null);
    assert.equal(findNearestSpot(0, 0.6), null);
    assert.equal(findNearestSpot(100, 100), null);
  });
  test("setiap spot lantai bawah dapat ditemukan", () => {
    assert.equal(findNearestSpot(-3.9, 1.2), "sofa");
    assert.equal(findNearestSpot(-3.3, -2.75), "desk");
    assert.equal(findNearestSpot(3.3, -2.9), "workbench");
    assert.equal(findNearestSpot(0, -3.5), "radio");
    assert.equal(findNearestSpot(2.55, 2.4), "bike");
    assert.equal(findNearestSpot(4.2, -0.9), "portal");
  });
  test("spot di ketinggian hanya aktif pada lantainya sendiri", () => {
    // Pintu rumah di teras (lantai 1,2 m), portal atap di atas garasi (4,45 m).
    assert.equal(findNearestSpot(-11.6, 4.1, 1.2), "door");
    assert.equal(findNearestSpot(-11.6, 4.1, 0), null);
    assert.equal(findNearestSpot(-3.3, -2.5, 4.48), "roof");
    assert.equal(findNearestSpot(-3.3, -2.5, 0), "desk");
  });
  test("batas radius inklusif", () => {
    assert.equal(findNearestSpot(0, -3.5 + 1.7), "radio");
    assert.equal(findNearestSpot(0, -3.5 + 1.71), null);
  });
});
