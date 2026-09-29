import fs from 'node:fs';
let s=fs.readFileSync('.forge/integrated-preserve-results.mjs','utf8').replaceAll('.forge/integrated-check-before/results','.forge/marketplace-animation-before/results').replaceAll('integrated-workspace/final-check','marketplace-animation/full1-artifacts');fs.writeFileSync('.forge/animation-preserve-full1.mjs',s);
