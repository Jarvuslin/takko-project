import fs from 'node:fs';
const old='opencode-minimal-fighting-20260925', name='opencode-step3-live-20260925';
const out=`docs/results/${name}`;
if(fs.existsSync(out))throw Error('Preserve existing evidence');
fs.mkdirSync(out+'/harness',{recursive:true});
for(const file of ['preflight','run','create','browser','reconcile']){
 let source=fs.readFileSync(`docs/results/${old}/harness/${file}.ts`,'utf8').replaceAll(old,name).replaceAll('opencode-minimal-fighting-profile-20260925','opencode-step3-live-profile-20260925').replaceAll('opencode-minimal-fighting-control','opencode-step3-live-control');
 if(file==='preflight')source=source.replace("walk('docs/results/conversation-fighting-benchmark-20260924');",`walk('docs/results/${old}');\nwalk('docs/results/post-plan-replay-20260925');`);
 if(file==='run'){
  source=source.replaceAll('6_000_000','8_000_000').replaceAll('maxAttempts:1','maxAttempts:2').replaceAll('4539380','4785332').replace('37c0bf03-dde9-4cbf-8ebb-fe99cd4189ef','fb870817-d1f2-4157-a8fa-74218dc08671');
  const start=source.indexOf(" if(p.spec&&!fs.existsSync(path.join(output,'scope-reviewed.json')))"), end=source.indexOf(" if(fs.existsSync(path.join(output,'deny-dispatch')))",start);
  if(start<0||end<0)throw Error('Scope hold not located');
  source=source.slice(0,start)+source.slice(end);
 }
 if(file==='create'){
  source=source.replace(/const request='[^']*';/,`const request='A fighting game where the player punches a stationary target dummy. Include a punching animation, a punch/hit sound when the player hits the dummy, and an on-screen counter that increments on each successful hit.';`);
  source=source.slice(0,source.indexOf('const browser='));
 }
 if(file==='reconcile')source=source.replaceAll('6000000','8000000').replaceAll('4539380','4785332').replaceAll('$6 cumulative cap','$8 cumulative cap').replace('Automatic retries, fallback models and paid repair disabled.','One bounded correction is allowed. Terminal retries, fallback models and paid repair are disabled.').replaceAll('$4.539380','$4.785332');
 fs.writeFileSync(`.forge/step3-${file}.ts`,source);
 fs.writeFileSync(`${out}/harness/${file}.ts`,source);
}
fs.copyFileSync('C:/Users/7474g/.codex/attachments/fb870817-d1f2-4157-a8fa-74218dc08671/Pasted text.txt',out+'/user-authorization.txt');
fs.writeFileSync(out+'/studio-before.json',JSON.stringify({at:new Date().toISOString(),studioId:'ca13ff86-472b-4f75-82a8-b2300a2d1b76',placeId:122588481889475,running:false,scripts:[],scopes:[]},null,2));
console.log(out);
