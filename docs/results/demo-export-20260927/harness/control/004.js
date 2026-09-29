const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'automatic-selection.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'03-automatic-selection.png'),fullPage:true});
return {text:await page.locator('body').innerText(),clips:p.assetDiscovery.groups.find(g=>g.id==='combat').options.flatMap(o=>(o.previewData?.pack?.entries??[]).map(e=>({asset:o.assetId,name:o.name,key:e.key,clipName:e.name,rig:e.clip?.rigType,animationId:e.animationId,tier:e.tier,joints:e.clip?.joints?.length}))),assessments:p.assetDiscovery.groups.find(g=>g.id==='combat').relevance};
