import fs from 'node:fs';
fs.mkdirSync('tests/fixtures',{recursive:true});
const pack=JSON.parse(fs.readFileSync('docs/results/marketplace-animation/native-pack.json','utf8'));
fs.writeFileSync('tests/fixtures/roblox-r15-dance.json',JSON.stringify(pack.entries[0].clip));
let s=fs.readFileSync('tests/marketplace-animation.test.ts','utf8').replace('r.status()','r.status').replace('"docs/results/marketplace-animation/native-pack.json"','"tests/fixtures/roblox-r15-dance.json"').replace(').entries[0].clip;',');');
fs.writeFileSync('tests/marketplace-animation.test.ts',s);
