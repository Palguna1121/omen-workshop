// Satu sumber ukuran dunia: arsitektur, collider, dan kamera membaca nilai yang sama.
export const GROUND_TOP = 0.08;

export const GARAGE = {
  minX: -6,
  maxX: 6,
  minZ: -5,
  maxZ: 5,
  ceiling: 4.1,
  doorHalf: 4.4,
  doorTop: 3.4,
};

export const HOUSE = {
  minX: -17.5,
  maxX: -6.3,
  minZ: -6.5,
  maxZ: 3,
  floor: 1.2,
  upper: 4.5,
  eave: 7.4,
  ridge: 10.55,
  porch: { minX: -16.8, maxX: -7, maxZ: 5.6 },
  stairs: { x: -11.6, half: 1, depth: 2.3, steps: 6 },
};

export const BOUNDS = { minX: -21, maxX: 13, minZ: -9.5, maxZ: 15.5 };
