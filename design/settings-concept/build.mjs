import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const dir=path.dirname(fileURLToPath(import.meta.url))
const require=createRequire(import.meta.url)
const sharp=require('C:/Users/7474g/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const logo=(await fs.readFile(path.join(dir,'../../public/takko.svg'),'utf8')).replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'')
const C={bg:'#111110',side:'#161615',surface:'#1D1D1B',line:'#32322F',text:'#F1F0EB',muted:'#A4A49D',quiet:'#777971',green:'#A4CAA6'}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const rect=(x,y,w,h,fill=C.surface,r=0,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`
const text=(x,y,s,size=14,fill=C.text,weight=400)=>`<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`
const line=(x,y,w)=>`<path d="M${x} ${y}h${w}" stroke="${C.line}"/>`
const mark=(x,y,size=32)=>`<g transform="translate(${x} ${y}) scale(${size/80})">${logo}</g>`
const paths={plus:'M12 5v14M5 12h14',search:'m20 20-4-4M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',home:'m4 10 8-7 8 7v10h-6v-7h-4v7H4Z',models:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',routing:'M5 4v16m0-8h9m0-8v16m0-16 5 4-5 4m0 4 5 4-5 4',budget:'M4 6h16v14H4zM4 6V4h13m-2 9h5',arrow:'M12 19V5m-6 6 6-6 6 6',chevron:'m8 10 4 4 4-4',close:'m6 6 12 12M6 18 18 6',back:'m14 5-7 7 7 7',check:'m5 12 4 4 10-10',more:'M5 12h.1M12 12h.1M19 12h.1',link:'m10 14 4-4m-5 8-1 1a4 4 0 0 1-6-6l5-5m10-2 1-1a4 4 0 0 1 6 6l-5 5'}
const icon=(name,x,y,size=20,color=C.muted)=>`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.models}"/></svg>`
let hits=[]
const hit=(x,y,w,h,label,to)=>{if(to)hits.push({x,y,w,h,label,to})}
const button=(x,y,w,label,to,primary=false)=>{hit(x,y,w,38,label,to);return rect(x,y,w,38,primary?'#F1F0EB':'#242422',19,primary?'none':C.line)+text(x+16,y+24,label,13,primary?'#151513':C.text,600)}
const field=(x,y,w,label,value,extra='')=>text(x,y,label,13,C.muted)+rect(x,y+12,w,44,'#151514',10,C.line)+text(x+14,y+40,value,14)+extra
const badge=(x,y,label,color=C.green)=>rect(x,y,Math.max(58,label.length*6.5+20),25,'#242824',13)+text(x+10,y+17,label,11,color)
const search=(x,y,w,label='Search models...')=>rect(x,y,w,40,'#171716',20,C.line)+icon('search',x+13,y+11,18)+text(x+42,y+25,label,13,C.muted)
const provider=(x,y,abbr,color='#DDD5C7')=>rect(x,y,36,36,'#292926',10)+text(x+8,y+24,abbr,14,color,600)
const nav=(active)=>{
 let s=rect(0,0,1280,800,C.bg)+rect(0,0,208,800,C.side)+mark(23,20,34)+text(67,45,'takko',25,C.text,600)
 s+=button(16,88,176,'+  New project','home')+icon('search',25,150,18)+text(54,165,'Search projects',13,C.muted)
 s+=text(25,221,'WORKSPACE',10,C.quiet,600)
 for(const [i,id,label] of [[0,'home','Projects'],[1,'models','Models'],[2,'routing','Routing'],[3,'budget','Budget']]){
 const y=237+i*48; hit(16,y,176,40,label,id);s+=rect(16,y,176,40,active===id?'#2A2A27':C.side,10)+icon(id==='home'?'home':id,27,y+10)+text(58,y+26,label,14,active===id?C.text:C.muted,active===id?600:400)
 }
 s+=icon('models',27,438)+text(58,454,'Marketplace',14,C.muted)+text(25,515,'RECENT',10,C.quiet,600)+text(25,549,'Moonlight obby',13,C.muted)+text(25,586,'Tiny town',13,C.muted)+text(25,740,'Local workspace',12,C.muted)+text(25,764,'Studio not connected',11,C.quiet)
 return s+text(250,38,'Workspace',12,C.muted)+text(332,38,'/',12,C.quiet)+text(350,38,active==='home'?'New project':active[0].toUpperCase()+active.slice(1),12)+text(250,778,'DESIGN PROPOSAL / ILLUSTRATIVE MODELS, PRICES AND SESSION STATES',9,C.quiet)
}
const heading=(title,sub)=>text(272,113,title,30,C.text,600)+text(272,143,sub,14,C.muted)
const tabs=active=>{
 let s='';for(const [i,label,id] of [[0,'My models','models'],[1,'Providers','providers']]){let x=272+i*121;hit(x,177,110,36,label,id);s+=rect(x,177,110,36,active===id?'#2A2A27':C.bg,18)+text(x+18,200,label,13,active===id?C.text:C.muted,600)}return s
}
const bottom=(label,to,status='Unsaved changes')=>line(272,688,944)+text(272,729,status,12,C.muted)+button(1080,706,136,label,to,true)
const modelRows=()=>{
 let s='';const rows=[['B','Everyday','OpenRouter · example/balanced','Planner, review'],['F','Fast builder','OpenRouter · example/fast','Builder, repair'],['R','Deep review','Anthropic · example/reasoning','Fallback']]
 for(let i=0;i<rows.length;i++){const y=315+i*95;const[a,b,c,d]=rows[i];s+=provider(286,y,a)+text(337,y+15,b,15,C.text,600)+text(337,y+38,c,12,C.muted)+text(750,y+22,d,12,C.muted)+badge(981,y+7,'Ready')+button(1090,y+2,96,'Edit',['profile-settings','profile-fast','profile-review'][i])+line(286,y+69,900)}return s
}
const pages={}
function page(id,title,draw,back){hits=[];const body=draw();pages[id]={id,title,body,hits:[...hits],back}}
page('home','01 / A quieter home',()=>nav('home')+mark(706,144,58)+text(492,263,'What do you want to build?',34,C.text,600)+text(575,296,'Start with an idea. Make it yours.',15,C.muted)+rect(370,347,750,154,'#1D1D1B',25,C.line)+text(397,387,'Describe your game...',17,C.muted)+button(390,444,120,'+  Assets',undefined)+button(707,444,188,'Routing · Custom','routing')+button(908,444,143,'Budget · $2','run-budget')+button(1062,444,40,'↑','run-budget',true)+button(465,535,151,'Build an obby','home')+button(630,535,159,'Make an arena','home')+button(804,535,183,'Create a cozy world','home')+text(590,644,'Plan it. Build it. Test it in Studio.',13,C.quiet))
page('models','02 / Models: short, searchable rows',()=>nav('models')+heading('Models','Your model library. Open a profile only when you need to change it.')+tabs('models')+button(1080,92,136,'+  Add model','add-model',true)+search(272,244,660)+button(956,245,260,'All providers  ⌄',undefined)+text(287,300,'3 MODELS',10,C.quiet,600)+modelRows()+text(286,658,'Need another provider?',13,C.muted)+button(457,634,164,'View providers','providers'))
page('providers','03 / Providers: connector-style directory',()=>{
 let s=nav('models')+heading('Models','Connect a provider, then choose the models you want to use.')+tabs('providers')+search(742,176,310,'Search providers...')+button(1068,177,148,'+  Custom','custom-provider',true)+text(286,266,'AVAILABLE PROVIDERS',11,C.muted,600)
 const data=[['OR','OpenRouter','One catalog, multiple model families.','Manage','#D7D1EC'],['O','OpenAI','Connect an OpenAI account key.','Connect','#E4E3DB'],['A','Anthropic','Use a direct Anthropic connection.','Manage','#E8B58D'],['G','Google Gemini','Connect Google AI models.','Connect','#A5BADD'],['<>','Compatible endpoint','Local servers and compatible APIs.','Connect','#B5D0B9']]
 data.forEach((a,i)=>{const x=286+(i%2)*475,y=302+Math.floor(i/2)*106;s+=provider(x,y,a[0],a[4])+text(x+52,y+12,a[1],15,C.text,600)+text(x+52,y+36,a[2],12,C.muted)+button(x+343,y,95,a[3],['connect-provider','connect-openai','connect-anthropic','connect-gemini','custom-provider'][i])+line(x,y+76,438)})
 return s+text(286,684,'Connections last for this app session. Reconnect after restarting Takko.',12,C.muted)
})
page('routing','04 / Routing: one job per row',()=>{
 let s=nav('routing')+heading('Routing','Choose which model handles each part of a generation.')+button(1028,92,188,'Use one model for all','all-routes')+rect(272,182,944,66,'#1D1D1B',14)+text(292,209,'Research before planning',14,C.text,600)+text(292,231,'Find game references. Research usage counts toward the budget.',12,C.muted)+rect(1140,201,48,27,'#E7E7DC',14)+`<circle cx="1174" cy="214.5" r="10" fill="#242421"/>`
 s+=text(292,288,'STAGE',10,C.quiet,600)+text(580,288,'PRIMARY MODEL',10,C.quiet,600)+text(873,288,'FALLBACK',10,C.quiet,600)
 const rows=[['Research','Collect references','Use planner','None'],['Planner / lead','Turn the idea into a plan','Everyday','Deep review'],['Builder','Write the game','Fast builder','Everyday'],['Reviewer','Check the result','Everyday','Deep review'],['Repair','Fix issues found in review','Fast builder','Everyday']]
 rows.forEach((r,i)=>{let y=315+i*66;s+=text(292,y+10,r[0],14,C.text,600)+text(292,y+30,r[1],11,C.muted)+text(580,y+17,r[2],14)+text(873,y+17,r[3],13,C.muted)+button(1100,y-5,96,'Change',['edit-research','edit-planner','edit-route','edit-reviewer','edit-repair'][i])+line(292,y+47,904)})
 return s+text(292,666,'Fallbacks are tried in order after a provider failure or rejected output.',12,C.muted)+bottom('Save routing','routing')
})
page('budget','05 / Budget: generation and project limits',()=>{
 let s=nav('budget')+heading('Budget','Set your spending limits once. Adjust a generation before it starts.')
 s+=rect(272,185,944,157,C.surface,16)+text(296,221,'Default limits',17,C.text,600)+field(296,257,430,'Per generation','$ 2.00')+field(758,257,430,'Per project','$ 10.00')
 s+=text(296,370,'Includes research, planning, building, review and repairs.',13,C.muted)
 s+=rect(272,402,944,137,C.surface,16)+text(296,434,'Moonlight obby',15,C.text,600)+text(296,465,'Spent',12,C.muted)+text(296,497,'$0.60',25)+text(585,465,'Reserved',12,C.muted)+text(585,497,'$0.40',25)+text(913,465,'Available',12,C.muted)+text(913,497,'$9.00',25)
 s+=text(272,579,'Automatic repair rounds',14,C.text,600)+text(272,603,'Repairs use the same generation limit.',12,C.muted)+button(1090,567,126,'2 rounds  ⌄','budget')+text(272,652,'Unsettled usage stays reserved until its cost is known.',12,C.muted)
 return s+bottom('Save budget','budget')
})
const modal=(baseId,title,sub,w=568,h=610)=>{
 const x=(1280-w)/2,y=(800-h)/2
 hits=[];hit(0,0,1280,y,'Close dialog',baseId);hit(0,y,x,h,'Close dialog',baseId);hit(x+w,y,1280-x-w,h,'Close dialog',baseId);hit(0,y+h,1280,800-y-h,'Close dialog',baseId)
 return {x,y,w,h,s:pages[baseId].body+rect(0,0,1280,800,'#000000') .replace('fill="#000000"','fill="#000000" opacity=".68"')+rect(x,y,w,h,'#1A1A18',22,'#3D3D37')+text(x+28,y+47,title,23,C.text,600)+text(x+28,y+73,sub,13,C.muted)+button(x+w-63,y+17,38,'×',baseId)}
}
page('add-model','06 / Add model: focused catalog dialog',()=>{
 const m=modal('models','Add a model','Choose a connected provider and search its catalog.',660,640);let{x,y,s}=m
 s+=button(x+28,y+94,206,'OpenRouter  ⌄','connect-provider')+button(x+431,y+94,200,'Enter model ID','manual-model')+search(x+28,y+149,604,'Search the model catalog...')
 const rows=[['Balanced','A general-purpose model profile','Selected'],['Fast','A smaller model for quicker iterations','Select'],['Reasoning','A model profile for deeper review','Select']]
 rows.forEach((r,i)=>{let yy=y+218+i*86;s+=provider(x+28,yy,r[0][0])+text(x+80,yy+12,r[0],15,C.text,600)+text(x+80,yy+34,r[1],12,C.muted)+button(x+528,yy,104,r[2],'add-model')+line(x+28,yy+65,604)})
 return s+text(x+28,y+503,'Rates will be filled when the provider publishes them.',12,C.muted)+text(x+28,y+527,'Review unknown rates before generating.',12,C.muted)+line(x,y+560,660)+button(x+366,y+580,104,'Cancel','models')+button(x+482,y+580,150,'Add to library','models',true)
},'models')
page('connect-provider','07 / Connect provider: one compact form',()=>{
 const m=modal('providers','Connect OpenRouter','Add access for the models you choose.',536,484);let{x,y,s}=m
 s+=field(x+28,y+122,480,'API key','Paste API key')+text(x+28,y+204,'Kept in this local app session. Cleared on restart.',12,C.muted)+button(x+28,y+239,480,'Advanced · endpoint settings  ⌄','custom-provider')+text(x+28,y+314,'Connecting loads the catalog. It does not generate a game.',12,C.muted)+line(x,y+404,536)+button(x+230,y+426,108,'Cancel','providers')+button(x+350,y+426,158,'Connect provider','providers',true)
 return s
},'providers')
page('edit-route','08 / Edit route: a focused side panel',()=>{
 hits=[];hit(0,0,768,800,'Close route editor','routing');let s=pages.routing.body+rect(0,0,1280,800,'#000').replace('fill="#000"','fill="#000" opacity=".65"')+rect(768,0,512,800,'#1B1B19',0,C.line)
 s+=text(800,55,'Builder route',24,C.text,600)+button(1215,24,38,'×','routing')+text(800,85,'Choose the models that write your game.',13,C.muted)+field(800,144,448,'Primary model','Fast builder  ⌄')+field(800,237,448,'Fallback 1','Everyday  ⌄')+field(800,330,448,'Fallback 2','None  ⌄')+text(800,423,'Fallbacks are tried in this order.',13,C.text)+text(800,450,'They share the same generation and project limits.',12,C.muted)+button(800,493,170,'+  Add a model','add-model')+line(768,714,512)+button(973,739,107,'Cancel','routing')+button(1092,739,156,'Save route','routing',true)
 return s
},'routing')
page('profile-settings','09 / Model profile: edit only one model',()=>{
 const m=modal('models','Edit model','Everyday · OpenRouter',596,684);let{x,y,s}=m
 s+=field(x+28,y+112,540,'Profile name','Everyday')+field(x+28,y+197,540,'Model ID','example/balanced')+field(x+28,y+282,254,'Input / 1M tokens','$ 0.50')+field(x+310,y+282,258,'Output / 1M tokens','$ 1.50')+text(x+28,y+362,'Configured estimates. Check against provider billing.',12,C.muted)+field(x+28,y+405,254,'Max output tokens','8192')+field(x+310,y+405,258,'Request timeout','Default')+text(x+28,y+502,'Request JSON mode',14)+rect(x+514,y+483,48,26,'#E7E7DC',13)+`<circle cx="${x+548}" cy="${y+496}" r="10" fill="#242421"/>`+button(x+28,y+536,210,'Connection settings','connect-provider')+line(x,y+604,596)+button(x+302,y+627,108,'Cancel','models')+button(x+422,y+627,146,'Save model','models',true)
 return s
},'models')
page('run-budget','10 / Composer budget: adjust just this generation',()=>{
 const m=modal('home','This generation','Set a limit before you start.',536,486);let{x,y,s}=m
 s+=field(x+28,y+122,480,'Maximum spend','$ 2.00')+button(x+28,y+202,101,'$0.50','run-budget')+button(x+141,y+202,101,'$1.00','run-budget')+button(x+254,y+202,101,'$2.00','run-budget')+text(x+28,y+285,'New project',14,C.text,600)+text(x+28,y+311,'$10.00 available in the new project budget.',13,C.muted)+text(x+28,y+347,'Includes research, generation, review and repairs.',12,C.muted)+line(x,y+406,536)+button(x+228,y+429,108,'Cancel','home')+button(x+348,y+429,160,'Use this limit','home',true)
 return s
},'home')

const coreIds=Object.keys(pages)
for(const [id,title,desc] of [['edit-research','Research','Collect references before planning.'],['edit-planner','Planner / lead','Turn your idea into a clear plan.'],['edit-reviewer','Reviewer','Check the generated result.'],['edit-repair','Repair','Fix issues found in review.']]) {
 pages[id]={...pages['edit-route'],id,title:title+' route',body:pages['edit-route'].body.replace('Builder route',title+' route').replace('Choose the models that write your game.',desc)}
}
page('all-routes','Use one model for all stages',()=>{const m=modal('routing','Use one model for all','Apply one primary model across the generation.',536,340);let{x,y,s}=m;return s+field(x+28,y+120,480,'Model','Everyday  ⌄')+text(x+28,y+204,'Existing fallbacks stay in place.',13,C.muted)+button(x+232,y+271,108,'Cancel','routing')+button(x+352,y+271,156,'Apply to all','routing',true)},'routing')
page('custom-provider','Compatible endpoint',()=>{const m=modal('providers','Compatible endpoint','Connect a local server or compatible API.',568,574);let{x,y,s}=m;return s+field(x+28,y+122,512,'Connection name','Local models')+field(x+28,y+207,512,'Base URL','http://127.0.0.1:1234/v1')+field(x+28,y+292,512,'API key · optional for local servers','Paste API key if required')+text(x+28,y+393,'Remote endpoints must use HTTPS.',12,C.muted)+text(x+28,y+420,'Keys last for this app session only.',12,C.muted)+button(x+265,y+500,108,'Cancel','providers')+button(x+385,y+500,155,'Connect','providers',true)},'providers')
pages['manual-model']={...pages['profile-settings'],id:'manual-model',title:'Add model by ID',body:pages['profile-settings'].body.replace('Edit model','Add model by ID').replace('Everyday · OpenRouter','Enter the exact ID published by your provider.').replace('Save model','Add model')}

for(const [id,provider] of [['connect-openai','OpenAI'],['connect-anthropic','Anthropic'],['connect-gemini','Google Gemini']])pages[id]={...pages['connect-provider'],id,title:'Connect '+provider,body:pages['connect-provider'].body.replace('Connect OpenRouter','Connect '+provider)}
for(const [id,name,model] of [['profile-fast','Fast builder','fast'],['profile-review','Deep review','reasoning']])pages[id]={...pages['profile-settings'],id,title:'Edit '+name,body:pages['profile-settings'].body.replaceAll('Everyday',name).replaceAll('example/balanced','example/'+model)}
pages['profile-review'].body=pages['profile-review'].body.replace('Deep review · OpenRouter','Deep review · Anthropic');pages['profile-review'].hits=pages['profile-review'].hits.map(h=>h.label==='Connection settings'?{...h,to:'connect-anthropic'}:h)
const wrap=(s,w=1280,h=800)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${s}</svg>`
await fs.mkdir(dir,{recursive:true})
let overview=rect(0,0,2704,4630,'#0C0D0C')+text(48,63,'TAKKO / A SIMPLER WORKSPACE',15,'#CFBA8D',600)+text(48,115,'One place for each decision.',40,C.text,600)+text(48,152,'Home → Models / Providers → Routing → Budget. Focused dialogs handle the details.',18,C.muted)
let i=0
for(const p of Object.values(pages)){
 await fs.writeFile(path.join(dir,p.id+'.svg'),wrap(p.body))
 await sharp(Buffer.from(wrap(p.body))).png().toFile(path.join(dir,p.id+'.png'))
 if(!coreIds.includes(p.id))continue
 const x=48+(i%2)*1328,y=230+Math.floor(i/2)*876
 overview+=text(x,y-18,p.title,17,C.text,600)+`<g id="screen-${p.id}" transform="translate(${x} ${y})">${p.body}</g>`;i++
}
overview+=text(48,4610,'PROPOSAL: per-generation caps and provider grouping need implementation. Current app behavior is unchanged.',14,C.muted)
await fs.writeFile(path.join(dir,'takko-settings-flow.svg'),wrap(overview,2704,4630))
await sharp(Buffer.from(wrap(overview,2704,4630))).resize({width:1352}).png().toFile(path.join(dir,'takko-settings-flow.png'))
const appendixHeight=230+Math.ceil((Object.keys(pages).length-coreIds.length)/2)*876+36
let appendix=rect(0,0,2704,appendixHeight,'#0C0D0C')+text(48,66,'TAKKO / DIALOG VARIANTS',16,'#CFBA8D',600)+text(48,117,'The right detail, at the right time.',38,C.text,600)+text(48,157,'Stage-specific route editors, bulk routing, compatible endpoints and manual model entry.',17,C.muted)
let j=0
for(const p of Object.values(pages).filter(p=>!coreIds.includes(p.id))){const x=48+(j%2)*1328,y=230+Math.floor(j/2)*876;appendix+=text(x,y-18,p.title,17,C.text,600)+`<g id="screen-${p.id}" transform="translate(${x} ${y})">${p.body}</g>`;j++}
await fs.writeFile(path.join(dir,'takko-settings-dialogs.svg'),wrap(appendix,2704,appendixHeight))
await sharp(Buffer.from(wrap(appendix,2704,appendixHeight))).resize({width:1352}).png().toFile(path.join(dir,'takko-settings-dialogs.png'))
await fs.writeFile(path.join(dir,'screens.json'),JSON.stringify(Object.values(pages).map(({body,...p})=>p),null,2))
await fs.writeFile(path.join(dir,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Takko · Settings prototype</title><style>*{box-sizing:border-box}body{margin:0;background:#080908;color:#eee;font:13px 'Segoe UI',sans-serif}header{height:48px;display:flex;align-items:center;gap:18px;padding:0 22px}header span{color:#a9aba3}select{margin-left:auto;background:#222;color:#eee;border:1px solid #444;border-radius:7px;padding:7px}main{position:relative;width:min(100%,1280px,calc((100dvh - 100px)*1.6));margin:0 auto;aspect-ratio:1280/800}img{display:block;width:100%}main button{position:absolute;border:0;background:transparent;cursor:pointer}main button:focus-visible{outline:2px solid #bedaff;border-radius:8px}main button:hover{background:#ffffff09;border-radius:9px}footer{padding:16px;text-align:center;color:#888}button[aria-label^="Close dialog"],button[aria-label^="Close route"]{border-radius:0}</style><header><b>Takko / click-through prototype</b><span>Mock data. No connections, saves or generation calls.</span><select aria-label="Preview screen"></select></header><main></main><footer>Use the sidebar and buttons to explore. Form fields are visual examples. Escape closes a dialog.</footer><script type="module">const pages=await(await fetch('screens.json')).json();const select=document.querySelector('select');for(const p of pages){const o=new Option(p.title,p.id);select.add(o)}select.onchange=()=>location.hash=select.value;function render(){const p=pages.find(p=>p.id===location.hash.slice(1))||pages[0];select.value=p.id;const main=document.querySelector('main');main.replaceChildren();const img=new Image();img.src=p.id+'.svg';img.alt=p.title;main.append(img);for(const h of p.hits){const b=document.createElement('button');b.setAttribute('aria-label',h.label);b.style.cssText='left:'+h.x/12.8+'%;top:'+h.y/8+'%;width:'+h.w/12.8+'%;height:'+h.h/8+'%';b.onclick=()=>location.hash=h.to;main.append(b)}document.title=p.title+' · Takko'}addEventListener('hashchange',render);addEventListener('keydown',e=>{if(e.key==='Escape'){const p=pages.find(p=>p.id===location.hash.slice(1));if(p?.back)location.hash=p.back}});render();</script></html>`)
console.log('Built '+Object.keys(pages).length+' screen states, two Figma boards and click-through prototype.')
