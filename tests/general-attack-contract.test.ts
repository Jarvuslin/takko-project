import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {describe,it,expect} from 'vitest';import {animationSegments} from '../src/marketplace/animation-segments';
import capture from './fixtures/generalization/development/animation-R15-punch-animation.json';import {animationPackSchema} from '../src/marketplace/animations';import {nativeRolesSchema} from '../src/marketplace/role-capture';
const pack=animationPackSchema.parse(capture.animations),facts=nativeRolesSchema.parse(capture.snapshot.nativeRoles);
const cases=pack.entries.filter(e=>e.clip).map(e=>({name:e.name,segments:animationSegments(e.clip!,facts.sequences.find(s=>s.key===e.key),'Player punch attack').segments}));
// Explicitly selected first-action excerpt, not a claim that the complete clip has one hit.
cases.push({name:'User-selected first-action excerpt',segments:cases[0].segments.slice(0,1)});
for(const row of cases)describe(row.name,()=>{
 function run(source:string){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'takko-general-contract-'));try{
 fs.copyFileSync('tests/fixtures/asset-roles/combo-contract.luau',path.join(dir,'combo.luau'));
 const table='{'+row.segments.map(s=>`{start=${s.start},hit=${s.hit},finish=${s.end}}`).join(',')+'}';
 const file=path.join(dir,'test.luau');fs.writeFileSync(file,`local Combo=require('./combo')\nlocal segments=${table}\n${source}\nprint('passed')`);
 expect(execFileSync(path.resolve('.forge/tools/luau/luau.exe'),[file],{cwd:dir,encoding:'utf8',windowsHide:true,timeout:15000})).toContain('passed');
 }finally{if(path.dirname(fs.realpathSync(dir))!==fs.realpathSync(os.tmpdir())||!path.basename(dir).startsWith('takko-general-contract-'))throw Error('Invalid cleanup');fs.rmSync(dir,{recursive:true,force:true})}}
 it('requires a fresh edge for each action and crosses each current hit once',()=>run(`
 local c=Combo.client(segments) local now=0
 for i,s in ipairs(segments) do
  Combo.click(c,now) now+=s.finish-s.start+0.00001 Combo.tick(c,now)
  assert(#c.hits==i) Combo.tick(c,now+0.01) assert(#c.hits==i)
 end
 assert(c.index==0)
 `));
 it('bounds rapid buffering, resets after grace and cancels on death',()=>run(`
 local c=Combo.client(segments) Combo.click(c,0)
 for _=1,100 do Combo.click(c,0) end
 Combo.tick(c,segments[1].finish+0.00001)
 if #segments>1 then assert(c.index==2) Combo.tick(c,100) end
 Combo.tick(c,101) assert(c.index==0)
 local s=Combo.server(segments) Combo.click(c,102) assert(Combo.accept(s,s.nonce,1,102))
 local nonce=s.nonce Combo.death(c,s,102) assert(c.index==0 and s.nonce~=nonce and not s.alive)
 `));
 it('enforces server order, nonce, range, facing, line of sight and deduplication',()=>run(`
 local s=Combo.server(segments) local now=0
 for i,v in ipairs(segments) do
  assert(not Combo.accept(s,0,i,now)) assert(Combo.accept(s,s.nonce,i,now)) assert(not Combo.accept(s,s.nonce,i,now))
  local t={id='target',alive=true,inScope=true,distance=4,facing=1,lineOfSight=true}
  for _,field in ipairs({'alive','inScope','distance','facing','lineOfSight'}) do
   local bad=table.clone(t) bad.id=field
   if field=='distance' then bad[field]=7 elseif field=='facing' then bad[field]=0 else bad[field]=false end
   assert(not Combo.hit(s,s.nonce,s.pending.hitAt,bad,i))
  end
  assert(not Combo.hit(s,s.nonce,s.pending.hitAt-0.001,t,i))
  assert(Combo.hit(s,s.nonce,s.pending.hitAt,t,i)) assert(not Combo.hit(s,s.nonce,s.pending.hitAt,t,i))
  now=s.endAt
 end
 assert(s.counter==#segments) assert(Combo.finish(s,now))
 `));
 it('uses the same hold/resume adapter for any Animator track and stops on reset',()=>run(`
 local track={IsPlaying=false}
 function track:Play() self.IsPlaying=true end
 function track:Stop() self.IsPlaying=false end
 function track:AdjustSpeed(speed) self.speed=speed end
 local c=Combo.client(segments) Combo.playback(c,track) Combo.click(c,0)
 assert(track.IsPlaying and track.speed==1 and track.TimePosition==0)
 Combo.tick(c,segments[1].finish)
 if #segments>1 then assert(track.speed==0 and track.TimePosition==segments[1].finish) Combo.click(c,segments[1].finish+0.1) assert(track.speed==1) end
 local s=Combo.server(segments) Combo.death(c,s,1) assert(not track.IsPlaying)
 `));
});

