import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sourceDir = path.resolve('assets-src/omen');
const output = path.resolve('public/models/omen-character.glb');
const sources = [];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const align = length => Math.ceil(length / 4) * 4;

function readGlb(file) {
  const bytes = fs.readFileSync(path.join(sourceDir, file));
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error(`Invalid GLB: ${file}`);
  let json, bin;
  for (let offset = 12; offset < bytes.length;) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString());
    if (type === 0x004e4942) bin = chunk;
    offset += 8 + length;
  }
  if (!json || !bin || json.buffers.length !== 1 || json.buffers[0].uri) throw new Error(`Expected embedded GLB buffer: ${file}`);
  sources.push({ file, sha256: hash(bytes) });
  return { json, bin };
}

const base = readGlb('chibi-animation-source.glb');
const json = base.json;
const chunks = [base.bin.subarray(0, json.buffers[0].byteLength)];
let binaryLength = chunks[0].length;
const targetNodes = new Map(json.nodes.map((node, index) => [node.name, index]));

function addClip(file, name) {
  const source = readGlb(file);
  const animation = source.json.animations?.find(clip => clip.name === name);
  if (!animation) throw new Error(`Missing clip ${name}: ${file}`);
  if (json.animations.some(clip => clip.name === name)) throw new Error(`Duplicate clip: ${name}`);
  const views = new Map();
  const accessors = new Map();
  function copyAccessor(index) {
    if (accessors.has(index)) return accessors.get(index);
    const accessor = structuredClone(source.json.accessors[index]);
    if (accessor.sparse || accessor.bufferView === undefined) throw new Error(`Unsupported animation accessor: ${file}`);
    const oldView = accessor.bufferView;
    if (!views.has(oldView)) {
      const view = structuredClone(source.json.bufferViews[oldView]);
      if (view.buffer !== 0) throw new Error(`Unsupported buffer: ${file}`);
      const data = source.bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
      if (data.length !== view.byteLength) throw new Error(`Truncated animation data: ${file}`);
      const padded = align(binaryLength);
      if (padded > binaryLength) chunks.push(Buffer.alloc(padded - binaryLength));
      view.byteOffset = padded;
      binaryLength = padded + data.length;
      chunks.push(data);
      views.set(oldView, json.bufferViews.length);
      json.bufferViews.push(view);
    }
    accessor.bufferView = views.get(oldView);
    accessors.set(index, json.accessors.length);
    json.accessors.push(accessor);
    return accessors.get(index);
  }
  const clip = structuredClone(animation);
  clip.samplers = clip.samplers.map(sampler => ({ ...sampler, input: copyAccessor(sampler.input), output: copyAccessor(sampler.output) }));
  clip.channels = clip.channels.map(channel => {
    const node = source.json.nodes[channel.target.node];
    const target = targetNodes.get(node.name);
    if (target === undefined) throw new Error(`Unmatched bone: ${node.name}`);
    const rest = value => [value.translation || [0, 0, 0], value.rotation || [0, 0, 0, 1], value.scale || [1, 1, 1]];
    if (JSON.stringify(rest(node)) !== JSON.stringify(rest(json.nodes[target]))) throw new Error(`Incompatible bind pose: ${node.name}`);
    return { ...channel, target: { ...channel.target, node: target } };
  });
  json.animations.push(clip);
}

// Copy only animation buffers: the runtime keeps one mesh/texture/skeleton.
addClip('chibi-omen-run.glb', 'run');
addClip('chibi-omen-standing-relax.glb', 'standing_relax');
json.buffers[0].byteLength = binaryLength;
const rawJson = Buffer.from(JSON.stringify(json));
const jsonChunk = Buffer.alloc(align(rawJson.length), 0x20);
rawJson.copy(jsonChunk);
const binChunk = Buffer.alloc(align(binaryLength));
Buffer.concat(chunks).copy(binChunk);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + jsonChunk.length + binChunk.length, 8);
function chunkHeader(length, type) {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(length, 0);
  header.writeUInt32LE(type, 4);
  return header;
}
const bytes = Buffer.concat([header, chunkHeader(jsonChunk.length, 0x4e4f534a), jsonChunk, chunkHeader(binChunk.length, 0x004e4942), binChunk]);
fs.writeFileSync(output, bytes);
const report = { entry: '/models/omen-character.glb', bytes: bytes.length, sha256: hash(bytes), sources, clips: json.animations.map(clip => clip.name) };
fs.writeFileSync('docs/character-runtime.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
