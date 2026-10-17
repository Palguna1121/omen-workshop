import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve('assets-src/omen');
const source = process.argv[2] ? path.resolve(process.argv[2]) : null;
function files(dir, base = dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(path.join(dir,entry.name),base) : [path.relative(base,path.join(dir,entry.name))]).sort();
}
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const inventory = files(root).map(file => {
  const buffer = fs.readFileSync(path.join(root,file));
  const item = {file, bytes:buffer.length, sha256:hash(buffer)};
  if (file.endsWith('.glb')) {
    if (buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2 || buffer.readUInt32LE(8) !== buffer.length) throw new Error(`GLB header invalid: ${file}`);
    const gltf = JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
    item.animations = (gltf.animations || []).map(animation=>animation.name);
    item.animationClips = (gltf.animations || []).map(animation => ({
      name: animation.name,
      duration: Math.max(...animation.samplers.map(sampler => gltf.accessors[sampler.input].max?.[0] || 0)),
      channels: animation.channels.length,
    }));
    item.meshes = gltf.meshes?.length || 0;
    item.skins = gltf.skins?.length || 0;
    item.externalUris = [...(gltf.buffers || []),...(gltf.images || [])].filter(entry => entry.uri && !entry.uri.startsWith('data:')).map(entry=>entry.uri);
    for (const uri of item.externalUris) if (!fs.existsSync(path.resolve(root,path.dirname(file),decodeURIComponent(uri)))) throw new Error(`Missing dependency: ${uri}`);
  }
  if (source && hash(fs.readFileSync(path.join(source,file))) !== item.sha256) throw new Error(`Copy differs: ${file}`);
  return item;
});
if (source && JSON.stringify(files(source)) !== JSON.stringify(files(root))) throw new Error('Source and destination inventories differ');
const report = {entry:'/models/omen-character.glb',files:inventory.length,totalBytes:inventory.reduce((sum,item)=>sum+item.bytes,0),copyVerifiedAgainst:source,inventory};
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/model-inventory.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({entry:report.entry,files:report.files,totalBytes:report.totalBytes,copyVerified:!!source,models:inventory.filter(item=>item.animations)},null,2));
