import { stations, type SectionId } from "../config";

export function findNearestStation(x: number, z: number): SectionId | null {
  let nearest: SectionId | null = null;
  let distance = Infinity;
  for (const station of stations) {
    const squared =
      (x - station.position[0]) ** 2 + (z - station.position[2]) ** 2;
    if (squared <= station.radius ** 2 && squared < distance) {
      nearest = station.id;
      distance = squared;
    }
  }
  return nearest;
}
