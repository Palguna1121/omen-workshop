import { spots, type SpotId } from "../config";

/**
 * Spot terdekat dalam radius horizontal, pada lantai yang sama
 * (selisih tinggi kaki ≤ 1 m: atap tidak memicu spot di bawahnya).
 */
export function findNearestSpot(x: number, z: number, feetY = 0): SpotId | null {
  let nearest: SpotId | null = null;
  let distance = Infinity;
  for (const spot of spots) {
    if (Math.abs(feetY - spot.position[1]) > 1) continue;
    const squared = (x - spot.position[0]) ** 2 + (z - spot.position[2]) ** 2;
    if (squared <= spot.radius ** 2 && squared < distance) {
      nearest = spot.id;
      distance = squared;
    }
  }
  return nearest;
}
