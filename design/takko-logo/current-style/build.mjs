import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const dir=path.dirname(fileURLToPath(import.meta.url))
const require=createRequire(import.meta.url)
const sharp=require('C:/Users/7474g/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const original=await fs.readFile(path.join(dir,'../../../public/takko.svg'),'utf8')
const base=original.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'').replace(/<title>[\s\S]*?<\/title>|<!--[\s\S]*?-->/g,'')
const eyes='<path d="M30 45v4m20-4v4" stroke="#463328" stroke-width="4.5" stroke-linecap="round"/>'
const smile='<path d="M36 53c2 4 6 4 8 0" stroke="#463328" stroke-width="2.8" stroke-linecap="round"/>'
const line=d=>`<path d="${d}" stroke="#463328" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/>`
const wrap=(b,w=80,h=80)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${b}</svg>`
const variants=[
 {id:'01-chubby',name:'Chubby',tag:'ROUNDER + SQUISHIER',desc:'A wider shell and a bigger, softer face.',body:`<g transform="translate(-2 5) scale(1.05 .94)">${base.replace(eyes,'<circle cx="30" cy="46" r="3.5" fill="#463328"/><circle cx="50" cy="46" r="3.5" fill="#463328"/>').replace(smile,line('M35 53q5 8 10 0'))}</g>`},
 {id:'02-tallboy',name:'Tallboy',tag:'SMALL + CURIOUS',desc:'A taller silhouette with an attentive little face.',body:`<g transform="translate(6 -2) scale(.85 1.08)">${base.replace(smile,'<ellipse cx="40" cy="55" rx="2.7" ry="3.2" fill="#463328"/>')}</g>`},
 {id:'03-wink',name:'Wink',tag:'CHEEKY + CONFIDENT',desc:'A playful tilt and one very knowing wink.',body:`<g transform="rotate(-11 40 40) translate(2 2) scale(.95)">${base.replace(eyes,line('M30 44v5m17-5 6 3-6 2')).replace(smile,'<path d="M35 53q6 10 12-2" fill="#463328"/>')}</g>`},
 {id:'04-big-grin',name:'Big grin',tag:'BRIGHT + EXCITED',desc:'A happy little cheerleader for your next idea.',body:base.replace(eyes,line('M26 48q4-7 8 0m12 0q4-7 8 0')).replace(smile,'<path d="M34 53h12c0 5-3 8-6 8s-6-3-6-8Z" fill="#463328"/><path d="M36 58q4-3 8 0-4 5-8 0Z" fill="#ED9271"/>')},
 {id:'05-cozy',name:'Cozy',tag:'CALM + CONTENT',desc:'Soft sleepy eyes and a tiny satisfied smile.',body:`<g transform="rotate(6 40 40)">${base.replace(eyes,line('M26 46q4 5 8 0m12 0q4 5 8 0')).replace(smile,line('M37 55q3 3 6 0'))}</g>`},
 {id:'06-sidekick',name:'Sidekick',tag:'LOOKING AHEAD',desc:'An angled shell with a face that peeks to the side.',body:base.replace('M9 58c0-22 13-36 31-36s31 14 31 36c0 5-3 8-8 8H17c-5 0-8-3-8-8Z','M9 58c0-22 16-37 37-36 17 1 26 16 25 36 0 5-3 8-8 8H17c-5 0-8-3-8-8Z').replace(eyes,line('M38 43v5m18-3v5')).replace(smile,line('M44 54q5 6 9-1')).replace('cx="24"','cx="30"').replace('cx="56"','cx="62"')},
]
await fs.mkdir(dir,{recursive:true})
for(const v of variants){
 await fs.writeFile(path.join(dir,v.id+'.svg'),wrap(v.body))
 await sharp(Buffer.from(wrap(v.body))).resize(512,512).png().toFile(path.join(dir,v.id+'.png'))
}
const text=(x,y,s,size=14,color='#ABA9A3',weight=400)=>`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" fill="${color}" font-weight="${weight}">${s}</text>`
const rect=(x,y,w,h,c,rad=0,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" rx="${rad}" stroke="${stroke}"/>`
const icon=(body,x,y,size)=>`<g transform="translate(${x} ${y}) scale(${size/80})">${body}</g>`
let board=rect(0,0,1440,1200,'#111111')+text(48,48,'TAKKO / CURRENT STYLE / ROUND 02',12,'#F7C96B',600)+text(48,103,'Same taco. More character.',42,'#F4F0E8',600)+text(48,138,'The same warm palette, chunky outlines and rosy cheeks. Six new shapes and expressions.',16)
board+=rect(1180,26,212,128,'#22221F',14)+icon(base,1194,36,88)+text(1290,73,'CURRENT',11,'#F7C96B',600)+text(1290,95,'Style anchor',12)
for(let i=0;i<variants.length;i++){
 const v=variants[i],x=48+(i%3)*456,y=184+Math.floor(i/3)*398
 let c=rect(0,0,432,374,'#1B1B1A',20,'#34322E')+text(24,33,`${i+1 < 10 ? '0' : ''}${i+1} / ${v.tag}`,11,'#D2B985',600)
 c+=rect(24,54,384,174,'#252824',12)+icon(v.body,130,55,172)
 c+=text(24,258,v.name,23,'#F4F0E8',600)+text(24,282,v.desc,13)
 c+=rect(24,303,232,50,'#111111',10)+icon(v.body,32,309,38)+text(80,337,'takko',25,'#F4F0E8',600)+text(176,333,'IN THE APP',9,'#85867E')
 c+=rect(270,303,138,50,'#F3EFE6',10)+icon(v.body,280,312,32)+icon(v.body,326,316,24)+icon(v.body,370,320,16)
 board+=`<g id="${v.id}" transform="translate(${x} ${y})">${c}</g>`
}
board+=rect(48,1004,1344,140,'#24221D',16)+text(72,1037,'MY PICKS',11,'#F7C96B',600)+text(72,1070,'01 Chubby',24,'#F4F0E8',600)+text(72,1097,'Closest to the current logo, with a softer silhouette.',14)+text(610,1070,'03 Wink',24,'#F4F0E8',600)+text(610,1097,'A little more personality for the same familiar taco.',14)+icon(variants[0].body,1194,1028,76)+icon(variants[2].body,1280,1028,76)
board+=text(48,1174,'Golden shell #F7C96B / toasted outline #593C29 / lettuce #8FCB83 / blush #ED9271. Current app artwork stays unchanged.',12,'#83847D')
await fs.writeFile(path.join(dir,'takko-current-style.svg'),wrap(board,1440,1200))
await sharp(Buffer.from(wrap(board,1440,1200))).png().toFile(path.join(dir,'takko-current-style.png'))
await fs.writeFile(path.join(dir,'catalog.json'),JSON.stringify(variants.map(({body,...rest})=>rest),null,2))
console.log('Built six variations of the current mascot and a comparison board.')
