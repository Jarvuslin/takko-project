import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createOpenCodeBackend} from '../src/generation/opencode-runtime';
import {windowsCredentialVault} from '../src/generation/credential-vault';
const output=path.resolve('docs/results/opencode-motion-live-20260926');
if(fs.existsSync(path.join(output,'preflight.json')))throw Error('Fresh run preflight already completed');
fs.mkdirSync(output,{recursive:true});
const raw=fs.readFileSync('.env','utf8').split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')).join('\n');
const expected='FORGE_OPENCODE_BINARY=D:/RobloxProjects/Roblox Gen/.forge/tools/opencode-1.18.31/opencode.exe';
if(raw!==expected)throw Error('.env does not contain exactly the authorized non-secret setting');
const ignored=execFileSync('git',['check-ignore','.env'],{encoding:'utf8'}).trim()==='.env';
if(!ignored)throw Error('.env must be ignored');
process.loadEnvFile('.env');
const binary=process.env.FORGE_OPENCODE_BINARY!;
createOpenCodeBackend(binary).preflight();
const sha256=createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
const version=execFileSync(binary,['--version'],{encoding:'utf8',timeout:30000}).trim();
if(version!=='1.18.31')throw Error('Unexpected binary version');
const vaultFile=path.join(process.env.APPDATA!,'Forge Desktop/provider-keys.dpapi');
const key=windowsCredentialVault(vaultFile)!.read()['openrouter|https://openrouter.ai/api/v1'];
if(!key)throw Error('No saved OpenRouter credential');
const balance:any={at:new Date().toISOString()};
for(const endpoint of ['key','credits']){
 const r=await fetch('https://openrouter.ai/api/v1/'+endpoint,{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!r.ok)throw Error('Balance '+endpoint+' HTTP '+r.status);
 const {data}=await r.json();
 balance[endpoint]=endpoint==='key'?{limit:data.limit,remaining:data.limit_remaining,usage:data.usage}:{totalCredits:data.total_credits,totalUsage:data.total_usage,remaining:data.total_credits-data.total_usage};
}
fs.writeFileSync(path.join(output,'balance-before.json'),JSON.stringify(balance,null,2));
const protectedFiles:any[]=[];
function walk(dir:string){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else protectedFiles.push({path:p,sha256:createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}}
for(const e of fs.readdirSync('docs/results',{withFileTypes:true})) if(e.isDirectory()&&e.name!=='opencode-motion-live-20260926')walk('docs/results/'+e.name);
fs.writeFileSync(path.join(output,'protected-before.json'),JSON.stringify(protectedFiles,null,2));
const preflight={at:new Date().toISOString(),envExists:true,envGitignored:ignored,envOnlyAuthorizedPath:true,envMtime:fs.statSync('.env').mtime.toISOString(),binary,sha256,version,preflight:'passed',paidCalls:0};
fs.writeFileSync(path.join(output,'preflight.json'),JSON.stringify(preflight,null,2));
console.log(JSON.stringify({preflight,balance,protectedFiles:protectedFiles.length}));
