import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { findNearestStation } from "./proximity";

describe("Interaksi berdasarkan jarak", () => {
  test("area tengah tidak membuka stasiun yang jauh", () => {
    assert.equal(findNearestStation(0, 0), null);
    assert.equal(findNearestStation(100, 100), null);
  });
  test("semua objek hub dapat ditemukan", () => {
    assert.equal(findNearestStation(-4, -2.8), "skills");
    assert.equal(findNearestStation(3.7, -2.8), "projects");
    assert.equal(findNearestStation(4.8, 0.2), "experience");
    assert.equal(findNearestStation(-4.4, 1.7), "about");
    assert.equal(findNearestStation(0, -4.2), "journey");
    assert.equal(findNearestStation(4.3, 3.3), "featured");
  });
  test("batas radius inklusif tanpa membuka objek di luar radius", () => {
    assert.equal(findNearestStation(-6.25, -2.8), "skills");
    assert.equal(findNearestStation(-6.26, -2.8), null);
  });
  test("area radius yang tumpang tindih memilih objek paling dekat", () => {
    assert.equal(findNearestStation(4.4, -1.1), "experience");
  });
});
