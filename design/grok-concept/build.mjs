import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const out = name => path.join(root, name)
fs.mkdirSync(out('assets'), {recursive:true})
const colors = {bg:'#111111',sidebar:'#161616',surface:'#1d1d1d',raised:'#252525',line:'#333333',text:'#f4f4f4',muted:'#a7a7a7',faint:'#777777',accent:'#b8dfff',green:'#b7d8bd'}
const paths = {
  plus:'M12 5v14M5 12h14',
  search:'M20 20l-4-4M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  cube:'m12 3 9 5v9l-9 5-9-5V8zm0 0v10m-9-5 9 5 9-5m-9 5v9',
  sliders:'M5 3v8m0 4v6M12 3v3m0 4v11M19 3v12m0 4v2M2 11h6M9 6h6M16 15h6',
  arrow:'M12 19V5m-6 6 6-6 6 6',
  chevron:'m8 10 4 4 4-4',
  panel:'M3 4h18v16H3zM9 4v16',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2',
  check:'m5 12 4 4 10-10',
  code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16',
  heart:'M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15z',
  link:'m9 15 6-6M7 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 0 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  close:'m6 6 12 12M6 18 18 6',
  external:'M14 4h6v6m0-6-9 9M9 4H4v16h16v-5',
  play:'m8 4 12 8-12 8z',
  folder:'M3 7V4h6l3 3h9v13H3z',
  bolt:'m13 2-8 12h6l-1 8 9-13h-6z',
}
const iconSvg = (name,color=colors.text) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`
for(const name of Object.keys(paths)) fs.writeFileSync(out(`assets/${name}.svg`),iconSvg(name))
const logo = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M6 9h28v7H23v18h-7V16H6z" fill="#f4f4f4"/><path d="m26 24 8-8v18h-8z" fill="#888888"/></svg>'
fs.writeFileSync(out('assets/takko-mark.svg'), logo)
function art(kind){
 const base='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="190" viewBox="0 0 320 190"><rect width="320" height="190" fill="#202020"/>'
 const grid='<g fill="none" stroke="#363636" stroke-width=".7"><path d="M0 155 160 67l160 88M0 175l160-88 160 88M25 190l135-73 135 73M65 190l95-53 95 53M0 115l160 88 160-88M0 135l160 88 160-88"/></g>'
 const cube=(x,y,w,h)=>`<path d="m${x} ${y} ${w} -${w/2} ${w} ${w/2}-${w} ${w/2}z" fill="#505050" stroke="#ababab"/><path d="m${x} ${y} ${w} ${w/2}v${h}l-${w}-${w/2}z" fill="#2b2b2b" stroke="#777"/><path d="m${x+w} ${y+w/2} ${w}-${w/2}v${h}l-${w} ${w/2}z" fill="#3b3b3b" stroke="#999"/>`
 let content=''
 if(kind==='obby')content=cube(52,132,29,17)+cube(118,102,29,35)+cube(185,68,29,54)+'<path d="M212 51V19l22 7-22 8" fill="none" stroke="#b8dfff" stroke-width="2"/>'
 if(kind==='arena')content='<ellipse cx="160" cy="126" rx="94" ry="42" fill="#2c2c2c" stroke="#909090"/><ellipse cx="160" cy="116" rx="94" ry="42" fill="#383838" stroke="#a7a7a7"/><ellipse cx="160" cy="116" rx="68" ry="28" fill="#232323" stroke="#6e6e6e"/><path d="m115 145 85-88m-48 8 47 46m-83-16 47 46" fill="none" stroke="#b8dfff" stroke-width="3"/><circle cx="160" cy="114" r="5" fill="#b8dfff"/>'
 if(kind==='portal')content='<path d="M102 157V74q0-62 58-62t58 62v83l-19 9V76q0-46-39-46t-39 46v90z" fill="#424242" stroke="#929292"/><path d="M121 158V78q0-44 39-44t39 44v80" fill="#202020" stroke="#b8dfff" stroke-width="2"/><path d="m86 160 74-38 74 38-74 26z" fill="#353535" stroke="#999"/><ellipse cx="160" cy="115" rx="19" ry="30" fill="none" stroke="#7c99ab"/><path d="m57 97 8-15 8 15m-8-15v46m190-28 8-15 8 15m-8-15v44" fill="none" stroke="#777"/>'
 return base+grid+content+'</svg>'
}
for(const n of ['obby','arena','portal'])fs.writeFileSync(out(`assets/${n}.svg`),art(n))

const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')
let serial=0
const node=(type,props)=>({id:`node-${++serial}`,type,...props})
const F=(name,w,h,bg=colors.bg)=>node('frame',{name,w,h,bg,children:[]})
const R=(f,x,y,w,h,fill,r=0,stroke)=>{const n=node('rect',{name:'Surface',x,y,w,h,fill,r,stroke});f.children.push(n);return n}
const T=(f,x,y,text,size=14,color=colors.text,weight=400)=>{const n=node('text',{name:text,text,x,y,size,color,weight,w:Math.max(20,text.length*size*.59),h:Math.round(size*1.4)});f.children.push(n);return n}
const S=(f,x,y,w,h,svg,name)=>{const n=node('svg',{name,x,y,w,h,svg});f.children.push(n);return n}
const I=(f,x,y,name,size=20,color=colors.muted)=>S(f,x,y,size,size,iconSvg(name,color),`Icon / ${name}`)
function pill(f,x,y,w,label,icon){R(f,x,y,w,36,colors.bg,18,colors.line);if(icon)I(f,x+13,y+8,icon,18);T(f,x+(icon?39:15),y+9,label,12,colors.muted)}
function sidebar(f,selected='New game'){
 R(f,0,0,224,960,colors.sidebar)
 S(f,22,25,32,32,logo,'Takko symbol');T(f,66,27,'takko',25,colors.text,600);I(f,180,33,'panel',18)
 R(f,14,88,196,44,selected==='New game'?colors.raised:colors.sidebar,12);I(f,28,100,'plus',20,colors.text);T(f,61,100,'New game',14,colors.text,500)
 I(f,28,155,'search');T(f,61,154,'Search projects',14,colors.muted);T(f,181,156,'⌘ K',10,colors.faint)
 I(f,28,203,'grid');T(f,61,202,'Marketplace',14)
 T(f,28,270,'RECENT',10,colors.faint,500)
 if(selected==='Neon Drift')R(f,14,298,196,42,colors.raised,10)
 T(f,28,311,'Neon Drift',13);T(f,28,355,'Crystal Hollow',13,colors.muted);T(f,28,399,'Cozy Island',13,colors.muted)
 R(f,24,791,176,1,colors.line)
 I(f,28,817,'sliders');T(f,61,817,'Models & budget',13,colors.muted)
 I(f,28,861,'cube');T(f,61,861,'Studio plugin',13,colors.muted)
 R(f,26,913,27,27,colors.raised,14);T(f,33,917,'J',12);T(f,64,917,'Your workspace',12,colors.muted)
}
function top(f,label='New game'){
 T(f,254,31,label,13,colors.muted)
 R(f,1227,22,183,34,colors.sidebar,17,colors.line);R(f,1242,36,6,6,colors.faint,3);T(f,1260,30,'Connect to Studio',12,colors.muted)
}
function composer(f,x,y,w,placeholder='Describe your game. Start with the fun part.'){
 R(f,x,y,w,142,colors.surface,24,'#383838');T(f,x+24,y+23,placeholder,16,colors.muted)
 I(f,x+20,y+98,'plus',22,colors.text)
 pill(f,x+57,y+91,127,'Marketplace','grid')
 T(f,x+w-233,y+103,'Models',12,colors.muted);I(f,x+w-186,y+102,'chevron',16)
 T(f,x+w-155,y+103,'$1.00 cap',12,colors.muted)
 R(f,x+w-56,y+88,40,40,colors.text,20);I(f,x+w-46,y+98,'arrow',20,'#111111')
}
const home=F('01 / New game',1440,960)
sidebar(home);top(home)
S(home,797,188,60,60,logo,'Takko hero mark')
T(home,524,282,'What do you want to build?',38,colors.text,500)
T(home,593,343,'Your next Roblox game starts with an idea.',15,colors.muted)
composer(home,448,397,760)
pill(home,550,564,152,'Build an obby','bolt');pill(home,714,564,153,'Make an arena','play');pill(home,879,564,173,'Create a cozy world','cube')
T(home,448,671,'PICK UP WHERE YOU LEFT OFF',10,colors.faint,500);T(home,1138,668,'View all  →',12,colors.muted)
for(const [i,name,kind,subtitle] of [[0,'Neon Drift','arena','Combat arena · Ready to test'],[1,'Crystal Hollow','portal','Adventure · Planning'],[2,'Cozy Island','obby','Social world · Draft']]){
 const x=448+i*261
 R(home,x,704,238,142,colors.surface,14,colors.line);S(home,x+12,714,90,94,art(kind),`${name} illustration`);T(home,x+112,742,name,14,colors.text,500)
 T(home,x+16,817,subtitle,11,colors.muted)
}
T(home,622,910,'Plan it. Build it. Then test it in Studio.',12,colors.faint)

const project=F('02 / Project + Marketplace',1440,960)
sidebar(project,'Neon Drift');T(project,254,31,'Neon Drift',13,colors.text,500);T(project,341,32,'/  Project',12,colors.faint)
R(project,809,22,187,34,colors.sidebar,17,colors.line);R(project,824,36,6,6,colors.faint,3);T(project,841,30,'Connect to Studio',12,colors.muted)
R(project,224,76,816,1,colors.line)
T(project,262,98,'Conversation',13,colors.text,500);T(project,387,98,'Plan',13,colors.muted);T(project,448,98,'Source',13,colors.muted);T(project,532,98,'Tests',13,colors.muted);R(project,262,129,91,2,colors.text)
R(project,460,170,531,91,colors.raised,18)
T(project,481,192,'Build a fast arena game with a dash move,',15);T(project,481,216,'a shrinking play zone, and short rounds.',15)
S(project,268,301,26,26,logo,'Assistant mark');T(project,309,302,'Takko',14,colors.text,600);T(project,372,304,'Build complete',12,colors.muted)
T(project,309,349,'Your arena is ready for a first playtest.',21,colors.text,500)
T(project,309,391,'The dash, round timer, and shrinking zone are in place.',14,colors.muted)
T(project,309,414,'Next, test movement and multiplayer behavior in Studio.',14,colors.muted)
R(project,309,463,682,155,colors.surface,16,colors.line)
I(project,329,484,'check',19,colors.green);T(project,360,484,'Source compiled',13);T(project,866,484,'Complete',11,colors.muted)
I(project,329,525,'check',19,colors.green);T(project,360,525,'Acceptance scenarios prepared',13);T(project,866,525,'Complete',11,colors.muted)
I(project,329,566,'play',19,colors.accent);T(project,360,566,'Native gameplay test',13);T(project,855,566,'Not run yet',11,colors.accent)
R(project,309,642,161,40,colors.text,20);I(project,326,653,'cube',18,'#111111');T(project,354,652,'Open in Studio',12,'#111111',500)
T(project,492,654,'View source',12,colors.muted);I(project,571,653,'external',16)
T(project,309,709,'Ready to test · Gameplay has not been verified',11,colors.faint)
composer(project,263,773,728,'What would you like to change?')
T(project,535,932,'Example project · Design mockup',10,colors.faint)

R(project,1040,0,400,960,'#181818');R(project,1040,0,1,960,colors.line)
T(project,1064,28,'Marketplace',21,colors.text,500);I(project,1396,31,'close',20)
T(project,1064,68,'Find a reference. Make it your own.',12,colors.muted)
R(project,1064,108,352,44,colors.surface,12,colors.line);I(project,1078,121,'search',18);T(project,1109,121,'Search Creator Store',13,colors.muted)
R(project,1064,171,76,32,colors.raised,16);T(project,1081,179,'Models',12);T(project,1164,179,'Audio',12,colors.muted);T(project,1238,179,'Images',12,colors.muted);I(project,1387,177,'sliders',18)
T(project,1064,229,'Suggestions for your game',12,colors.muted)
for(const [x,y,kind,title,meta] of [[1064,264,'arena','Arena platform','Model · Concept asset'],[1248,264,'obby','Jump platforms','Model · Concept asset'],[1064,471,'portal','Portal arch','Model · Concept asset'],[1248,471,'arena','Round arena','Model · Concept asset']]){
R(project,x,y,168,186,colors.surface,12,colors.line);S(project,x+1,y+1,166,100,art(kind),title+' artwork');T(project,x+12,y+114,title,13,colors.text,500);T(project,x+12,y+141,meta,9,colors.muted);I(project,x+138,y+160,'plus',16)
}
R(project,1064,700,352,103,colors.raised,14);I(project,1080,719,'link',19);T(project,1111,718,'Use an asset link',13,colors.text,500);T(project,1080,751,'Paste a Roblox link into your message.',11,colors.muted);T(project,1080,774,'Assets are inspected before attachment.',11,colors.muted)
T(project,1089,879,'Drag an asset into the conversation',11,colors.muted)
T(project,1087,910,'Illustrative assets, not live catalog results',10,colors.faint)

const kit=F('03 / Icons + visual assets',1440,900)
T(kit,64,49,'Takko / UI essentials',32,colors.text,500);T(kit,64,107,'Original vectors · Consistent 1.6 px strokes · Editable assets',14,colors.muted)
T(kit,64,173,'ICON FAMILY',10,colors.faint,500)
Object.keys(paths).forEach((name,i)=>{const col=i%9,row=Math.floor(i/9),x=64+col*145,y=211+row*109;R(kit,x,y,112,66,colors.surface,12,colors.line);I(kit,x+44,y+20,name,26,colors.text);T(kit,x+8,y+79,name,11,colors.muted)})
T(kit,64,467,'GEOMETRIC GAME ART',10,colors.faint,500)
for(const [i,kind,title] of [[0,'obby','Obby / elevated blocks'],[1,'arena','Arena / competitive play'],[2,'portal','Portal / world building']]){const x=64+i*450;S(kit,x,510,412,245,art(kind),title);T(kit,x,778,title,14,colors.muted)}
T(kit,64,852,'#111111  Canvas     #1D1D1D  Surface     #F4F4F4  Text     #B8DFFF  Accent',12,colors.muted)

const screens=[home,project,kit]
function render(n){
 if(n.type==='text')return `<text x="${n.x}" y="${n.y+n.size}" fill="${n.color}" font-size="${n.size}" font-weight="${n.weight}" font-family="Geist, Inter, Arial, sans-serif">${esc(n.text)}</text>`
 if(n.type==='rect')return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.r}" fill="${n.fill}"${n.stroke?` stroke="${n.stroke}"`:''}/>`
 if(n.type==='svg')return n.svg.replace(/^<svg([^>]*)>/,(_,attributes)=>`<svg${attributes.replace(/\s(width|height)="[^"]*"/g,'')} x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}">`)
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${n.w}" height="${n.h}" viewBox="0 0 ${n.w} ${n.h}"><rect width="100%" height="100%" fill="${n.bg}"/>${n.children.map(render).join('')}</svg>`
}
screens.forEach((screen,i)=>fs.writeFileSync(out(`screen-${i+1}.svg`),render(screen)))
fs.writeFileSync(out('scene.json'),JSON.stringify({colors,screens},null,2))
const plugin=`const data=${JSON.stringify({colors,screens})};
async function main(){
 await figma.loadFontAsync({family:'Inter',style:'Regular'});await figma.loadFontAsync({family:'Inter',style:'Medium'});await figma.loadFontAsync({family:'Inter',style:'Semi Bold'});
 let family='Inter';let semibold='Semi Bold';try{await figma.loadFontAsync({family:'Geist',style:'Regular'});await figma.loadFontAsync({family:'Geist',style:'Medium'});await figma.loadFontAsync({family:'Geist',style:'SemiBold'});family='Geist';semibold='SemiBold';}catch{}
 const color=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});const paints=h=>[{type:'SOLID',color:color(h)}];
 const page=figma.createPage();page.name='Takko · Grok concept';await figma.setCurrentPageAsync(page);
 const collection=figma.variables.createVariableCollection('Takko concept');const tokens=new Map();for(const [name,value] of Object.entries(data.colors)){const v=figma.variables.createVariable(name,collection,'COLOR');v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];v.setValueForMode(collection.defaultModeId,color(value));v.setVariableCodeSyntax('WEB','var(--takko-'+name+')');tokens.set(value,v);}
 function fill(n,h,prop='fills'){let p=paints(h)[0];if(tokens.has(h))p=figma.variables.setBoundVariableForPaint(p,'color',tokens.get(h));n[prop]=[p];}
 const frames=[];for(const [i,s] of data.screens.entries()){const frame=figma.createFrame();frame.name=s.name;frame.resize(s.w,s.h);frame.x=100+i*1540;frame.y=100;fill(frame,s.bg);page.appendChild(frame);frames.push(frame);
 for(const item of s.children){let n;if(item.type==='text'){n=figma.createText();n.fontName={family,style:item.weight===600?semibold:item.weight===500?'Medium':'Regular'};n.fontSize=item.size;n.characters=item.text;n.lineHeight={unit:'PERCENT',value:140};fill(n,item.color);}else if(item.type==='svg'){n=figma.createNodeFromSvg(item.svg);n.resize(item.w,item.h);}else{n=figma.createRectangle();n.resize(item.w,item.h);n.cornerRadius=item.r;fill(n,item.fill);if(item.stroke)fill(n,item.stroke,'strokes');}n.name=item.name;frame.appendChild(n);n.x=item.x;n.y=item.y;}
 }
 const assetPage=figma.createPage();assetPage.name='Takko · Vector assets';await figma.setCurrentPageAsync(assetPage);const svgs=data.screens[2].children.filter(n=>n.type==='svg');for(const [i,item] of svgs.entries()){const v=figma.createNodeFromSvg(item.svg);const c=figma.createComponentFromNode(v);c.name=item.name;c.x=80+(i%6)*220;c.y=80+Math.floor(i/6)*240;c.description='Original Takko concept vector. Adjust colors to match the target surface.';assetPage.appendChild(c);}
 await figma.setCurrentPageAsync(page);figma.currentPage.selection=frames;figma.viewport.scrollAndZoomIntoView(frames);figma.closePlugin('Created 3 Takko boards and '+svgs.length+' reusable vector components.');
}
main().catch(e=>figma.closePlugin(String(e)));
`
fs.writeFileSync(out('figma-plugin.js'),plugin)
fs.writeFileSync(out('manifest.json'),JSON.stringify({name:'Takko Grok concept importer',id:'takko-grok-concept-local',api:'1.0.0',main:'figma-plugin.js',editorType:['figma'],networkAccess:{allowedDomains:['none']}},null,2))
fs.writeFileSync(out('index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Takko · UI concept</title><style>*{box-sizing:border-box}body{margin:0;background:#080808;color:#eee;font-family:Arial,sans-serif}header{height:64px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #292929}header strong{font-size:14px;font-weight:500}nav{display:flex;gap:5px}button,a{border:1px solid #333;border-radius:18px;padding:8px 15px;background:transparent;color:#aaa;font:12px Arial;cursor:pointer;text-decoration:none}button[aria-pressed=true]{background:#eee;color:#111;border-color:#eee}main{max-width:1600px;margin:30px auto;padding:0 24px}img{display:block;width:100%;border:1px solid #282828;border-radius:8px}footer{font-size:12px;color:#888;padding:20px 0;display:flex;justify-content:space-between;gap:20px}p{margin:0}a:hover,button:hover{border-color:#888}@media(max-width:750px){header{height:auto;padding:16px;gap:16px;flex-wrap:wrap}main{padding:0 10px;margin:12px auto}footer{flex-direction:column}}</style><header><strong>takko <span style="color:#777">/ Grok-inspired concept</span></strong><nav aria-label="Design screens"><button aria-pressed="true" data-screen="1">01 New game</button><button aria-pressed="false" data-screen="2">02 Workspace</button><button aria-pressed="false" data-screen="3">03 Assets</button></nav><a href="screen-1.svg" download id="download">Download SVG ↗</a></header><main><img src="screen-1.svg" id="screen" alt="Takko new-game screen, dark monochrome style with central composer and recent projects"><footer><p>Design mockup only. Example projects and catalog artwork.</p><p>Original vector assets · Editable Figma import included</p></footer></main><script>const labels=['New game screen','Project workspace and Marketplace','Original icons and artwork'];document.querySelectorAll('button[data-screen]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const n=b.dataset.screen;document.getElementById('screen').src='screen-'+n+'.svg';document.getElementById('screen').alt=labels[n-1];document.getElementById('download').href='screen-'+n+'.svg';}));</script></html>`)
console.log(JSON.stringify({screens:screens.length,icons:Object.keys(paths).length,artworks:3,logo:1,nodes:screens.reduce((n,s)=>n+s.children.length,0)}))
