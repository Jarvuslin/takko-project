import fs from 'node:fs';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const checks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4349/demo/');
 await page.screenshot({path:'docs/results/concept-demo-presentation.png',fullPage:true});
 const metadata=await page.locator('video').evaluate(video=>new Promise(resolve=>{const done=()=>resolve({duration:video.duration,width:video.videoWidth,height:video.videoHeight});if(video.readyState>=1)done();else video.addEventListener('loadedmetadata',done,{once:true});}));
 assert.ok(metadata.duration>140&&metadata.duration<143);assert.equal(metadata.width,1440);assert.equal(metadata.height,1000);checks.push('duration and dimensions');
 await page.locator('video').evaluate(async video=>{video.muted=true;await video.play();});
 await page.waitForTimeout(1200);
 assert.ok(await page.locator('video').evaluate(video=>video.currentTime>0&&!video.paused));checks.push('browser playback advances');
 await page.locator('video').evaluate(video=>video.pause());
 for(const seconds of [5,36,86,102,124]){
  await page.locator('video').evaluate((video,time)=>new Promise(resolve=>{video.addEventListener('seeked',()=>resolve(),{once:true});video.currentTime=time;}),seconds);
  await page.locator('video').screenshot({path:`docs/results/concept-demo-frame-${seconds}.png`});
 }
 checks.push('five chapter seek positions decoded');
 const links=await page.locator('a').evaluateAll(nodes=>nodes.map(n=>n.href));
 for(const url of links){const response=await page.request.head(url);assert.equal(response.status(),200);}
 checks.push('all evidence links available');assert.deepEqual(errors,[]);checks.push('no page errors');
 const output={at:new Date().toISOString(),checksPassed:checks.length,checks,metadata};
 fs.writeFileSync('docs/results/concept-demo-playback.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output));
}finally{await browser.close();}
