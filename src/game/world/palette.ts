import {
  BoxGeometry,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Side,
  type Texture,
} from "three";
import type { Vec3 } from "../config";

// Palet sunset: kayu hangat, batu ungu keabu, neon ungu/cyan dari Omen.
export const palette = {
  woodDeep: "#3f271d",
  wood: "#6e4430",
  woodWarm: "#9a6440",
  woodLight: "#c08a5a",
  stucco: "#f1d9bf",
  stuccoShade: "#c9a184",
  stone: "#8b7676",
  stoneDark: "#5b4a52",
  stoneLight: "#b39f98",
  roof: "#3b3442",
  roofEdge: "#2a2330",
  plum: "#3b2645",
  plumDeep: "#231828",
  steel: "#3a3946",
  steelLight: "#6d6b7a",
  leaf: "#3d6a37",
  leafLight: "#6a9a48",
  leafDark: "#21402a",
  flower: "#e0287a",
  flowerSoft: "#f05f9a",
  fabricRed: "#b23a3a",
  fabricCream: "#e9d8c0",
  fabricMustard: "#d2962c",
  fabricNavy: "#2e3561",
  purple: "#7b3fe4",
  banner: "#5a2a9c",
  cyan: "#3ee8ff",
  amber: "#ffad55",
  orange: "#ff8a3c",
};

type SurfaceOptions = {
  color: string;
  roughness?: number;
  metalness?: number;
  map?: Texture | null;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: Side;
  alphaTest?: number;
  flat?: boolean;
};

const surfaces = new Map<string, MeshStandardMaterial>();
const glows = new Map<string, MeshBasicMaterial>();
const boxes = new Map<string, BoxGeometry>();

// Material dipakai bersama agar StaticBatch dapat menggabungkan mesh per material.
export function surface(options: SurfaceOptions | string) {
  const o = typeof options === "string" ? { color: options } : options;
  const key = [
    o.color,
    o.roughness ?? 0.85,
    o.metalness ?? 0,
    o.map?.uuid ?? "",
    o.emissive ?? "",
    o.emissiveIntensity ?? 0,
    o.transparent ? o.opacity ?? 1 : "",
    o.side ?? "",
    o.alphaTest ?? "",
    o.flat ? 1 : 0,
  ].join("|");
  let material = surfaces.get(key);
  if (!material) {
    material = new MeshStandardMaterial({
      color: o.color,
      roughness: o.roughness ?? 0.85,
      metalness: o.metalness ?? 0,
      map: o.map ?? null,
      emissive: o.emissive ?? "#000000",
      emissiveIntensity: o.emissive ? o.emissiveIntensity ?? 1 : 0,
      transparent: !!o.transparent,
      opacity: o.opacity ?? 1,
      alphaTest: o.alphaTest ?? 0,
      flatShading: !!o.flat,
    });
    if (o.side !== undefined) material.side = o.side;
    surfaces.set(key, material);
  }
  return material;
}

// Warna HDR (>1) tanpa tone mapping: hanya objek ini yang tertangkap bloom.
export function glow(color: string, intensity = 3, side?: Side) {
  const key = `${color}|${intensity}|${side ?? ""}`;
  let material = glows.get(key);
  if (!material) {
    material = new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(intensity),
      toneMapped: false,
    });
    if (side !== undefined) material.side = side;
    glows.set(key, material);
  }
  return material;
}

export const doubleSide = DoubleSide;

// Box dengan UV dalam satuan dunia: tekstur ubin/papan tidak meregang
// walau material yang sama dipakai untuk ukuran berbeda.
export function box(size: Vec3, tile?: number) {
  const key = `${size.join(",")}|${tile ?? ""}`;
  let geometry = boxes.get(key);
  if (!geometry) {
    geometry = new BoxGeometry(...size);
    if (tile) {
      const [w, h, d] = size;
      const spans: [number, number][] = [
        [d, h],
        [d, h],
        [w, d],
        [w, d],
        [w, h],
        [w, h],
      ];
      const uv = geometry.attributes.uv;
      for (let face = 0; face < 6; face++)
        for (let v = 0; v < 4; v++) {
          const i = face * 4 + v;
          uv.setXY(
            i,
            (uv.getX(i) * spans[face][0]) / tile,
            (uv.getY(i) * spans[face][1]) / tile,
          );
        }
      uv.needsUpdate = true;
    }
    boxes.set(key, geometry);
  }
  return geometry;
}
