import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
const output=path.resolve('docs/results/opencode-fighting-live-20260924');
const control=path.resolve('.forge/opencode-fighting-live-control');
fs.mkdirSync(control,{recursive:true});
const runtime=JSON.parse(fs.readFileSync(path.join(output,'runtime.json'),'utf8'));
const origin='http://127.0.0.1:'+runtime.port;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:path.join(output,'raw'),size:{width:1440,height:1000}}});
const page=await context.newPage();
const errors:string[]=[];
page.on('pageerror',error=>{errors.push(error.message);fs.writeFileSync(path.join(output,'browser-errors.json'),JSON.stringify(errors,null,2));});
const started=Date.now();
const mark=(text:string)=>fs.appendFileSync(path.join(output,'video-timeline.jsonl'),JSON.stringify({at:new Date().toISOString(),seconds:(Date.now()-started)/1000,text})+'\n');
await page.goto(origin);
mark('Actual local test profile, current source, real providers and Studio connection. User app and settings unchanged.');
const api=async(route:string,method='GET',data?:unknown)=>{const r=await page.request.fetch(origin+'/api'+route,{method,data});const value=await r.json();if(!r.ok())throw Error(r.status()+' '+JSON.stringify(value));return value;};
let stopped=false;const stop=()=>{stopped=true;};
const execute=Object.getPrototypeOf(async function(){}).constructor;
console.log('Recording live UI '+origin);
try{while(!stopped){for(const file of fs.readdirSync(control).filter(n=>/^\d+\.js$/.test(n)).sort()){
 const result=path.join(control,file+'.result.json');if(fs.existsSync(result))continue;
 try{const value=await new execute('page','api','fs','path','output','expect','stop','mark',fs.readFileSync(path.join(control,file),'utf8'))(page,api,fs,path,output,expect,stop,mark);fs.writeFileSync(result,JSON.stringify({ok:true,value},null,2));}
 catch(e){mark('Automation action failed: '+String(e));fs.writeFileSync(result,JSON.stringify({ok:false,error:String(e)},null,2));}
}await new Promise(r=>setTimeout(r,500));}}
finally{mark('Recording ended');fs.writeFileSync(path.join(output,'browser-errors.json'),JSON.stringify(errors,null,2));const video=page.video()!;await context.close();await video.saveAs(path.join(output,'workflow-raw.webm'));await browser.close();}


