const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
const p=await api('/projects/'+id);await page.screenshot({path:path.join(output,'02-proposal-progress.png'),fullPage:true});
return {stage:p.stage,error:p.error,jobId:p.jobId,needs:p.proposal?.assetNeeds,discovery:p.assetDiscovery&&{approved:p.assetDiscovery.approved,analysisError:p.assetDiscovery.analysisError,choices:p.assetDiscovery.choices,groups:p.assetDiscovery.groups.map(g=>({id:g.id,needId:g.assetNeedId,relevance:g.relevance,error:g.error}))},text:await page.locator('body').innerText()};
