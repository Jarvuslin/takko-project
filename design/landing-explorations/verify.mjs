import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.woff2')?'font/woff2':'text/html; charset=utf-8');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch();
const report=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
 for(let i=1;i<=3;i++){
  await page.goto(`http://127.0.0.1:${server.address().port}/design/landing-explorations/index.html?concept=${i}`);
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const frame=document.querySelector('.screen').getBoundingClientRect();
   const bad=[...document.querySelectorAll('.screen .text')].filter(n=>{const b=n.getBoundingClientRect();return b.left<frame.left-1||b.right>frame.right+1||b.bottom>frame.bottom+1||b.top<frame.top-1}).map(n=>n.textContent);
   const clipped=[...document.querySelectorAll('.screen .text')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>n.textContent);
   return {overflow:bad,clipped,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)};
  });
  await page.screenshot({path:`design/landing-explorations/concept-${i}.png`});
  report.push({concept:i,...result});
  assert.deepEqual(result.overflow,[],`Concept ${i} text outside frame`);
  assert.deepEqual(result.clipped,[],`Concept ${i} text clipping`);
  for(const family of ['Saira Condensed','EB Garamond','JetBrains Mono'])assert.ok(result.fonts.includes(family),`${family} did not load`);
 }
 fs.writeFileSync('design/landing-explorations/verification.json',JSON.stringify(report,null,2));
 console.log('PASS: 3 concepts, all font families loaded, no clipped or out-of-frame text. PNG previews saved.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
