import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const fonts = { display: 'Saira Condensed', body: 'EB Garamond', ui: 'JetBrains Mono' };
const ink = '#F1F0E7';
const text = (value, role = 'ui', size = 12, color = ink, extra = {}) => ({type:'text',name:value.replaceAll('\n',' ').slice(0,70),value,role,size,color,...extra});
const stack = (name, children, extra = {}) => ({type:'frame',name,layout:'column',gap:20,children,...extra});
const row = (name, children, extra = {}) => stack(name,children,{layout:'row',align:'center',...extra});
const at = (node,x,y,w,h) => ({...node,x,y,w,...(h ? {h} : {})});
const button = (label,bg,color,extra={}) => row(label,[text(label,'ui',12,color)],{bg,pad:16,radius:10,justify:'center',...extra});
const line = (w,color) => ({type:'frame',name:'Hairline',w,h:1,bg:color});
const wordmark = (color=ink) => text('F  FORGE','display',28,color,{tracking:4});
const chip = (label,border,color=ink) => button(label,'transparent',color,{border,pad:12,radius:24});
const note = (number,title,desc,color) => row(title,[text(number,'ui',11,color),stack(title,[text(title,'display',20,ink,{tracking:1}),text(desc,'body',18,'#B5BBB5',{w:235})],{gap:6})],{align:'start',gap:18});
const screen=(name,palette,children,description)=>({name,palette,description,type:'frame',w:1440,h:960,bg:palette.canvas,children});

const focus=screen('01 — Focus', {canvas:'#1E2120',surface:'#292D2A',accent:'#E4ED8A',ink},[
 at(stack('Project navigation',[
  wordmark(),button('+  New project','#E4ED8A','#24281C',{w:184}),
  stack('Recent projects',[text('RECENT PROJECTS','ui',10,'#AAB0A8',{tracking:1.5}),text('A fresh start.','body',20,ink),text('Your games will find\na home here.','body',17,'#AAB0A8')],{gap:14}),
 ],{bg:'#181B19',pad:24,gap:42}),0,0,232,960),
 at(stack('Sidebar utility',[line(184,'#394039'),text('↓  Studio plugin','ui',12,'#C1C7BD'),text('⚙  Models & budget','ui',12,'#C1C7BD'),text('LOCAL WORKSPACE','ui',10,'#A5AE9E',{tracking:1})],{gap:24}),24,740,184),
 at(text('YOUR CREATION STUDIO','ui',11,'#AEB6AC',{tracking:1.5}),284,38,400),
 at(button('Connect Studio  ↗','transparent','#CBD1C7',{border:'#465044',pad:12}),1220,24,168),
 at(stack('The idea begins here',[
  text('IDEA   /   PLAN   /   PLAY','ui',11,'#BBC68D',{tracking:2,align:'center'}),
  text('MAKE ROOM FOR\nYOUR NEXT GAME.','display',76,ink,{tracking:3.8,line:1.04,align:'center'}),
  text('Start with a mechanic. We’ll work out the rest together.','body',24,'#BDC5B8',{align:'center'}),
 ],{gap:24,align:'center'}),396,192,812),
 at(stack('Prompt composer',[
  text('What would you love to play?','body',27,ink),
  text('Describe a game, a mechanic, or one thing you want to change.','body',19,'#AEB8A8'),
  row('Composer actions',[button('+  Add reference','transparent','#C3CEBC',{pad:10}),row('Generation controls',[button('Choose model  ⌄','#353C33','#DFE5D8',{pad:12}),button('Create project  ↗','#E4ED8A','#232A19')],{gap:10})],{justify:'between',gap:12,marginTop:26}),
 ],{bg:'#292F28',border:'#667153',radius:22,pad:26,gap:10}),396,463,812),
 at(row('Starter prompts',[text('TRY','ui',10,'#AEB6AC',{tracking:1}),chip('A combat system','#495143'),chip('A farming loop','#495143'),chip('A shop UI','#495143')],{gap:12,justify:'center'}),396,711,812),
 at(text('Describe the idea. Refine the plan. Bring it into Roblox Studio.','body',17,'#A7B09E',{align:'center'}),396,859,812),
], 'Closest to the current product. A quiet charcoal workspace with a citron focal point and familiar project navigation.');

const foundry=screen('02 — Foundry',{canvas:'#292421',surface:'#E9E1D4',accent:'#E2A982',ink:'#F5EDE0'},[
 at(row('Navigation',[wordmark('#F5EDE0'),row('Workspace links',[text('New project','ui',12,'#F5EDE0'),text('Your projects','ui',12,'#BDB0A1')],{gap:32}),button('Models & budget  ↗','transparent','#D2BBA6',{border:'#66564A',pad:13})],{justify:'between'}),64,30,1312),
 at(line(1312,'#51453C'),64,104),
 at(stack('Editorial introduction',[
  text('FROM THE FIRST SPARK','ui',11,'#E2A982',{tracking:2}),
  text('A SMALL IDEA.\nA WHOLE\nWORLD.','display',76,'#F5EDE0',{tracking:3,line:1.03}),
  text('The best games begin with a little curiosity. Tell Forge what’s on your mind.','body',25,'#CCBFAE',{w:430,line:1.4}),
 ],{gap:26}),76,211,460),
 at(stack('Guided process',[line(405,'#655347'),text('A CONVERSATION, THEN A BUILD.','ui',10,'#D8B99D',{tracking:1.3}),text('01  Shape the idea\n02  Make a plan together\n03  Test it in Studio','body',21,'#D2C4B3',{line:1.8})],{gap:16}),76,709,430),
 at(stack('Warm prompt composer',[
  row('Prompt header',[text('NEW PROJECT','ui',10,'#766052',{tracking:1.4}),text('01','ui',11,'#766052')],{justify:'between'}),
  text('What are we making?','display',42,'#302720',{tracking:1.5}),
  text('A place to race with friends, a satisfying farming loop,\nor a mechanic you haven’t seen before…','body',23,'#766A5D',{line:1.5}),
  line(594,'#BCAF9C'),
  row('Creation controls',[button('+  Add reference','transparent','#534438',{pad:8}),button('Choose model  ⌄','transparent','#534438',{pad:8})],{justify:'between'}),
  button('LET’S MAKE A PLAN   ↗','#302720','#F6EADC',{radius:8,pad:19,w:594}),
 ],{bg:'#E9E1D4',radius:16,pad:32,gap:24}),658,203,658),
 at(stack('Prompt suggestions',[
  text('OR START WITH A SMALL EXPERIMENT','ui',10,'#CCAE96',{tracking:1.3}),
  row('Combat suggestion',[text('01','ui',10,'#CF9570'),text('Give every player a signature ability.','body',21,'#EADAC8'),text('↗','ui',18,'#D5A17D')],{justify:'between'}),
  line(658,'#55473B'),
  row('World suggestion',[text('02','ui',10,'#CF9570'),text('Turn a tiny garden into a thriving farm.','body',21,'#EADAC8'),text('↗','ui',18,'#D5A17D')],{justify:'between'}),
 ],{gap:22}),658,726,658),
 at(text('FOR ROBLOX CREATORS','ui',10,'#BFA68F',{tracking:1.5}),76,917,360),
], 'A warmer, more editorial direction. Graphite and copper frame an ivory composer; the split layout gives the serif a deliberate role.');

const grove=screen('03 — Grove',{canvas:'#122E29',surface:'#1B3B33',accent:'#EDE9CB',ink:'#F0EDDA'},[
 at(stack('Compact navigation',[text('F','display',36,'#EEE9CC'),button('+','#EEE9CC','#18362B',{w:44,pad:10,radius:12}),text('⌂','ui',23,'#B4C6AE'),text('☷','ui',23,'#B4C6AE')],{bg:'#0D231F',pad:22,gap:38,align:'center'}),0,0,88,960),
 at(text('FORGE / NEW PROJECT','ui',11,'#C1CDBB',{tracking:1.4}),144,40,600),
 at(button('Connect Studio  ↗','transparent','#C8D3BC',{border:'#44634C',pad:12}),1220,25,168),
 at(stack('World building introduction',[
  text('THERE’S A GAME IN THAT IDEA.','ui',11,'#BCD19E',{tracking:1.8}),
  text('LET’S BUILD SOMETHING\nWORTH PLAYING.','display',70,'#F0EDDA',{tracking:3.2,line:1.06}),
  text('A rough idea is all you need to get started.','body',25,'#C2CFB8'),
 ],{gap:24}),172,187,914),
 at(stack('Conversation approach',[
  text('ROOM TO EXPERIMENT','ui',10,'#AEC99A',{tracking:1.4}),
  text('You bring the idea.\nWe ask the right\nquestions.','body',26,'#E0E7CB',{line:1.5}),
  line(210,'#49674E'),
  text('Refine before you build.\nKeep the creative control.','body',18,'#B1C6A8',{line:1.6}),
 ],{gap:24}),1140,240,226),
 at(stack('Open prompt composer',[
  text('Tell us about your next game…','body',28,'#283D2C'),
  text('Start with how it should feel, or what players should do.','body',20,'#586853'),
  row('Composer controls',[row('Input tools',[button('+  Reference','transparent','#40543B',{pad:10}),button('Choose model  ⌄','transparent','#40543B',{pad:10})],{gap:12}),button('Create project  ↗','#214A32','#F0EDDA',{pad:17,radius:12})],{justify:'between',marginTop:35}),
 ],{bg:'#EDE9CB',radius:24,pad:28,gap:14}),172,470,862),
 at(stack('A few starting points',[
  text('A FEW PLACES TO START','ui',10,'#B8CDA4',{tracking:1.6}),
  row('Mechanic suggestions',[
   stack('Combat prompt',[text('01 / COMBAT','ui',10,'#B4CB9B',{tracking:1}),text('Make every\nmove matter.','display',28,'#E9EDD2',{tracking:1,line:1.2}),text('Build a combat system  ↗','ui',10,'#C4D3B7')],{gap:14,w:260}),
   stack('Progression prompt',[text('02 / PROGRESSION','ui',10,'#B4CB9B',{tracking:1}),text('One seed.\nEndless possibility.','display',28,'#E9EDD2',{tracking:1,line:1.2}),text('Create a farming loop  ↗','ui',10,'#C4D3B7')],{gap:14,w:280}),
   stack('Social prompt',[text('03 / SOCIAL','ui',10,'#B4CB9B',{tracking:1}),text('Better\nwith friends.','display',28,'#E9EDD2',{tracking:1,line:1.2}),text('Design a co-op mechanic  ↗','ui',10,'#C4D3B7')],{gap:14,w:280}),
  ],{gap:22,align:'start'}),
 ],{gap:26}),172,759,896),
], 'An inviting game-making space. Deep pine and pale ivory, an open composer, and mechanic-led prompts with room to explore.');

const designs=[focus,foundry,grove];
fs.writeFileSync(path.join(out,'concepts.json'),JSON.stringify({fonts,designs},null,2));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function render(n){
 const s={};
 if(n.x!==undefined)Object.assign(s,{position:'absolute',left:n.x+'px',top:n.y+'px'});
 if(n.w)s.width=n.w+'px'; if(n.h)s.height=n.h+'px';
 if(n.type==='text')Object.assign(s,{'font-family':`'${fonts[n.role]}'`,'font-size':n.size+'px',color:n.color,'letter-spacing':(n.tracking||0)+'px','line-height':n.line||(n.role==='display'?1.15:1.5),'text-align':n.align||'left','white-space':'pre-line','flex-shrink':0});
 else {Object.assign(s,{background:n.bg||'transparent','border-radius':(n.radius||0)+'px'});if(n.border)s.border='1px solid '+n.border;if(n.pad)s.padding=n.pad+'px';if(n.layout)Object.assign(s,{display:'flex','flex-direction':n.layout,gap:(n.gap||0)+'px','align-items':n.align==='start'?'flex-start':n.align||'stretch','justify-content':n.justify==='between'?'space-between':n.justify||'flex-start'});}
 if(n.marginTop)s['margin-top']=n.marginTop+'px';
 return `<div class="${n.type}" data-name="${esc(n.name)}" style="${Object.entries(s).map(([k,v])=>`${k}:${v}`).join(';')}">${n.type==='text'?esc(n.value):(n.children||[]).map(render).join('')}</div>`;
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Forge — Landing explorations</title><style>
@font-face{font-family:'Saira Condensed';src:url('../../src/web/fonts/saira-condensed-latin.woff2')}@font-face{font-family:'EB Garamond';src:url('../../src/web/fonts/eb-garamond-latin.woff2')}@font-face{font-family:'JetBrains Mono';src:url('../../src/web/fonts/jetbrains-mono-latin.woff2')}
*{box-sizing:border-box}body{margin:0;background:#111512;color:#eee;font-family:'JetBrains Mono';font-weight:400}.intro{max-width:1440px;margin:50px auto 35px}.intro h1{font:400 48px 'Saira Condensed';letter-spacing:3px;margin:0 0 14px}.intro p{font:22px 'EB Garamond';color:#b7c0b2}.concept{width:1440px;margin:0 auto 90px}.caption{display:flex;align-items:baseline;gap:30px;padding:20px 0}.caption h2{font:400 26px 'Saira Condensed';letter-spacing:2px;margin:0}.caption p{font:18px 'EB Garamond';color:#bac2b5;margin:0}.screen{width:1440px;height:960px;position:relative;overflow:hidden}.swatches{display:flex;gap:12px;margin-top:16px;font-size:11px;color:#aeb5a9}.swatch{display:flex;align-items:center;gap:8px}.swatch i{width:16px;height:16px;border-radius:50%;border:1px solid #ffffff25}.solo .intro,.solo .caption,.solo .swatches{display:none}.solo .concept{margin:0}.solo body{margin:0}.solo .screen{border:0}
</style><header class="intro"><h1>FORGE / LANDING EXPLORATIONS</h1><p>Three directions. The same typography. A game starts with a conversation.</p><p style="font:11px 'JetBrains Mono'">DESIGN CONCEPTS ONLY · CURRENT APP UNCHANGED</p></header>${designs.map((d,i)=>`<section class="concept" id="concept-${i+1}"><div class="caption"><h2>${d.name}</h2><p>${d.description}</p></div><div class="screen">${render({...d,x:0,y:0})}</div><div class="swatches">${Object.entries(d.palette).map(([k,c])=>`<span class="swatch"><i style="background:${c}"></i>${k} ${c}</span>`).join('')}</div></section>`).join('')}<script>const pick=new URLSearchParams(location.search).get('concept');if(pick){document.documentElement.classList.add('solo');document.querySelectorAll('.concept').forEach((n,i)=>{if(i+1!==Number(pick))n.remove()})}</script></html>`;
fs.writeFileSync(path.join(out,'index.html'),html);

// Native Figma text and auto-layout containers, not flattened screenshots.
const plugin=`const data=${JSON.stringify({fonts,designs})};
await Promise.all(Object.values(data.fonts).map(family=>figma.loadFontAsync({family,style:'Regular'})));
function paint(hex){return hex&&hex!=='transparent'?[{type:'SOLID',color:{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}}]:[]}
const created=[];
function build(n,parent){
const o=n.type==='text'?figma.createText():figma.createFrame();created.push(o.id);o.name=n.name;parent.appendChild(o);
if(n.type==='text'){o.fontName={family:data.fonts[n.role],style:'Regular'};o.fontSize=n.size;o.characters=n.value;o.fills=paint(n.color);o.letterSpacing={unit:'PIXELS',value:n.tracking||0};o.lineHeight={unit:'PERCENT',value:100*(n.line||(n.role==='display'?1.15:1.5))};o.textAlignHorizontal=(n.align||'left').toUpperCase();o.textAutoResize='HEIGHT';o.resize(n.w||(parent.layoutMode==='VERTICAL'?Math.max(1,parent.width-parent.paddingLeft-parent.paddingRight):Math.max(o.width,1)),o.height);}
else {o.fills=paint(n.bg);o.cornerRadius=n.radius||0;o.clipsContent=false;if(n.border){o.strokes=paint(n.border);o.strokeWeight=1;}if(n.layout){o.layoutMode=n.layout==='row'?'HORIZONTAL':'VERTICAL';o.primaryAxisSizingMode='AUTO';o.counterAxisSizingMode=n.w?'FIXED':'AUTO';o.itemSpacing=n.gap||0;o.primaryAxisAlignItems=n.justify==='between'?'SPACE_BETWEEN':n.justify==='center'?'CENTER':'MIN';o.counterAxisAlignItems=n.align==='center'?'CENTER':'MIN';o.paddingLeft=o.paddingRight=o.paddingTop=o.paddingBottom=n.pad||0;}o.resize(n.w||100,n.h||100);if(n.layout){o.primaryAxisSizingMode=n.h?'FIXED':'AUTO';o.counterAxisSizingMode=n.w?'FIXED':'AUTO';}for(const child of n.children||[])build(child,o);}
if(n.x!==undefined){o.x=n.x;o.y=n.y;}else if(!n.w&&parent.layoutMode==='VERTICAL'){o.layoutSizingHorizontal='FILL';}
return o;}
let right=Math.max(0,...figma.currentPage.children.map(n=>n.x+n.width));const frames=[];for(const [i,d] of data.designs.entries()){const f=build(d,figma.currentPage);f.x=right+200+i*1600;f.y=200;f.clipsContent=true;frames.push(f);}figma.currentPage.selection=frames;figma.viewport.scrollAndZoomIntoView(frames);figma.closePlugin('Created 3 Forge landing concepts');`;
fs.writeFileSync(path.join(out,'figma-plugin.js'),`(async()=>{${plugin}})().catch(error=>figma.closePlugin(String(error)));`);
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({name:'Forge landing explorations',id:'forge-landing-explorations',api:'1.0.0',main:'figma-plugin.js',editorType:['figma'],documentAccess:'dynamic-page',networkAccess:{allowedDomains:['none']}},null,2));
console.log('Built three independent concepts, HTML preview, and native Figma importer.');
