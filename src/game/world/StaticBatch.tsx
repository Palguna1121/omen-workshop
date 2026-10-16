import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  BufferGeometry,
  Group,
  Matrix4,
  Mesh,
  type Material,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const keep = new Set(["position", "normal", "uv"]);

/**
 * Menggabungkan mesh statis di dalamnya per material menjadi satu draw call.
 * Anak tetap ditulis sebagai JSX biasa; setelah mount, salinan asli disembunyikan.
 * Jangan taruh lampu, objek beranimasi, atau Html di dalamnya.
 */
export function StaticBatch({
  children,
  castShadow = true,
  receiveShadow = true,
}: {
  children: ReactNode;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const source = useRef<Group>(null);
  const [batches, setBatches] = useState<Mesh[]>([]);
  useLayoutEffect(() => {
    const root = source.current;
    if (!root) return;
    root.updateWorldMatrix(true, true);
    const inverse = new Matrix4().copy(root.matrixWorld).invert();
    const relative = new Matrix4();
    const groups = new Map<Material, BufferGeometry[]>();
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh || Array.isArray(mesh.material)) return;
      const geometry = mesh.geometry.index
        ? mesh.geometry.toNonIndexed()
        : mesh.geometry.clone();
      for (const name of Object.keys(geometry.attributes))
        if (!keep.has(name)) geometry.deleteAttribute(name);
      if (!geometry.attributes.uv) {
        geometry.dispose();
        return;
      }
      geometry.morphAttributes = {};
      relative.multiplyMatrices(inverse, mesh.matrixWorld);
      geometry.applyMatrix4(relative);
      const list = groups.get(mesh.material) ?? [];
      list.push(geometry);
      groups.set(mesh.material, list);
    });
    const merged: Mesh[] = [];
    for (const [material, geometries] of groups) {
      const geometry = mergeGeometries(geometries, false);
      geometries.forEach((g) => g.dispose());
      if (!geometry) continue;
      geometry.computeBoundingSphere();
      const mesh = new Mesh(geometry, material);
      // Material glow (tanpa tone mapping) adalah sumber cahaya: tidak membuat bayangan.
      const emitter = !material.toneMapped;
      mesh.castShadow = castShadow && !emitter;
      mesh.receiveShadow = receiveShadow && !emitter;
      mesh.matrixAutoUpdate = false;
      merged.push(mesh);
    }
    root.visible = false;
    setBatches(merged);
    return () => {
      merged.forEach((mesh) => mesh.geometry.dispose());
      root.visible = true;
    };
  }, [castShadow, receiveShadow]);
  return (
    <>
      <group ref={source}>{children}</group>
      {batches.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} dispose={null} />
      ))}
    </>
  );
}
