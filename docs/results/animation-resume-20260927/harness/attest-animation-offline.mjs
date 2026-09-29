import fs from 'node:fs';
import {createHash} from 'node:crypto';
const out='docs/results/animation-resume-20260927';
for(const name of ['full-check-rerun','cli-replays-complete'])if(fs.readFileSync(`${out}/${name}-exit.txt`,'utf8').trim()!=='0')throw Error(name+' did not pass');
const log=fs.readFileSync(`${out}/full-check-rerun.txt`,'utf8');
if(!log.includes('1628 passed')||!log.includes('171 passed')||!log.includes('1 skipped'))throw Error('Unexpected final counts');
const replays=fs.readFileSync(`${out}/cli-replays-complete.txt`,'utf8').trim().split(/\r?\n/).filter(l=>l.startsWith('{')).map(JSON.parse);
if(replays.length!==3||replays.some(r=>!r.passed||r.actualCost!==0))throw Error('Expected all three free replays');
const files=['src/generation/engine.ts','src/generation/component-integration.ts','src/generation/retained-animation.ts','src/generation/runtime-source-check.ts','tests/retained-animation.test.ts','tests/reviewer-reasoning.test.ts'];
fs.writeFileSync(`${out}/offline-green.json`,JSON.stringify({at:new Date().toISOString(),fullCheckExit:0,unitTests:1628,unitFiles:113,browserPassed:171,browserSkipped:1,replays,cost:0,sources:files.map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))},null,2));
console.log('Final full check and three CLI replays attested at $0');

