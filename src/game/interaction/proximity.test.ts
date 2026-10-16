import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { findNearestStation } from "./proximity";

describe("Interaksi berdasarkan jarak", () => {
  test("area tengah, halaman spawn, dan titik jauh tidak membuka stasiun", () => {
    assert.equal(findNearestStation(0, 0), null);
    assert.equal(findNearestStation(0, 9.5), null);
    assert.equal(findNearestStation(100, 100), null);
  });
  test("semua objek hub dapat ditemukan", () => {
    assert.equal(findNearestStation(-3.3, -3.0), "skills");
    assert.equal(findNearestStation(3.3, -3.0), "projects");
    assert.equal(findNearestStation(4.5, 2.6), "experience");
    assert.equal(findNearestStation(-3.8, 1.3), "about");
    assert.equal(findNearestStation(0, -3.6), "journey");
    assert.equal(findNearestStation(4.2, -0.9), "featured");
  });
  test("batas radius inklusif tanpa membuka objek di luar radius", () => {
    assert.equal(findNearestStation(-5.5, -3.0), "skills");
    assert.equal(findNearestStation(-5.51, -3.0), null);
  });
  test("area radius yang tumpang tindih memilih objek paling dekat", () => {
    assert.equal(findNearestStation(4.4, 0.9), "experience");
    assert.equal(findNearestStation(4.3, 0.6), "featured");
  });
});
