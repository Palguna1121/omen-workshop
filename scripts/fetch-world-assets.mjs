// Unduh ulang kit Kenney (CC0) yang menjadi sumber props dunia ke .cache/world-assets.
// Setelah itu: npm run build:kit (Blender headless + optimasi) → public/models/world/kit.glb.
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cache = path.join(root, ".cache/world-assets");
const kits = ["furniture-kit", "nature-kit", "fantasy-town-kit", "survival-kit"];

await mkdir(path.join(cache, "zips"), { recursive: true });
for (const kit of kits) {
  const page = await (await fetch(`https://kenney.nl/assets/${kit}`)).text();
  const match = page.match(
    new RegExp(`https://kenney\\.nl/media/pages/assets/${kit}/[^'"]+\\.zip`),
  );
  if (!match) throw new Error(`Tautan unduhan ${kit} tidak ditemukan`);
  const zip = path.join(cache, "zips", `${kit}.zip`);
  const data = Buffer.from(await (await fetch(match[0])).arrayBuffer());
  await writeFile(zip, data);
  const target = path.join(cache, "src", kit);
  await mkdir(target, { recursive: true });
  execFileSync("unzip", ["-qo", zip, "-d", target]);
  console.log(`${kit}: ${data.length} byte → ${path.relative(root, target)}`);
}
