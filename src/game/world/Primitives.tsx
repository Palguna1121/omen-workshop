import type { Material, Texture } from "three";
import type { Vec3 } from "../config";
import { box, glow, surface } from "./palette";

export function Block({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = "#d1c3ae",
  rotation,
  emissive,
  map,
  tile = 2,
  roughness,
  metalness,
  material,
  glowColor,
  glowIntensity = 3,
  shadow = true,
}: {
  position?: Vec3;
  size?: Vec3;
  color?: string;
  rotation?: Vec3;
  emissive?: string;
  map?: Texture;
  /** Ukuran satu ulangan tekstur dalam meter. */
  tile?: number;
  roughness?: number;
  metalness?: number;
  material?: Material;
  glowColor?: string;
  glowIntensity?: number;
  shadow?: boolean;
}) {
  const mat =
    material ??
    (glowColor
      ? glow(glowColor, glowIntensity)
      : surface({
          color,
          roughness,
          metalness,
          map,
          emissive,
          emissiveIntensity: emissive ? 0.6 : 0,
        }));
  return (
    <mesh
      position={position}
      rotation={rotation}
      geometry={box(size, map ? tile : undefined)}
      material={mat}
      castShadow={shadow && !glowColor}
      receiveShadow
    />
  );
}
