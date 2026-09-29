import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import {fileURLToPath} from 'node:url'
import {XMLValidator} from 'fast-xml-parser'

const root=path.dirname(fileURLToPath(import.meta.url))
const read=name=>fs.readFileSync(path.join(root,name),'utf8')
const data=JSON.parse(read('scene.json'))
test('all 25 SVG deliverables are valid, self-contained XML',()=>{
 const files=[...fs.readdirSync(path.join(root,'assets')).map(n=>'assets/'+n),'screen-1.svg','screen-2.svg','screen-3.svg']
 assert.equal(files.length,25)
 for(const name of files){const svg=read(name);assert.equal(XMLValidator.validate(svg),true,name);assert.doesNotMatch(svg,/<script|<foreignObject|(?:href|src)="https?:/i,name)}
})
test('all shapes and artwork fit their screen boundaries',()=>{
 for(const screen of data.screens)for(const n of screen.children.filter(n=>n.type!=='text')){
  assert.ok(n.x>=0&&n.y>=0,n.name)
  assert.ok(n.x+n.w<=screen.w&&n.y+n.h<=screen.h,n.name)
 }
})
test('project mockup distinguishes compilation from native verification',()=>{
 const text=data.screens[1].children.filter(n=>n.type==='text').map(n=>n.text).join('\n')
 assert.match(text,/Source compiled/)
 assert.match(text,/Native gameplay test/)
 assert.match(text,/Not run yet/)
 assert.match(text,/Gameplay has not been verified/)
})
test('primary and secondary text meet normal-text contrast on raised surfaces',()=>{
 const lum=hex=>{const c=hex.match(/[\da-f]{2}/gi).map(h=>parseInt(h,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722}
 for(const tone of ['text','muted'])assert.ok((lum(data.colors[tone])+.05)/(lum(data.colors.raised)+.05)>=4.5,tone)
})
test('Figma import package is syntactically valid and declares no network access',()=>{
 new vm.Script(read('figma-plugin.js'))
 const manifest=JSON.parse(read('manifest.json'))
 assert.deepEqual(manifest.networkAccess.allowedDomains,['none'])
 assert.ok(fs.existsSync(path.join(root,manifest.main)))
})
test('preview links cover all three downloadable screens',()=>{
 const html=read('index.html')
 for(let i=1;i<=3;i++){assert.match(html,new RegExp('data-screen="'+i+'"'));assert.ok(fs.existsSync(path.join(root,`screen-${i}.svg`)))}
 assert.match(html,/Design mockup only/)
})
