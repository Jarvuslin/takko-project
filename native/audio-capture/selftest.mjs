import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { buildAudioCapture } from '../../scripts/build-audio-capture.mjs';

// Native opt-in probe: only capture this script's synthetic-tone child, never Studio or the system mix.
const executable=buildAudioCapture();
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'takko-audio-'));
const children=[];
function child(args) {
  const process=spawn(executable,args,{windowsHide:true,shell:false,stdio:'pipe'});children.push(process);
  const events=[];let text='';const waiting=[];
  process.stdout.on('data',chunk=>{text+=chunk;let n;while((n=text.indexOf('\n'))>=0){const line=text.slice(0,n);text=text.slice(n+1);const event=JSON.parse(line);events.push(event);for(const check of [...waiting])check();}});
  process.stderr.on('data',()=>{});
  const wait=name=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(Error('Owned selftest child deadline exceeded')),10000);
    function finish(error,event){clearTimeout(timer);const i=waiting.indexOf(check);if(i>=0)waiting.splice(i,1);if(error)reject(error);else resolve(event);}
    function check(){const failure=events.find(event=>event.event==='error');const result=events.find(event=>event.event===name);if(failure)finish(Error(JSON.stringify(failure)));else if(result)finish(null,result);}
    waiting.push(check);check();
  });
  return{process,wait,events};
}
function level(bytes,start,end){let sum=0;for(let i=start;i<end;i++)sum+=(bytes.readInt16LE(44+i*4)/32768)**2;return Math.sqrt(sum/(end-start));}
function frequency(bytes,hz,start,end){let sin=0,cos=0;for(let i=start;i<end;i++){const value=bytes.readInt16LE(44+i*4)/32768;sin+=value*Math.sin(2*Math.PI*hz*i/44100);cos+=value*Math.cos(2*Math.PI*hz*i/44100);}return Math.hypot(sin,cos)*2/(end-start);}
try {
  const target=child(['--selftest-tone-hz','440','--duration-ms','1200']);
  const outsider=child(['--selftest-tone-hz','1760','--duration-ms','1200']);
  const identity=await target.wait('tone-ready');await outsider.wait('tone-ready');
  const output=path.join(directory,'isolated.wav');
  const capture=child(['--pid',String(identity.processId),'--started-at',identity.startedAt,'--duration-ms','2000','--output',output]);
  const ready=await capture.wait('ready');
  await new Promise(resolve=>setTimeout(resolve,300));target.process.stdin.write('START\n');outsider.process.stdin.write('START\n');
  const receipt=await capture.wait('complete');const bytes=fs.readFileSync(output);
  const from=Math.round(.55*44100),to=Math.min(Math.round(1.3*44100),receipt.frames);
  const result={ready,receipt,baselineRms:level(bytes,0,Math.min(8820,receipt.frames)),targetAmplitude:frequency(bytes,440,from,to),excludedAmplitude:frequency(bytes,1760,from,to)};
  console.log(JSON.stringify(result,null,2));
  if(result.targetAmplitude<0.01 || result.excludedAmplitude>result.targetAmplitude*.03 || result.baselineRms>0.001 || receipt.frames<44100*1.9)throw Error('Native process-isolation/timeline assertion failed');
  console.log('PASS native capture contains the target tone, excludes the other owned process tone, and retains the quiet baseline');
} finally {
  for(const process of children)if(process.exitCode===null)process.kill();
  if(path.dirname(directory)!==path.resolve(os.tmpdir())||!path.basename(directory).startsWith('takko-audio-'))throw Error('Unexpected selftest cleanup target');
  fs.rmSync(directory,{recursive:true,force:true});
}
