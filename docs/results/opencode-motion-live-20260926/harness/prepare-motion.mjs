import fs from 'node:fs';
const out='docs/results/opencode-motion-live-20260926';
if(fs.existsSync(out))throw Error('Preserve existing');
fs.mkdirSync(out+'/harness',{recursive:true});
for(const name of ['preflight','run','create','browser','reconcile']){
 let s=fs.readFileSync('.forge/step3-'+name+'.ts','utf8').replaceAll('opencode-step3-live-20260925','opencode-motion-live-20260926').replaceAll('opencode-step3-live-profile-20260925','opencode-motion-live-profile-20260926').replaceAll('opencode-step3-live-control','opencode-motion-live-control').replaceAll('fb870817-d1f2-4157-a8fa-74218dc08671','1d3b7790-0bde-45ad-a4fc-f64dfbbc66c4').replaceAll('4785332','6066664').replaceAll('$4.785332','$6.066664');
 if(name==='preflight')s=s.replace("walk('docs/results/opencode-fighting-live-20260924');\nwalk('docs/results/opencode-minimal-fighting-20260925');\nwalk('docs/results/post-plan-replay-20260925');","for(const e of fs.readdirSync('docs/results',{withFileTypes:true})) if(e.isDirectory()&&e.name!=='opencode-motion-live-20260926')walk('docs/results/'+e.name);");
 fs.writeFileSync('.forge/motion-'+name+'.ts',s); fs.writeFileSync(out+'/harness/'+name+'.ts',s);
}
fs.copyFileSync('C:/Users/7474g/.codex/attachments/1d3b7790-0bde-45ad-a4fc-f64dfbbc66c4/Pasted text.txt',out+'/user-authorization.txt');
