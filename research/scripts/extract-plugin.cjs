// Read-only extractor for string properties in Roblox binary models.
// Format reference: https://github.com/rojo-rbx/rbx-dom/blob/master/docs/binary.md
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const input = process.argv[2];
const out = process.argv[3];
const file = fs.readFileSync(input);
function lz4(src, size) {
  const dst = Buffer.alloc(size); let s = 0, d = 0;
  while (s < src.length) {
    const token = src[s++]; let lit = token >> 4;
    if (lit === 15) { let n; do { n = src[s++]; lit += n; } while (n === 255); }
    if (s + lit > src.length || d + lit > size) throw Error('Invalid literals');
    src.copy(dst, d, s, s + lit); s += lit; d += lit;
    if (s === src.length) break;
    const offset = src.readUInt16LE(s); s += 2;
    let len = (token & 15) + 4;
    if ((token & 15) === 15) { let n; do { n = src[s++]; len += n; } while (n === 255); }
    if (!offset || offset > d || d + len > size) throw Error('Invalid match');
    for (let i = 0; i < len; i++) { dst[d] = dst[d-offset]; d++; }
  }
  if (d !== size) throw Error('Decoded size mismatch');
  return dst;
}
function reader(b) {
  let p=0;
  return {u32(){const v=b.readUInt32LE(p);p+=4;return v;},u8(){return b[p++];},str(){const n=b.readUInt32LE(p);p+=4;const s=b.toString('utf8',p,p+n);p+=n;return s;},refs(n){let prev=0;const a=[];for(let i=0;i<n;i++){let v=0;for(let j=0;j<4;j++)v=(v*256+b[p+j*n+i])>>>0;const delta=(v>>>1)^-(v&1);prev+=delta;a.push(prev);}p+=4*n;return a;}};
}
const classes=new Map(), objects=new Map(), chunks=[];
let parents;
for(let p=32;p<file.length;) {
  const tag=file.toString('ascii',p,p+4).replace(/\0/g,'');
  const compressed=file.readUInt32LE(p+4), size=file.readUInt32LE(p+8);
  const raw=file.subarray(p+16,p+16+(compressed||size));
  const b=!compressed?raw:raw.readUInt32LE(0)===0xfd2fb528?zlib.zstdDecompressSync(raw):lz4(raw,size);
  if(b.length!==size) throw Error('Size mismatch');
  chunks.push({tag,offset:p,compressed,size});p+=16+(compressed||size);
  const r=reader(b);
  if(tag==='INST') {const id=r.u32(), name=r.str(), format=r.u8(), count=r.u32(), refs=r.refs(count);classes.set(id,{name,count,refs});for(const ref of refs)objects.set(ref,{ref,className:name,properties:{}});}
  if(tag==='PROP') {const id=r.u32(), name=r.str(), type=r.u8();if(type===1){const c=classes.get(id);for(const ref of c.refs)objects.get(ref).properties[name]=r.str();}}
  if(tag==='PRNT'){r.u8();const n=r.u32();parents={children:r.refs(n),parents:r.refs(n)};}
}
if(parents)parents.children.forEach((ref,i)=>objects.get(ref).parent=parents.parents[i]);
function objPath(o,seen=new Set()){if(seen.has(o.ref))throw Error('Parent cycle');seen.add(o.ref);const parent=objects.get(o.parent);return (parent?objPath(parent,seen)+'/':'')+(o.properties.Name||o.className);}
fs.mkdirSync(out,{recursive:true});
const scripts=[];
for(const o of objects.values())if(o.properties.Source!==undefined){const name=String(o.ref).padStart(3,'0')+'-'+(o.properties.Name||o.className).replace(/[^a-zA-Z0-9._-]/g,'_')+'.luau';const source=o.properties.Source;fs.writeFileSync(path.join(out,name),source);scripts.push({ref:o.ref,name:o.properties.Name,className:o.className,path:objPath(o),file:name,bytes:Buffer.byteLength(source),lines:source.split('\n').length,sha256:crypto.createHash('sha256').update(source).digest('hex')});}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({input,sha256:crypto.createHash('sha256').update(file).digest('hex'),classes:[...classes],objectCount:objects.size,chunks,scripts},null,2));
console.log(JSON.stringify({objectCount:objects.size,scripts:scripts.length,sourceBytes:scripts.reduce((n,s)=>n+s.bytes,0),largest:[...scripts].sort((a,b)=>b.bytes-a.bytes).slice(0,20)},null,2));
