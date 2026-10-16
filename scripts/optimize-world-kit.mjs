// Optimasi kit props hasil Blender untuk web.
// Input : .cache/world-assets/kit-raw.glb (scripts/blender/build-world-kit.py)
// Output: public/models/world/kit.glb
// Tidak menggabungkan node antar-prop: setiap prop tetap satu node bernama
// agar runtime dapat membuat InstancedMesh per prop.
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import {
  dedup,
  prune,
  quantize,
  reorder,
  weld,
} from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const root = path.resolve(import.meta.dirname, "..");
const input = path.join(root, ".cache/world-assets/kit-raw.glb");
const output = path.join(root, "public/models/world/kit.glb");

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });

const document = await io.read(input);
await document.transform(
  dedup(),
  prune(),
  weld(),
  reorder({ encoder: MeshoptEncoder }),
  // Posisi tetap float (meter, origin di dasar prop) agar shader angin pada
  // daun memakai tinggi yang konsisten antar bagian mesh. meshopt() bawaan
  // selalu mengkuantisasi posisi, jadi ekstensinya dipasang manual.
  quantize({ pattern: /^(NORMAL|TEXCOORD_\d+)$/ }),
);
document
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await mkdir(path.dirname(output), { recursive: true });
await io.write(output, document);

const names = document
  .getRoot()
  .listNodes()
  .filter((node) => node.getMesh())
  .map((node) => node.getName());
const before = (await stat(input)).size;
const after = (await stat(output)).size;
console.log(`${names.length} prop: ${names.join(", ")}`);
console.log(`${before} → ${after} byte (${Math.round((after / before) * 100)}%)`);
