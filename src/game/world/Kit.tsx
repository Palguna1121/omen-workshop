import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  BufferGeometry,
  Euler,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import { useGameStore } from "@/store/gameStore";
import type { Vec3 } from "../config";

// Kit props: Kenney CC0 yang dikurasi + tanaman kustom dari Blender
// (scripts/blender/build-world-kit.py → scripts/optimize-world-kit.mjs).
export const KIT_URL = "/models/world/kit.glb";

export type KitName =
  | "palm_tall"
  | "palm_bend"
  | "palm_short"
  | "tree_round"
  | "tree_oak"
  | "tree_big"
  | "bush_round"
  | "bush_large"
  | "leafy_low"
  | "plant_flat"
  | "flower_red"
  | "flower_purple"
  | "flower_yellow"
  | "moss"
  | "rock_a"
  | "rock_b"
  | "rock_tall"
  | "barrel"
  | "chest"
  | "crate"
  | "bucket"
  | "anvil"
  | "potted_plant"
  | "plant_small"
  | "plant_small_b"
  | "bear"
  | "speaker"
  | "radio"
  | "books"
  | "box_closed"
  | "box_open"
  | "bookcase"
  | "lamp_floor"
  | "monstera"
  | "banana"
  | "fern"
  | "bougainvillea";

type Part = { geometry: BufferGeometry; material: Material; matrix: Matrix4 };

const SWAYING = /^kit_(leaf|flower|bark)/;
const wind = { value: 0 };
const swayCache = new Map<string, Material>();

/**
 * Daun & batang bergoyang di vertex shader: geser horizontal ∝ (tinggi/tinggi prop)²,
 * fase dari posisi instance agar tiap tanaman tidak bergerak serempak.
 */
function swayMaterial(material: Material, amplitude: number, height: number) {
  const key = `${material.uuid}|${amplitude}|${height.toFixed(2)}`;
  const cached = swayCache.get(key);
  if (cached) return cached;
  const clone = (material as MeshStandardMaterial).clone();
  clone.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = wind;
    shader.uniforms.uSway = { value: amplitude };
    shader.uniforms.uSwayHeight = { value: height };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uWind;\nuniform float uSway;\nuniform float uSwayHeight;",
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec2 swaySeed = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
        #else
          vec2 swaySeed = vec2(0.0);
        #endif
        float swayH = clamp(position.y / uSwayHeight, 0.0, 1.2);
        float swayW = sin(uWind * 1.3 + swaySeed.x * 0.31 + swaySeed.y * 0.17) * 0.65
          + sin(uWind * 2.9 + swaySeed.y * 0.5 + position.x * 1.7) * 0.25;
        transformed.x += swayW * swayH * swayH * uSway;
        transformed.z += swayW * swayH * swayH * uSway * 0.55;`,
      );
  };
  clone.customProgramCacheKey = () => `sway-${amplitude}-${height}`;
  swayCache.set(key, clone);
  return clone;
}

/** Waktu angin global; satu useFrame untuk semua material daun. */
export function Wind() {
  useFrame((_, delta) => {
    if (!useGameStore.getState().reducedMotion) wind.value += Math.min(delta, 0.1);
  });
  return null;
}

export function useKit() {
  const gltf = useGLTF(KIT_URL, false, true);
  return useMemo(() => {
    const parts = new Map<string, Part[]>();
    const heights = new Map<string, number>();
    gltf.scene.updateMatrixWorld(true);
    for (const root of gltf.scene.children) {
      const list: Part[] = [];
      const inverse = new Matrix4().copy(root.matrixWorld).invert();
      let top = 0;
      root.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        const matrix = new Matrix4().multiplyMatrices(inverse, mesh.matrixWorld);
        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox!.clone().applyMatrix4(matrix);
        top = Math.max(top, box.max.y);
        list.push({ geometry: mesh.geometry, material: mesh.material as Material, matrix });
      });
      parts.set(root.name, list);
      heights.set(root.name, top);
    }
    return { parts, heights };
  }, [gltf]);
}

export type KitItem = {
  position: Vec3;
  /** Rotasi Y (radian). */
  rotation?: number;
  /** Skala seragam atau per sumbu. */
  scale?: number | Vec3;
  /** Kemiringan opsional [x, z] (radian) untuk tanaman gantung/miring. */
  tilt?: [number, number];
};

/**
 * Satu InstancedMesh per bagian mesh prop: puluhan tanaman = sedikit draw call.
 * `sway` = simpangan puncak (meter) saat angin; 0 untuk benda mati/indoor.
 */
export function KitInstances({
  name,
  items,
  sway = 0,
  castShadow = true,
  receiveShadow = true,
}: {
  name: KitName;
  items: KitItem[];
  sway?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const { parts, heights } = useKit();
  const list = useMemo(() => parts.get(name) ?? [], [parts, name]);
  const refs = useRef<(InstancedMesh | null)[]>([]);
  const materials = useMemo(
    () =>
      list.map((part) =>
        sway > 0 && SWAYING.test(part.material.name)
          ? swayMaterial(part.material, sway, heights.get(name) || 1)
          : part.material,
      ),
    [list, sway, heights, name],
  );
  useLayoutEffect(() => {
    const m = new Matrix4();
    const q = new Quaternion();
    const e = new Euler();
    const p = new Vector3();
    const s = new Vector3();
    list.forEach((part, k) => {
      const mesh = refs.current[k];
      if (!mesh) return;
      items.forEach((item, i) => {
        e.set(item.tilt?.[0] ?? 0, item.rotation ?? 0, item.tilt?.[1] ?? 0);
        q.setFromEuler(e);
        p.set(...item.position);
        if (Array.isArray(item.scale)) s.set(...item.scale);
        else s.setScalar(item.scale ?? 1);
        m.compose(p, q, s).multiply(part.matrix);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [items, list]);
  return (
    <>
      {list.map((part, k) => (
        <instancedMesh
          key={k}
          ref={(mesh) => {
            refs.current[k] = mesh;
          }}
          args={[part.geometry, materials[k], items.length]}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ))}
    </>
  );
}

useGLTF.preload(KIT_URL, false, true);
