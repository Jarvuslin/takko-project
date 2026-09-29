import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const dir = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const sharp = require('C:/Users/7474g/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const wrap = (body, w=80, h=80) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${body}</svg>`
const eye = (x,y,r=2.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#292421"/>`
const smile = `<path d="M35 50q5 6 10 0" stroke="#292421" stroke-width="2.8" stroke-linecap="round"/>`
const variants = [
 {id:'01-mochi', name:'Mochi', tag:'THE FRIENDLY DEFAULT', desc:'A soft little companion for making big things.', note:'Mascot warmth / reduced shapes', bg:'#262923', accent:'#F8CD7C', body:`<path d="M11 47c-2-8 3-14 9-13-2-10 6-16 13-12 4-9 15-8 18 0 10-3 17 4 15 12 7 0 9 8 5 14Z" fill="#91B88A"/><path d="M8 56C8 35 21 24 40 24s32 11 32 32c0 8-7 11-15 11H23C15 67 8 64 8 56Z" fill="#F8CD7C"/>${eye(30,44)}${eye(50,44)}${smile}<ellipse cx="22" cy="51" rx="4" ry="2.5" fill="#E89D82"/><ellipse cx="58" cy="51" rx="4" ry="2.5" fill="#E89D82"/>`},
 {id:'02-fold', name:'Fold', tag:'THE STARTUP SYMBOL', desc:'A taco reduced to two confident folded forms.', note:'Geometric economy / strong silhouette', bg:'#29231F', accent:'#FCA86C', body:`<path d="M8 55c0-24 14-39 34-39 16 0 27 10 31 24L8 63Z" fill="#FCA86C"/><path d="m10 68 63-23v17c0 5-3 8-8 8H14Z" fill="#FFE1A0"/>`},
 {id:'03-peek', name:'Peek', tag:'THE QUIET ASSISTANT', desc:'Just a shell and two eyes. Small, calm, curious.', note:'Monochrome clarity / expressive eyes', bg:'#252529', accent:'#F3EBDD', body:`<path d="M11 58c0-24 12-39 29-39s29 15 29 39c0 4-3 7-7 7H18c-4 0-7-3-7-7Z" fill="#F3EBDD"/><path d="M17 30c3-7 8-9 13-8 5-7 14-7 20-2 7-1 12 3 14 8" stroke="#F3EBDD" stroke-width="5" stroke-linecap="round"/><path d="M30 43v7m20-7v7" stroke="#292421" stroke-width="4.8" stroke-linecap="round"/>`},
 {id:'04-sprout', name:'Sprout', tag:'THE LITTLE CREATOR', desc:'An idea taking shape, with a leaf on top.', note:'Organic assistant cues / gentle asymmetry', bg:'#24302E', accent:'#A9D9BD', body:`<path d="M38 24c-1-12 7-17 17-14-1 9-7 15-17 14Z" fill="#A9D9BD"/><path d="M36 26c-8-1-14-6-13-14 10 0 16 5 13 14Z" fill="#719A83"/><path d="M9 56c0-18 13-30 30-30s32 10 32 30c0 7-6 11-14 11H24C15 67 9 64 9 56Z" fill="#E8EDD7"/>${eye(29,46)}${eye(49,46)}<path d="M37 54q4 3 8-1" stroke="#292421" stroke-width="2.5" stroke-linecap="round"/>`},
 {id:'05-byte', name:'Byte', tag:'THE GAME MAKER', desc:'A pocket-sized taco from a world you built.', note:'Pixel grammar / playful builder identity', bg:'#29271D', accent:'#F2D16B', body:`<path d="M10 38V26h12V18h12V10h12v8h12v8h12v12Z" fill="#93B981"/><path d="M10 42h8V30h12V22h20v8h12v12h8v22H10Z" fill="#F2D16B"/><path d="M26 40h6v8h-6zm22 0h6v8h-6zM34 54h12v5H34Z" fill="#292421"/><path d="M10 60h60v7H10Z" fill="#D9A84C"/>`},
 {id:'06-amigo', name:'Amigo', tag:'THE STICKER PAL', desc:'A cheeky wink, a bold outline, a little attitude.', note:'Character branding / collectible sticker feel', bg:'#332522', accent:'#F3AB84', body:`<g transform="rotate(-9 40 42)"><path d="M12 44c-4-6 0-12 5-12-1-7 6-12 12-9 3-8 14-9 19-3 8-2 15 4 13 10 9 0 13 8 8 14Z" fill="#A6BE8A" stroke="#302824" stroke-width="3.5"/><path d="M8 58c0-23 14-35 32-35s32 12 32 35c0 5-4 8-9 8H17c-5 0-9-3-9-8Z" fill="#FFD188" stroke="#302824" stroke-width="3.5"/>${eye(29,44,3.3)}<path d="m47 43 6 3-6 2" stroke="#302824" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 52q5 9 12-1" fill="#302824"/><ellipse cx="21" cy="52" rx="4" ry="2.5" fill="#ED9678"/><ellipse cx="59" cy="52" rx="4" ry="2.5" fill="#ED9678"/></g>`},
]
await fs.mkdir(dir,{recursive:true})
for (const v of variants) {
 await fs.writeFile(path.join(dir,v.id+'.svg'),wrap(v.body))
 await sharp(Buffer.from(wrap(v.body))).resize(512,512).png().toFile(path.join(dir,v.id+'.png'))
}
const t=(x,y,txt,size=14,color='#AFAEA8',weight=400)=>`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${txt}</text>`
const r=(x,y,w,h,fill,rad=0,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${fill}" stroke="${stroke}"/>`
const icon=(v,x,y,size)=>`<g transform="translate(${x} ${y}) scale(${size/80})">${v.body}</g>`
let board=r(0,0,1440,1200,'#111111')+t(48,50,'TAKKO / IDENTITY EXPLORATIONS',12,'#E4BD7C',600)+t(48,104,'A little taco. A lot of personality.',40,'#F3F1EA',600)+t(48,138,'Six original directions for a playful creation assistant. Each shown as a mark, wordmark and small app icon.',16)
for(let i=0;i<variants.length;i++) {
 const v=variants[i],x=48+(i%3)*456,y=178+Math.floor(i/3)*408
 let c=r(0,0,432,384,'#1A1A1A',20,'#30302D')+t(24,33,`${String(i+1).padStart(2,'0')} / ${v.tag}`,11,v.accent,600)
 c+=r(24,54,384,182,v.bg,12)+icon(v,38,65,154)+t(203,148,'takko',45,'#F7F2E9',600)+t(205,172,v.name.toLowerCase(),12,v.accent)
 c+=t(24,265,v.name,22,'#F3F1EA',600)+t(24,289,v.desc,13)+t(24,309,v.note,11,'#85867F')
 c+=r(24,329,164,38,'#111',9)+icon(v,32,335,24)+icon(v,74,333,28)+icon(v,122,332,32)
 const light = i===2 ? {...v,body:v.body.replaceAll('#292421','#F3EFE6').replaceAll('#F3EBDD','#292421')} : v
 c+=r(204,329,92,38,'#F3EFE6',9)+icon(light,222,332,32)+icon(light,267,340,16)+t(312,354,'24 / 28 / 32 / 16',10,'#85867F')
 board+=`<g id="${v.id}" transform="translate(${x} ${y})">${c}</g>`
}
board+=r(48,1014,1344,132,'#20201D',16)+t(72,1046,'MY SHORTLIST',11,'#E4BD7C',600)+t(72,1078,'01 Mochi',24,'#F3F1EA',600)+t(72,1106,'Best balance of cute, simple and recognizable.',14)+t(590,1078,'03 Peek',24,'#F3F1EA',600)+t(590,1106,'Best if you want to keep the interface quieter.',14)+icon(variants[0],1190,1040,76)+icon(variants[2],1284,1040,76)
board+=t(48,1176,'Study cues: Linear + Raycast / economy; Discord / character; Claude / warmth. Original Takko shapes throughout.',12,'#81827B')
await fs.writeFile(path.join(dir,'takko-logo-directions.svg'),wrap(board,1440,1200))
await sharp(Buffer.from(wrap(board,1440,1200))).png().toFile(path.join(dir,'takko-logo-directions.png'))
await fs.writeFile(path.join(dir,'catalog.json'),JSON.stringify(variants.map(({body,...rest})=>rest),null,2))
console.log('Built six original vector logos, six PNGs and the comparison board.')
