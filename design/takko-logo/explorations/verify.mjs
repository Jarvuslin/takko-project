import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { XMLValidator } from 'fast-xml-parser'
const dir=path.dirname(fileURLToPath(import.meta.url))
const require=createRequire(import.meta.url)
const sharp=require('C:/Users/7474g/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const catalog=JSON.parse(await fs.readFile(path.join(dir,'catalog.json'),'utf8'))
for(const item of catalog) test(`${item.name}: standalone vector and transparent PNG export`,async()=>{
 const svg=await fs.readFile(path.join(dir,item.id+'.svg'),'utf8')
 assert.equal(XMLValidator.validate(svg),true)
 assert.doesNotMatch(svg,/<script|<image|href=|url\(/i)
 const raster=await sharp(Buffer.from(svg)).resize(512,512).ensureAlpha().raw().toBuffer({resolveWithObject:true})
 const png=await sharp(path.join(dir,item.id+'.png')).ensureAlpha().raw().toBuffer()
 assert.deepEqual(png,raster.data)
 let painted=0
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const alpha=png[(y*512+x)*4+3]
  if(alpha>0)painted++
  if(x===0||x===511||y===0||y===511)assert.equal(alpha,0,'Artwork must not clip at the export edge')
 }
 assert.ok(painted>20000,'Export contains substantial visible artwork')
})
test('comparison board includes six named directions and renders at the intended dimensions',async()=>{
 assert.equal(catalog.length,6)
 const svg=await fs.readFile(path.join(dir,'takko-logo-directions.svg'),'utf8')
 assert.equal(XMLValidator.validate(svg),true)
 for(const item of catalog)assert.ok(svg.includes(`id="${item.id}"`))
 const meta=await sharp(path.join(dir,'takko-logo-directions.png')).metadata()
 assert.equal(meta.width,1440)
 assert.equal(meta.height,1200)
})
