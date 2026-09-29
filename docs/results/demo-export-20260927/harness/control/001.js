const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
await page.goto('http://127.0.0.1:4335/?project='+id);
await page.getByRole('button',{name:'Prepare persistent proposal',exact:true}).waitFor();
await page.waitForTimeout(2500);
const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'initial-status.json'),JSON.stringify(await api('/status'),null,2));
fs.writeFileSync(path.join(output,'model-settings.json'),JSON.stringify(await api('/models'),null,2));
await page.screenshot({path:path.join(output,'01-initial.png'),fullPage:true});
return {stage:p.stage,job:p.jobId,studio:p.assetStudioId,discovery:p.assetDiscovery,text:await page.locator('body').innerText()};
